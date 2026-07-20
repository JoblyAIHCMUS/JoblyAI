import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appJsonPath = join(__dirname, '..', 'apps', 'mobile', 'app.json');

const bump = process.argv[2] || 'patch';

const appJson = JSON.parse(readFileSync(appJsonPath, 'utf-8'));
const current = appJson.expo.version;

const parts = current.split('.').map(Number);

switch (bump) {
  case 'major':
    parts[0] += 1;
    parts[1] = 0;
    parts[2] = 0;
    break;
  case 'minor':
    parts[1] += 1;
    parts[2] = 0;
    break;
  case 'patch':
  default:
    parts[2] += 1;
    break;
}

const nextVersion = parts.join('.');
appJson.expo.version = nextVersion;

writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n', 'utf-8');

console.log(`${current} → ${nextVersion}`);
