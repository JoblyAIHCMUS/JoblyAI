#!/usr/bin/env node
// Stand-in for `pnpm audit` that uses OSV.dev (a free, public vulnerability
// database) instead of the retired npm /security/audits endpoints.
//
// Why this exists:
//   npm permanently retired the audit endpoints that pnpm 10.x still calls
//   (/-/npm/v1/security/audits and /-/npm/v1/security/audits/quick — both
//   now return HTTP 410). pnpm 11 switched to the new bulk endpoint, but
//   this workspace is pinned to pnpm 10 (see .github/workflows/*.yml).
//   So we query OSV.dev's querybatch API directly, which doesn't need
//   any authentication and is the same source GitHub's Dependabot uses.
//
// Usage: node scripts/audit.mjs [--audit-level=low|moderate|high|critical]
//                                 [--prod|-P] [--dev|-D]
//                                 [--json] [--ignore-errors]
//                                 [--no-cache]
//
// Exit code is non-zero if any advisory at or above the audit level is found,
// or if an OSV query fails (unless --ignore-errors is set).

import { readFile, writeFile, stat, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const args = process.argv.slice(2);
let auditLevel = 'low';
let prodOnly = false;
let devOnly = false;
let asJson = false;
let ignoreErrors = false;
let noCache = false;
for (const arg of args) {
  if (arg === '--prod' || arg === '-P') prodOnly = true;
  else if (arg === '--dev' || arg === '-D') devOnly = true;
  else if (arg === '--json') asJson = true;
  else if (arg === '--ignore-errors' || arg === '--ignore-registry-errors')
    ignoreErrors = true;
  else if (arg === '--no-cache') noCache = true;
  else if (arg.startsWith('--audit-level='))
    auditLevel = arg.slice('--audit-level='.length);
  else if (arg === '--help' || arg === '-h') {
    console.log(
      [
        'Usage: node scripts/audit.mjs [options]',
        '',
        'Options:',
        '  --audit-level <low|moderate|high|critical>  Minimum severity to report (default: low)',
        '  --prod, -P                                  Only audit production dependencies',
        '  --dev, -D                                   Only audit development dependencies',
        '  --json                                      Output report as JSON',
        '  --ignore-errors                             Exit 0 even if the OSV API fails',
        '  --no-cache                                  Bypass the on-disk OSV cache',
        '  --help, -h                                  Show this help',
      ].join('\n')
    );
    process.exit(0);
  } else {
    console.error(`Unknown argument: ${arg}`);
    process.exit(2);
  }
}

const SEVERITY_ORDER = ['info', 'low', 'moderate', 'high', 'critical'];
const minIdx = SEVERITY_ORDER.indexOf(auditLevel);
if (minIdx === -1) {
  console.error(`Invalid --audit-level: ${auditLevel}`);
  process.exit(2);
}
if (prodOnly && devOnly) {
  console.error('Cannot pass both --prod and --dev');
  process.exit(2);
}

const OSV_QUERYBATCH = 'https://api.osv.dev/v1/querybatch';
const OSV_VULN = 'https://api.osv.dev/v1/vulns';
const CACHE_PATH = resolve(ROOT, 'node_modules', '.cache', 'osv-audit.json');
const CONCURRENCY = 8;
const BATCH_SIZE = 500;

// -- pnpm-lock.yaml parser (deliberately minimal) -----------------------------
//
// We only care about two things:
//   1. The `packages:` map  — key is 'name@version(peers)', value has
//      {resolution, dependencies, devDependencies, ...}
//   2. The `importers:` map — for each workspace, which of its
//      `dependencies` / `devDependencies` resolved to which version.
//
// Parsing YAML properly would need a dep; the lockfile format for these two
// sections is regular enough to read line-by-line with state tracking.

function parseLockfile(content) {
  const lines = content.split(/\r?\n/);

  const packages = new Map(); // key = name@version, value = {deps: Set, dev: Set, optional: Set}
  const importers = []; // [{ name, dependencies: Set<name@version>, devDependencies: Set<name@version> }]

  let section = null; // 'packages' | 'importers' | null
  let inResolution = false;
  let currentPkgKey = null;
  let currentPkgEntry = null;

  let inImporter = null; // { name, dependencies: Set, devDependencies: Set }
  let currentDepKind = null; // 'dependencies' | 'devDependencies' | 'optionalDependencies'

  function finalizePackage() {
    if (currentPkgKey && currentPkgEntry) {
      packages.set(currentPkgKey, currentPkgEntry);
    }
    currentPkgKey = null;
    currentPkgEntry = null;
    inResolution = false;
  }

  function finalizeImporter() {
    if (inImporter) importers.push(inImporter);
    inImporter = null;
    currentDepKind = null;
  }

  // Top-level section headers (no leading whitespace)
  const topLevel =
    /^(packages|importers|overrides|settings|lockfileVersion):\s*$/;
  // Package key in `packages:` block, 2-space indented.
  // Two forms appear in the lockfile:
  //   2-space-indented, single-quoted:  'name@version(peers)':
  //   2-space-indented, unquoted:        name@version(peers):     (only when name has no special chars)
  const pkgKey = /^ {2}'([^']+)':\s*$/;
  const pkgKeyUnquoted = /^ {2}([^' \t][^:\s]*?@\S+?):\s*$/;
  // Importer workspace key, 2-space indented
  const importerKey = /^ {2}'([^']+)':\s*$/;
  const importerKeyUnquoted = /^ {2}(\S+):\s*$/; // workspace paths like "." or unquoted names
  // `dependencies:` / `devDependencies:` header inside a block (4-space indent)
  const subHeader =
    /^ {4}(dependencies|devDependencies|optionalDependencies):\s*$/;
  // `  <name>:` style entry under a dep header
  const entry = /^ {6}(.*):\s*$/;
  // `resolution:` opener, 4-space indent
  const resolutionOpen = /^ {4}resolution:\s*$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const tl = topLevel.exec(line);
    if (tl) {
      finalizePackage();
      finalizeImporter();
      section = tl[1];
      continue;
    }

    if (section === 'packages') {
      // `  'name@version':` or `  name@version:` (unquoted)
      let m = pkgKey.exec(line);
      if (!m) m = pkgKeyUnquoted.exec(line);
      if (m) {
        finalizePackage();
        currentPkgKey = m[1];
        currentPkgEntry = {
          deps: new Set(),
          dev: new Set(),
          optional: new Set(),
        };
        continue;
      }
      if (currentPkgEntry) {
        const sub = subHeader.exec(line);
        if (sub) {
          if (sub[1] === 'dependencies') currentDepKind = 'deps';
          else if (sub[1] === 'devDependencies') currentDepKind = 'dev';
          else if (sub[1] === 'optionalDependencies')
            currentDepKind = 'optional';
          else currentDepKind = null;
          continue;
        }
        const ent = entry.exec(line);
        if (ent && currentDepKind) {
          const name = ent[1].trim();
          if (name) currentPkgEntry[currentDepKind].add(name);
          continue;
        }
        // package keys may have the resolution spread across lines like
        //   resolution:
        //     {
        //       integrity: sha512-...,
        //     }
        // Skip those — we don't need integrity or anything else.
        if (resolutionOpen.test(line)) {
          inResolution = true;
          continue;
        }
        if (inResolution) {
          if (line.trim() === '}') inResolution = false;
          continue;
        }
      }
      continue;
    }

    if (section === 'importers') {
      let m = importerKey.exec(line);
      if (!m) m = importerKeyUnquoted.exec(line);
      if (m) {
        finalizeImporter();
        inImporter = {
          workspace: m[1],
          dependencies: new Set(),
          devDependencies: new Set(),
        };
        continue;
      }
      if (inImporter) {
        const sub = subHeader.exec(line);
        if (sub) {
          if (sub[1] === 'dependencies') currentDepKind = 'dependencies';
          else if (sub[1] === 'devDependencies')
            currentDepKind = 'devDependencies';
          else currentDepKind = null;
          continue;
        }
        // The entry inside `dependencies:` can be either:
        //   4-space-indented, single-quoted:  'name':
        //   4-space-indented, unquoted:        name:   (only when name has no special chars)
        const entQuoted = /^ {6}'([^']+)':\s*$/.exec(line);
        const entUnquoted = /^ {6}([^' \t][^:]*?):\s*$/.exec(line);
        const ent = entQuoted ?? entUnquoted;
        if (ent && currentDepKind) {
          inImporter[currentDepKind].add(ent[1].trim());
          continue;
        }
      }
      continue;
    }
  }

  finalizePackage();
  finalizeImporter();

  return { packages, importers };
}

