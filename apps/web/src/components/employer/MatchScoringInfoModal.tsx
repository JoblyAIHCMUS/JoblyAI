'use client';

import { Modal, ModalHeader, ModalBody } from '@/components/ui/modal';

interface MatchScoringInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Sparse, individually-verifiable source list. Each entry is rendered as
// its own <li> in the Sources section so the user can check any of them
// independently. Order: academic → industry documentation → industry
// deployment → general explainer.
const SOURCES = [
  {
    reference:
      'Rajesh, D. B. & Kumar, A. (2025). "Collaborative filtering models: ' +
      'an experimental and detailed comparative study." Scientific Reports ' +
      '(Nature), 15, 31667. DOI: 10.1038/s41598-025-15096-4. — ' +
      '"This is the most popular and widely used similarity metric." ' +
      '(Rajesh & Kumar, 2025, on cosine similarity)',
    label: 'View on PubMed Central',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12391434/',
  },
  {
    reference:
      'OpenAI. (2025). "Vector embeddings." OpenAI API Documentation. ' +
      '— "We use the cosine similarity between the embedding vectors of the ' +
      'query and each document."',
    label: 'OpenAI Embeddings Guide',
    url: 'https://platform.openai.com/docs/guides/embeddings',
  },
  {
    reference:
      'Linden, G., Smith, B. & York, J. (2003). "Amazon.com Recommendations: ' +
      'Item-to-Item Collaborative Filtering." IEEE Internet Computing, ' +
      '7(1), 76–80. — "It\'s possible to compute the similarity between ' +
      'two items in various ways, but a common method is to use the cosine ' +
      'measure we described earlier, in which each vector corresponds to an ' +
      'item rather than a customer." (Linden, Smith & York, 2003)',
    label: 'View paper (PDF)',
    url: 'https://www.cs.umd.edu/~samir/498/Amazon-Recommendations.pdf',
  },
  {
    reference:
      'IBM. (n.d.). "Cosine Similarity." IBM Think — General-audience ' +
      'explainer of the cosine-similarity formula.',
    label: 'IBM Think — Cosine Similarity',
    url: 'https://www.ibm.com/think/topics/cosine-similarity',
  },
];

