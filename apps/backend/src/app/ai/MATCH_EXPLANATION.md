# Match Explanation System

## Overview

The Match Explanation System evaluates how well a candidate matches a job posting by combining **Hard-Constraint Compliance** (binary: meets/doesn't meet requirement) and **Semantic Embedding Matching** (cosine similarity). The system produces a deterministic, explainable breakdown with per-requirement justification.

---

## Scoring Architecture

No combined final score. The system shows:

1. **Experience Years** — raw career span (no tiers, no multipliers)
2. **Per-Requirement Breakdown** — hard constraint status + embedding similarity for each requirement

---

## The Scoring Pipeline

### Step 1: Calculate Experience Years

Determines the candidate's career span from work experience.

```
Career Span = (latest end date - earliest start date) / 12
```

- Education keywords (student, intern, university, etc.) are filtered out
- Only counted from work experience entries

### Step 2: Per-Requirement Matching

For each `JobRequirement` in the job posting:

#### Hard-Constraint Compliance (Binary)

```
checkHardConstraint(candidateSkills, experience) → boolean
```

- Checks candidate's skills table by name (case-insensitive)
- Handles combined names: "JavaScript/TypeScript" → ["javascript", "typescript"]
- Falls back to scanning experience descriptions for skill mentions
- If `minYearsExperience` is set, checks that candidate meets the year requirement

**Result:** `true` (met) or `false` (not met)

#### Embedding Similarity (Cosine)

```
embeddingSkillMatch(skillText, requirementText) → { similarity, matched }
```

- Finds the candidate skill matching by name
- Builds a short focused text: `"Node.js 5 years Expert"`
- Generates embeddings for both the candidate skill text and the job requirement text
- Computes cosine similarity between the two (short vs short comparison)
- Matched if similarity > 0.5 (50%)

**Result:** `similarity` (0.0 to 1.0)

#### Status Determination

| Condition           | Status         |
| ------------------- | -------------- |
| Hard constraint met | `strong_match` |
| Similarity > 0.5    | `match`        |
| Similarity > 0.3    | `partial`      |
| Otherwise           | `no_match`     |

---

## What's NOT Used (Removed)

The following components were removed because they had no evidence-based justification:

| Component              | Why Removed                                   |
| ---------------------- | --------------------------------------------- |
| Exact match scoring    | Years-based thresholds (60/95/85/75/55/35/15) |
| Importance weighting   | REQUIRED=3×, PREFERRED=2×, OPTIONAL=1×        |
| Experience tiers       | 40/65/85/100/110 base scores                  |
| Alignment matrix       | Multiplier logic (1.0/0.85/0.3/0.7/0.4)       |
| Quality boosters       | LLM-based (project type, scale, leadership)   |
| Job tier derivation    | LLM classification of job seniority           |
| Final formula          | ReqScore × 0.6 + ExpScore × 0.4               |
| Status thresholds      | 80/60/30 score cutoffs                        |
| Hybrid/exact/embedding | Toggle between scoring modes                  |

---

## Example Output

**Job Requirements:**

- React.js (REQUIRED, 2 years min)
- TypeScript (REQUIRED, 1 year min)
- GraphQL (PREFERRED)

**Candidate Profile:**

- 4 years React.js (ADVANCED level)
- 3 years TypeScript
- No GraphQL (but REST API experience — 62% semantic similarity)

**Output:**

```
Experience: 4.0 years

Requirements:

● React.js (Required)
  ✓ Hard constraint met
  Similarity: 85%
  "React.js hard constraint met — skill is present in candidate's profile."

● TypeScript (Required)
  ✓ Hard constraint met
  Similarity: 80%
  "TypeScript hard constraint met — skill is present in candidate's profile."

● GraphQL (Preferred)
  ✗ Hard constraint not met
  Similarity: 62%
  "GraphQL hard constraint not met, but has 62% semantic similarity..."
```

---

## When Scores Are Calculated

| Trigger                       | Action                                             |
| ----------------------------- | -------------------------------------------------- |
| Application created           | Calculate explanation                              |
| Resume re-uploaded            | Recalculate for all applications using that resume |
| Job posting updated           | Clear explanations; recalculated on next access    |
| Employer clicks "Recalculate" | Fresh calculation on demand                        |

---

## Data Flow

```
Application Created
  → Fetch: job.requirements, candidateSkills, candidateExperience
  → Calculate career span years
  → Per-Requirement: hard constraint check + embedding similarity
  → Store: Application.matchExplanation (JSON)
```

---

## API Endpoints

| Method | Route                                   | Purpose                  |
| ------ | --------------------------------------- | ------------------------ |
| GET    | `/matching/application/:id/explanation` | Fetch stored explanation |
| POST   | `/matching/application/:id/recalculate` | Re-run calculation       |

---

## Frontend Components

| Component                | Location               | Purpose                               |
| ------------------------ | ---------------------- | ------------------------------------- |
| `MatchExplanationButton` | `components/employer/` | Icon button on applicant cards        |
| `MatchExplanationDrawer` | `components/employer/` | Near full-screen modal with breakdown |