// `name@version(peer-deps)` → { name, version }
function splitPkgKey(key) {
  let name, versionPart;
  if (key.startsWith('@')) {
    const secondAt = key.indexOf('@', 1);
    name = key.slice(0, secondAt);
    versionPart = key.slice(secondAt + 1);
  } else {
    const atIdx = key.indexOf('@');
    name = key.slice(0, atIdx);
    versionPart = key.slice(atIdx + 1);
  }
  const parenIdx = versionPart.indexOf('(');
  const version =
    parenIdx === -1 ? versionPart : versionPart.slice(0, parenIdx);
  return { name, version };
}

// Walk the import tree from the importer's direct deps, following
// `packages[name@version].deps` to get transitive closure.
// `kind` is either 'dependencies' or 'devDependencies' for the starting set.
function expandFromImporter(packages, importer, kind) {
  const out = new Map(); // "name@version" -> {name, version}
  const queue = [];
  for (const depName of importer[kind]) {
    // The importer only stores the dep name; we need to find what version
    // the workspace pulled. We don't have that mapping directly here without
    // a second parse pass, so fall back to scanning all `packages` entries
    // for a top-level match (this is rare and only the importers section
    // has the resolved version per specifier).
    queue.push({ name: depName, version: null });
  }
  // Build a name → [version,...] index so we can do an initial pass
  // Note: pnpm-lock.yaml's `importers.<workspace>.dependencies` entries don't
  // record the resolved version, only the specifier. We have to scan all
  // installed packages and pick those referenced. For pnpm workspaces the
  // direct deps are at the top of the tree, so this is good enough.
  const byName = new Map();
  for (const key of packages.keys()) {
    const { name, version } = splitPkgKey(key);
    if (!byName.has(name)) byName.set(name, []);
    byName.get(name).push({ key, version });
  }
  // Replace queue items with resolved versions where possible
  const resolvedQueue = [];
  for (const item of queue) {
    const candidates = byName.get(item.name) ?? [];
    // If there's exactly one installed version, use it; otherwise include all
    // (conservative — pnpm usually dedupes, so there's normally one).
    if (candidates.length === 1) {
      resolvedQueue.push({
        key: candidates[0].key,
        name: item.name,
        version: candidates[0].version,
      });
    } else if (candidates.length > 1) {
      // include all installed versions of this name (conservative)
      for (const c of candidates) {
        resolvedQueue.push({ key: c.key, name: item.name, version: c.version });
      }
    }
  }

  while (resolvedQueue.length) {
    const { key, name, version } = resolvedQueue.shift();
    if (out.has(key)) continue;
    out.set(key, { name, version });
    const entry = packages.get(key);
    if (!entry) continue;
    for (const childName of entry.deps) {
      const candidates = byName.get(childName) ?? [];
      if (candidates.length === 1) {
        resolvedQueue.push({
          key: candidates[0].key,
          name: childName,
          version: candidates[0].version,
        });
      } else {
        for (const c of candidates) {
          resolvedQueue.push({
            key: c.key,
            name: childName,
            version: c.version,
          });
        }
      }
    }
  }
  return out;
}

