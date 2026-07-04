'use client';

import { Modal, ModalHeader, ModalBody } from '@/components/ui/modal';

export type PreShortlistInfoKind = 'generate' | 'evaluate';

interface PreShortlistInfoModalProps {
  kind: PreShortlistInfoKind;
  isOpen: boolean;
  onClose: () => void;
}

const HARVARD_URL =
  'https://careerservices.fas.harvard.edu/resources/interviewing/';
const OPM_URL =
  'https://www.opm.gov/policy-data-oversight/assessment-and-selection/structured-interviews/guide.pdf';

const GENERATE_CRITERIA: string[] = [
  '**Mix of question types** — Technical (depth in a REQUIRED skill), behavioral (S.A.R. framework), and a "fit" or motivation question. With 3+ questions, the rest target core competencies like Critical Thinking, Learning Orientation, or Professionalism.',
  '**Probe for behavioral evidence** — Scenario questions ask for a specific Situation, Action, and Result.',
  '**Target core competencies** — Critical Thinking, Learning Orientation, Leadership, etc.',
  '**The "Airport Test"** — Questions that gauge whether a candidate is someone colleagues can work with under pressure.',
  '**Technical depth over trivia** — Ask for the analysis or approach, not just facts.',
  '**Level of interest** — Reward candidates who research the organization and the role.',
  '**Legality & professionalism** — No questions about age, race, religion, gender, disability, or personal life.',
  '**Expected-answer anchoring** — Each expected answer describes a response that "shows rather than tells" with a concrete result.',
];

const EVALUATE_CRITERIA: string[] = [
  '**Avoid rating errors** — Resist the Halo Effect and Central Tendency. Each question is judged on its own merits.',
  '**Resist contrast effects** — Evaluate this candidate strictly against the job requirements, not in comparison to other candidates.',
  '**Evidence over first impressions** — Read the full response before concluding.',
  '**Behavioral consistency** — Look for the specific actions the candidate took and the outcomes they achieved (past behavior predicts future behavior).',
  '**Focus on substance** — Judge the accuracy, relevance, and soundness of judgment, not writing style or English fluency.',
];

export function PreShortlistInfoModal({
  kind,
  isOpen,
  onClose,
}: PreShortlistInfoModalProps) {
  const isGenerate = kind === 'generate';
  const title = isGenerate
    ? 'How we generate pre-shortlist questions'
    : 'How we evaluate pre-shortlist answers';
  const intro = isGenerate
    ? 'The AI drafts screening questions for your job using a structured prompt. Here is what it is told to do:'
    : "When a candidate submits answers, the AI compares each one to your expected answer and produces an overall fit verdict. Here is what it is told to do:";
  const criteria = isGenerate ? GENERATE_CRITERIA : EVALUATE_CRITERIA;
  const source = isGenerate ? (
    <>
      This prompt takes inspiration from the{' '}
      <strong>
        Harvard University Faculty of Arts &amp; Sciences Mignone Center for
        Career Success
      </strong>{' '}
      resource on interviewing:{' '}
      <a
        href={HARVARD_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[var(--ai-accent)] underline"
      >
        {HARVARD_URL}
      </a>
    </>
  ) : (
    <>
      This prompt takes inspiration from the{' '}
      <strong>U.S. Office of Personnel Management (OPM)</strong> document{' '}
      <strong>&quot;Structured Interviews: A Practical Guide&quot;</strong>:{' '}
      <a
        href={OPM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[var(--ai-accent)] underline"
      >
        {OPM_URL}
      </a>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <ModalHeader onClose={onClose} />
      <ModalBody>
        <h2
          className="text-xl font-bold text-slate-900"
          style={{ fontFamily: 'var(--family-primary)' }}
        >
          {title}
        </h2>
        <p className="mt-2 text-sm text-slate-600">{intro}</p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-700">
          {criteria.map((line) => (
            <li key={line}>{renderBold(line)}</li>
          ))}
        </ol>
        <p className="mt-5 text-xs text-tertiary">{source}</p>
      </ModalBody>
    </Modal>
  );
}

function renderBold(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, idx) =>
    idx % 2 === 1 ? <strong key={idx}>{part}</strong> : <span key={idx}>{part}</span>
  );
}