export function MatchScoringInfoModal({
  isOpen,
  onClose,
}: MatchScoringInfoModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl" zIndex={110}>
      <ModalHeader onClose={onClose} />
      <ModalBody>
        <h2
          className="text-xl font-bold text-slate-900"
          style={{ fontFamily: 'var(--family-primary)' }}
        >
          How match scoring works
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Two scoring modes are available: <strong>Embedding</strong> (semantic
          similarity) and <strong>Exact Match</strong> (string matching).
        </p>

        <div className="mt-5 space-y-5 text-sm text-slate-700">
          {/* EMBEDDING MODE */}
          <Section title="1. Embedding Model" badge="Embedding mode">
            <p>
              Skill names are converted into numeric vectors using{' '}
              <strong>Google Gemini Embedding 2</strong> with the{' '}
              <code>RETRIEVAL_DOCUMENT</code> task type. These vectors capture
              semantic meaning — for example, &quot;React&quot; and
              &quot;ReactJS&quot; produce nearly identical vectors, while
              &quot;React&quot; and &quot;Marketing&quot; are far apart.
            </p>
            <p className="mt-2 text-xs text-tertiary">
              Each skill is embedded as a{' '}
              <strong>768-dimensional vector</strong>. The requirement is
              embedded using the bare skill name (e.g. &quot;JavaScript&quot;) —
              no years or experience context is added to the embedding input.
            </p>
          </Section>

          <Section title="2. Per-Skill Similarity" badge="Embedding mode">
            <p>
              For each job requirement, the requirement&apos;s skill name is
              embedded and compared against <em>every</em> candidate skill
              embedding using cosine similarity. The <strong>highest</strong>{' '}
              score across all candidate skills is used.
            </p>
            <div className="my-2 rounded-md bg-slate-100 px-3 py-2 font-mono text-xs">
              <strong>Example:</strong>
              <br />
              Job requires: &quot;JavaScript&quot;
              <br />
              Candidate skills: React, TypeScript, Node.js
              <br />
              <br />
              &quot;JavaScript&quot; vs &quot;React&quot; → 0.72
              <br />
              &quot;JavaScript&quot; vs &quot;TypeScript&quot; → 0.85
              <br />
              &quot;JavaScript&quot; vs &quot;Node.js&quot; → 0.45
              <br />
              <br />
              Best match: TypeScript (0.85) ← used as score
            </div>
          </Section>

          <Section title="3. Cosine Similarity" badge="Embedding mode">
            <p>
              Measures the angle between two vectors. In this product scores
              range from <strong>0</strong> to <strong>1</strong>:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong>1</strong> — identical meaning (e.g., &quot;React&quot;
                vs &quot;ReactJS&quot;)
              </li>
              <li>
                <strong>0</strong> — unrelated (e.g., &quot;React&quot; vs
                &quot;Marketing&quot;)
              </li>
            </ul>
            <div className="my-2 rounded-md bg-slate-100 px-3 py-2 font-mono text-xs">
              cosine(a, b) = (a · b) / (||a|| × ||b||)
            </div>
            <p className="text-xs font-semibold text-tertiary">
              Per-requirement scores are clamped at 0 — no penalty for unrelated
              skills. (The raw cosine formula can in theory be negative, but the
              backend clamps negative values to 0 before any score is surfaced
              to the UI, so users only ever see 0 to 1.)
            </p>
          </Section>

          <Section title="4. Overall Score" badge="Embedding mode">
            <p>
              The average of all per-requirement cosine similarities, scaled to
              a percentage. Range: <strong>0%</strong> to <strong>100%</strong>.
            </p>
            <div className="my-2 rounded-md bg-slate-100 px-3 py-2 font-mono text-xs">
              overallScore = (Σ similarity_i / n) × 100
            </div>
            <p className="text-xs text-tertiary">
              Each requirement&apos;s score is the highest similarity to any of
              the candidate&apos;s skills (see step 2 — that&apos;s the MAX over
              candidate skills). The overall score is the simple mean of those
              per-requirement maxima — not a max-over-max.
            </p>
          </Section>

          {/* EXACT MATCH MODE */}
          <Section title="5. Exact Match Score" badge="Exact match mode">
            <p>
              The percentage of requirements where the hard constraint is met —
              i.e., the skill name is found in the candidate&apos;s skills,
              experience descriptions, or parsed resume text.
            </p>
            <div className="my-2 rounded-md bg-slate-100 px-3 py-2 font-mono text-xs">
              exactMatchScore = (metRequirements / totalRequirements) × 100
            </div>
          </Section>

          {/* BOTH MODES */}
          <Section
            title="6. Hard Constraint Check"
            badge="Both modes — badge trigger"
          >
            <p>
              A multi-layer string-matching algorithm that checks two data
              sources:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong>Profile</strong> — skills and work history the candidate
                entered manually
              </li>
              <li>
                <strong>Resume</strong> — text extracted from the uploaded PDF
              </li>
            </ul>
            <p className="mt-2">
              Layers run in order, stopping at the first match:
            </p>
            <ol className="mt-2 list-decimal space-y-2 pl-5">
              <li>
                <strong>Profile — Structured skills (parts)</strong>
                <br />
                Splits compound skills like &quot;JavaScript/TypeScript&quot;
                into individual parts. Exact case-insensitive match against the
                candidate&apos;s skills list. If <code>minYears</code> is set,
                validates years of experience.
              </li>
              <li>
                <strong>Profile — Structured skills (full name)</strong>
                <br />
                Checks the unsplit compound name as one string (e.g.,{' '}
                &quot;javascript/typescript&quot;).
              </li>
              <li>
                <strong>Profile — Experience descriptions</strong>
                <br />
                Word-boundary regex (<code>\b...\b</code>) against each
                experience entry&apos;s <code>jobTitle</code> +{' '}
                <code>description</code>. Calculates years from{' '}
                <code>startDate</code> to <code>endDate</code> and validates
                against <code>minYears</code>.
              </li>
              <li>
                <strong>Resume — Parsed resume text</strong>
                <br />
                Suffix-aware matching (e.g., &quot;React&quot; matches
                &quot;ReactJS&quot;, &quot;Node.js&quot; matches
                &quot;NodeJS&quot;).
              </li>
            </ol>
            <div className="my-3 rounded-md bg-slate-100 px-3 py-2 font-mono text-xs">
              <strong>Example:</strong>
              <br />
              Job requires: &quot;JavaScript&quot; (minYears: 2)
              <br />
              Candidate skills: React, TypeScript, Node.js
              <br />
              Experience: Software Engineer (2020–2024)
              <br />
              Description: &quot;Built full-stack apps using <u>JavaScript</u>,
              React, and Node.js&quot;
              <br />
              <br />
              Layer 1: &quot;javascript&quot; in [react, typescript, node.js]? →
              No (different skills)
              <br />
              Layer 2: Compound name match? → No
              <br />
              Layer 3: <code>/\bjavascript\b/i</code> in description? → Yes.
              Years: 4 ≥ 2 → ✅
            </div>
          </Section>

          <Section title="7. Career Span" badge="Both modes">
            <p>
              Calculated from the earliest work start date to the latest work
              end date. Education, internships, and freelance entries are
              excluded via keyword filtering (student, intern, university,
              etc.).
            </p>
          </Section>

          <Section
            title="8. How this explanation was generated"
            badge="Service"
          >
            <p>
              The breakdown above is produced by{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
                MatchExplanationService
              </code>{' '}
              in the backend, which:
            </p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>
                Fetches the job requirements, candidate skills, and parsed
                resume.
              </li>
              <li>
                Generates a Gemini Embedding 2 vector for each candidate skill
                (batched, 768 dimensions).
              </li>
              <li>
                For each requirement: checks the hard constraint (4 layers
                described in section 6), then runs cosine similarity between the
                requirement embedding and <em>every</em> candidate skill
                embedding, taking the maximum.
              </li>
              <li>
                Computes the overall score as the mean of all per-requirement
                maxima (see section 4).
              </li>
              <li>
                Persists the result in{' '}
                <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
                  Application.matchExplanation
                </code>{' '}
                (JSON) along with{' '}
                <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
                  matchPercentage
                </code>{' '}
                and{' '}
                <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
                  scoringMode
                </code>
                .
              </li>
            </ol>
            <p className="mt-3">
              The result is cached and reused on subsequent views. The cache is
              automatically invalidated when the scoring mode changes, when the
              resume is re-uploaded, or when the job posting is updated. You can
              also force a fresh calculation with the{' '}
              <strong>Recalculate</strong> button above.
            </p>
          </Section>

          <Section title="Sources" badge="References">
            <p className="text-xs text-slate-600">
              Each reference below can be opened and verified independently.
            </p>
            <ul className="mt-3 space-y-4">
              {SOURCES.map((src) => (
                <li key={src.url}>
                  <p className="text-xs leading-relaxed text-slate-700">
                    {src.reference}
                  </p>
                  <SourceLink label={src.label} url={src.url} />
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </ModalBody>
    </Modal>
  );
}

function Section({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        {badge && (
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
            {badge}
          </span>
        )}
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function SourceLink({
  label,
  url,
  reference,
}: {
  label?: string;
  url: string;
  reference?: string;
}) {
  return (
    <p className="mt-2 text-xs text-tertiary">
      Source:{' '}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[var(--ai-accent)] underline"
        title={reference}
      >
        {label || reference || url}
      </a>
    </p>
  );
}