function selectPackages(packages, importers) {
  // Default (no --prod / --dev): audit everything installed
  if (!prodOnly && !devOnly) {
    const out = new Map();
    const seen = new Set();
    for (const key of packages.keys()) {
      const { name, version } = splitPkgKey(key);
      // Dedupe on (name, version): pnpm-lock.yaml has one entry per
      // peer-deps combination, but they all resolve to the same OSV query.
      const nvKey = `${name}@${version}`;
      if (seen.has(nvKey)) continue;
      seen.add(nvKey);
      out.set(nvKey, { name, version });
    }
    return out;
  }
  // For --prod / --dev, walk importer trees
  const out = new Map();
  for (const imp of importers) {
    const kind = prodOnly ? 'dependencies' : 'devDependencies';
    const expanded = expandFromImporter(packages, imp, kind);
    for (const [k, v] of expanded) out.set(k, v);
  }
  return out;
}

// -- OSV.dev client -----------------------------------------------------------

async function loadCache() {
  if (noCache) return new Map();
  try {
    await stat(CACHE_PATH);
    const raw = await readFile(CACHE_PATH, 'utf8');
    return new Map(Object.entries(JSON.parse(raw)));
  } catch {
    return new Map();
  }
}

async function saveCache(cache) {
  if (noCache) return;
  try {
    await mkdir(dirname(CACHE_PATH), { recursive: true });
    await writeFile(
      CACHE_PATH,
      JSON.stringify(Object.fromEntries(cache), null, 2)
    );
  } catch (e) {
    console.error(`warning: could not write OSV cache: ${e.message}`);
  }
}

async function fetchVulnDetails(id, cache) {
  if (cache.has(id)) return cache.get(id);
  const res = await fetch(`${OSV_VULN}/${encodeURIComponent(id)}`);
  if (!res.ok) {
    throw new Error(`OSV vuln ${id} returned ${res.status}`);
  }
  const body = await res.json();
  cache.set(id, body);
  return body;
}

async function runWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  const runners = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (true) {
        const i = cursor++;
        if (i >= items.length) return;
        results[i] = await worker(items[i], i);
      }
    }
  );
  await Promise.all(runners);
  return results;
}

function ghsaSeverityToLevel(s) {
  if (!s) return 'unknown';
  const x = String(s).toUpperCase();
  if (x === 'CRITICAL') return 'critical';
  if (x === 'HIGH') return 'high';
  if (x === 'MODERATE' || x === 'MEDIUM') return 'moderate';
  if (x === 'LOW') return 'low';
  return 'unknown';
}

function cvssV3BaseScore(vector) {
  // CVSS:3.x/AV:X/AC:X/PR:X/UI:X/S:X/C:X/I:X/A:X
  const m =
    /CVSS:3\.[01]\/([^/]+)\/([^/]+)\/([^/]+)\/([^/]+)\/([^/]+)\/([^/]+)\/([^/]+)\/([^/]+)/.exec(
      vector
    );
  if (!m) return null;
  const [, AV, AC, PR, UI, S, C, I, A] = m;
  const avN = { N: 0.85, A: 0.62, L: 0.55, P: 0.2 };
  const acN = { L: 0.77, H: 0.44 };
  const prUN = { N: 0.85, L: 0.62, H: 0.27 };
  const prCN = { N: 0.85, L: 0.68, H: 0.5 };
  const uiN = { N: 0.85, R: 0.62 };
  const ciaN = { H: 0.56, L: 0.22, N: 0 };

  const avS = avN[AV];
  const acS = acN[AC];
  const prS = (S === 'C' ? prCN : prUN)[PR];
  const uiS = uiN[UI];
  if (avS == null || acS == null || prS == null || uiS == null) return null;
  const cS = ciaN[C] ?? 0;
  const iS = ciaN[I] ?? 0;
  const aS = ciaN[A] ?? 0;

  const iss = 1 - (1 - cS) * (1 - iS) * (1 - aS);
  let impact;
  if (S === 'U') {
    impact = 6.42 * iss;
  } else {
    impact = 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15);
  }
  if (impact <= 0) return 0;
  const exploit = 8.22 * avS * acS * prS * uiS;
  const base =
    S === 'U'
      ? Math.min(impact + exploit, 10)
      : Math.min(1.08 * (impact + exploit), 10);
  return Math.round(base * 10) / 10;
}

function scoreToSeverity(score) {
  if (score >= 9.0) return 'critical';
  if (score >= 7.0) return 'high';
  if (score >= 4.0) return 'moderate';
  if (score >= 0.1) return 'low';
  return 'info';
}

function pickSeverity(vuln) {
  const db = vuln.database_specific;
  if (db && db.severity) {
    const lvl = ghsaSeverityToLevel(db.severity);
    if (lvl !== 'unknown') return lvl;
  }
  // Fall back to CVSS V3 vector → base score
  if (Array.isArray(vuln.severity)) {
    for (const s of vuln.severity) {
      if (s.type && s.type.startsWith('CVSS_V3') && s.score) {
        const score = cvssV3BaseScore(s.score);
        if (score != null) return scoreToSeverity(score);
      }
    }
  }
  return 'unknown';
}

async function queryOsv(packages) {
  const list = [...packages.values()];
  const cache = await loadCache();

  // Step 1: querybatch to find which packages have any vulnerabilities
  const queryResults = [];
  for (let i = 0; i < list.length; i += BATCH_SIZE) {
    const batch = list.slice(i, i + BATCH_SIZE);
    const body = {
      queries: batch.map((p) => ({
        package: { name: p.name, ecosystem: 'npm' },
        version: p.version,
      })),
    };
    process.stderr.write(
      `  querying OSV for ${i + 1}-${Math.min(
        i + BATCH_SIZE,
        list.length
      )} of ${list.length} packages...\n`
    );
    let res;
    try {
      res = await fetch(OSV_QUERYBATCH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (e) {
      if (ignoreErrors) {
        console.error(`warning: OSV querybatch failed: ${e.message}`);
        return [];
      }
      throw e;
    }
    if (!res.ok) {
      if (ignoreErrors) {
        console.error(`warning: OSV querybatch returned ${res.status}`);
        return [];
      }
      throw new Error(`OSV querybatch returned ${res.status}`);
    }
    const data = await res.json();
    queryResults.push(...(data.results ?? []));
  }

  // Step 2: collect unique vuln IDs
  const uniqueIds = new Set();
  const perPackage = list.map((p, i) => {
    const vulns = queryResults[i]?.vulns ?? [];
    for (const v of vulns) uniqueIds.add(v.id);
    return { pkg: p, vulnIds: vulns.map((v) => v.id) };
  });

  // Step 3: fetch details for each unique vuln
  const vulnDetails = new Map();
  await runWithConcurrency([...uniqueIds], CONCURRENCY, async (id) => {
    try {
      const body = await fetchVulnDetails(id, cache);
      vulnDetails.set(id, body);
    } catch (e) {
      if (ignoreErrors) {
        console.error(`warning: could not fetch ${id}: ${e.message}`);
        return;
      }
      throw e;
    }
  });

  await saveCache(cache);

  // Step 4: build findings
  const findings = [];
  for (const { pkg, vulnIds } of perPackage) {
    for (const id of vulnIds) {
      const detail = vulnDetails.get(id);
      if (!detail) continue;
      const severity = pickSeverity(detail);
      findings.push({
        package: pkg,
        vulnId: id,
        severity,
        summary: detail.summary ?? detail.details ?? '',
        aliases: detail.aliases ?? [],
        references: (detail.references ?? []).map((r) => r.url).filter(Boolean),
      });
    }
  }
  return findings;
}

// -- output -------------------------------------------------------------------

const COLOR = process.stdout.isTTY
  ? {
      red: (s) => `\x1b[31m${s}\x1b[0m`,
      yellow: (s) => `\x1b[33m${s}\x1b[0m`,
      blue: (s) => `\x1b[34m${s}\x1b[0m`,
      gray: (s) => `\x1b[90m${s}\x1b[0m`,
      bold: (s) => `\x1b[1m${s}\x1b[0m`,
    }
  : {
      red: (s) => s,
      yellow: (s) => s,
      blue: (s) => s,
      gray: (s) => s,
      bold: (s) => s,
    };

function colorForSeverity(sev) {
  if (sev === 'critical' || sev === 'high') return COLOR.red;
  if (sev === 'moderate') return COLOR.yellow;
  return COLOR.blue;
}

function printHuman(findings) {
  if (findings.length === 0) {
    console.log(
      COLOR.bold('No vulnerabilities found at the configured audit level.')
    );
    return;
  }
  // group by package
  const byPkg = new Map();
  for (const f of findings) {
    const key = `${f.package.name}@${f.package.version}`;
    if (!byPkg.has(key)) byPkg.set(key, []);
    byPkg.get(key).push(f);
  }
  const sorted = [...byPkg.entries()].sort(([a], [b]) => a.localeCompare(b));
  for (const [pkg, items] of sorted) {
    const highest = items.reduce(
      (acc, f) =>
        SEVERITY_ORDER.indexOf(f.severity) > SEVERITY_ORDER.indexOf(acc)
          ? f.severity
          : acc,
      'info'
    );
    const color = colorForSeverity(highest);
    console.log(color(COLOR.bold(pkg)));
    for (const f of items.sort(
      (a, b) =>
        SEVERITY_ORDER.indexOf(b.severity) - SEVERITY_ORDER.indexOf(a.severity)
    )) {
      console.log(
        `  ${color(f.severity.toUpperCase())} ${COLOR.bold(f.vulnId)} ${
          f.summary
        }`
      );
      const ghsaLink = `https://github.com/advisories/${f.vulnId}`;
      console.log(`    More info: ${COLOR.gray(ghsaLink)}`);
    }
    console.log();
  }
  console.log(
    COLOR.bold(
      `Found ${findings.length} ${
        findings.length === 1 ? 'advisory' : 'advisories'
      } at or above "${auditLevel}" severity.`
    )
  );
}

async function main() {
  const lockfilePath = resolve(ROOT, 'pnpm-lock.yaml');
  let content;
  try {
    content = await readFile(lockfilePath, 'utf8');
  } catch (e) {
    console.error(`Could not read ${lockfilePath}: ${e.message}`);
    process.exit(2);
  }

  const { packages, importers } = parseLockfile(content);
  const selected = selectPackages(packages, importers);
  if (selected.size === 0) {
    console.error('No packages selected for audit. Nothing to do.');
    process.exit(0);
  }

  const scopeLabel = prodOnly ? 'prod' : devOnly ? 'dev' : 'all';
  process.stderr.write(
    `Auditing ${selected.size} unique ${scopeLabel} package versions against OSV.dev (audit level: ${auditLevel})...\n`
  );

  let findings;
  try {
    findings = await queryOsv(selected);
  } catch (e) {
    console.error(`OSV query failed: ${e.message}`);
    process.exit(ignoreErrors ? 0 : 2);
  }

  const filtered = findings.filter((f) => {
    const idx = SEVERITY_ORDER.indexOf(f.severity);
    return idx >= minIdx;
  });

  if (asJson) {
    console.log(JSON.stringify(filtered, null, 2));
  } else {
    printHuman(filtered);
  }

  process.exit(filtered.length > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e.stack ?? e.message ?? e);
  process.exit(2);
});
