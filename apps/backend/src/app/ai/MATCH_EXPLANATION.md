# Hybrid Match Explanation System

## Overview

The Hybrid Match Explanation System evaluates how well a candidate matches a job posting by combining two scoring approaches: **Exact Keyword Matching** and **Semantic Embedding Matching**. Both scores are computed independently for every requirement, and the scoring mode determines which score is used. The system produces a deterministic, explainable score with per-requirement justification.

---

## Scoring Architecture

```
Final Score = (Requirement Score × 0.6) + (Experience Score × 0.4)
```

### Requirement Score (60% weight)

The requirement score is calculated differently based on the scoring mode:

| Mode               | Formula                                                       |
| ------------------ | ------------------------------------------------------------- |
| **Hybrid**         | Per-requirement: use exact if found, else embedding           |
| **Exact Only**     | Uses exactScore per requirement (0 if no exact match)         |
| **Embedding Only** | Uses embeddingScore per requirement (0 if no embedding match) |

### Experience Score (40% weight)

```
Experience Score = Alignment Multiplier × (Base Score + Quality Boosters)
```

---

## The 5-Phase Scoring Pipeline

### Phase 1: Experience Tier (Logarithmic Growth Curve)

Determines the candidate's base score based on total years of experience.

| Years | Tier | Label            | Base Score |
| ----- | ---- | ---------------- | ---------- |
| 0–1   | 1    | Fresher          | 40 pts     |
| 1–2.9 | 2    | Junior           | 65 pts     |
| 3–4.9 | 3    | Senior           | 85 pts     |
| 5–7.9 | 4    | Long-term Senior | 100 pts    |
| 8+    | 5    | Master / Lead    | 110 pts    |

**Formula:** Logarithmic curve that rewards early growth heavily, then tapers at mastery level.

### Phase 2: Alignment Matrix

Prevents absurd placements (e.g., Fresher applying for Lead role) via a distance-based multiplier.

```
Distance = Candidate Tier − Job Tier
```

| Distance | Scenario                   | Multiplier        |
| -------- | -------------------------- | ----------------- |
| 0        | Perfect match              | 1.0×              |
| −1       | Slight stretch             | 0.85×             |
| ≤ −2     | Grossly underqualified     | 0.3×              |
| +1       | Slight overqualification   | 1.0× (no penalty) |
| +2       | Moderate overqualification | 0.7×              |
| ≥ +3     | Grossly overqualified      | 0.4×              |

**Job Tier Derivation:** Combined from job requirements (max `minYearsExperience`) + LLM classification of job title/description.

### Phase 3: Quality Boosters (LLM-Based)

Extracts contextual signals from the resume using the Gemini LLM.

| Category     | Max Points | Detection Method                                     |
| ------------ | ---------- | ---------------------------------------------------- |
| Project Type | 20         | LLM: enterprise/industrial vs personal/indie         |
| Scale        | 15         | LLM: high-traffic apps, complex architecture         |
| Leadership   | 15         | LLM: direct management, mentorship, sole contributor |

**Total possible boosters:** 50 points (added to alignment-adjusted base).

Each booster includes a quoted evidence string from the resume for transparency.

### Phase 4: Per-Requirement Matching

For each `JobRequirement` in the job posting:

#### Step 1: Exact Match

```
exactMatch(candidateSkills, experience) → { found, candidateYears, matchedFrom }
```

- Checks candidate's skills table by name (case-insensitive)
- Falls back to scanning experience descriptions for skill mentions
- Returns years of experience and level if matched

**Score based on years vs requirement:**

| Candidate Years vs Requirement | Score |
| ------------------------------ | ----- |
| No minYears requirement        | 60    |
| ≥ 2× requirement               | 95    |
| ≥ 1.5× requirement             | 85    |
| ≥ 1× requirement               | 75    |
| ≥ 0.75× requirement            | 55    |
| ≥ 0.5× requirement             | 35    |
| < 0.5× requirement             | 15    |

#### Step 2: Embedding Match (always computed)

```
embeddingMatch(skillEmbedding, requirementEmbedding) → { similarity, matched }
```

- Finds the candidate skill matching by name
- Builds a short focused text: `"Node.js 5 years Expert"`
- Generates embeddings for both the candidate skill text and the job requirement text
- Computes cosine similarity between the two (short vs short comparison)
- Matched if similarity > 0.5 (50%)

**Score:** `similarity × 100`

Both exact and embedding scores are computed independently for every requirement. This allows the scoring mode to select the appropriate score:

- **Exact mode:** Uses `exactScore` per requirement (0 if no exact match)
- **Embedding mode:** Uses `embeddingScore` per requirement (0 if no embedding match)
- **Hybrid mode:** Uses `exactScore` if exact match found, otherwise `embeddingScore`

#### Step 3: Importance Weighting

| Importance | Weight |
| ---------- | ------ |
| REQUIRED   | 3×     |
| PREFERRED  | 2×     |
| OPTIONAL   | 1×     |

**Per-requirement score** = `rawScore × importanceWeight`

#### Step 4: Status Determination

| Score Range | Status         |
| ----------- | -------------- |
| ≥ 80        | `strong_match` |
| ≥ 60        | `match`        |
| ≥ 30        | `partial`      |
| < 30        | `no_match`     |

### Phase 5: Final Score Calculation

```typescript
// Unified denominator: ALL requirements always contribute
totalMaxScore = sum(100 × importanceWeight) for all requirements

// Exact percentage: sum of exactScore / max for ALL requirements
exactPercentage = (sum of exactScores / totalMaxScore) × 100

// Embedding percentage: sum of embeddingScore / max for ALL requirements
embeddingPercentage = (sum of embeddingScores / totalMaxScore) × 100

// Hybrid: use exact if available, else embedding per requirement
hybridTotal = sum(exactMatch.found ? exactScore : embeddingScore) for each requirement
requirementPercentage = (hybridTotal / totalMaxScore) × 100

// Final: 60% requirements + 40% experience
finalScore = requirementPercentage × 0.6 + experienceScore × 0.4
```

All 3 scores (exact, embedding, hybrid) are pre-computed and stored — toggle is instant with no API call.

---

## Example Calculation

**Job Requirements:**

- React.js (REQUIRED, 2 years min)
- TypeScript (REQUIRED, 1 year min)
- GraphQL (PREFERRED)

**Candidate Profile:**

- 4 years React.js (ADVANCED level)
- 3 years TypeScript
- No GraphQL (but REST API experience — 62% semantic similarity)

**Calculation:**

| Requirement | Exact Score    | Embedding Score | Importance     | Exact Weighted | Embed Weighted |
| ----------- | -------------- | --------------- | -------------- | -------------- | -------------- |
| React.js    | 75 (4yr ≥ 2yr) | 85 (similarity) | REQUIRED (3×)  | 225            | 255            |
| TypeScript  | 75 (3yr ≥ 1yr) | 80 (similarity) | REQUIRED (3×)  | 225            | 240            |
| GraphQL     | 0 (not found)  | 62 (similarity) | PREFERRED (2×) | 0              | 124            |

**Exact percentage:** 450 / 800 × 100 = **56.3%**
**Embedding percentage:** 619 / 800 × 100 = **77.4%**
**Hybrid (exact if found, else embedding):** (225 + 225 + 124) / 800 × 100 = **70.8%**

**Experience:** 4 years → Tier 3 (Senior, 85 pts) + Quality Boosters (+35) = 120 pts
**Alignment:** Job Tier 3, Candidate Tier 3, Distance 0, Multiplier 1.0×
**Experience Score:** 1.0 × (85 + 35) = **120**

**Final Score:** 70.8 × 0.6 + 120 × 0.4 = **42.5 + 48 = 90/100**

---

## When Scores Are Calculated

| Trigger                       | Action                                             |
| ----------------------------- | -------------------------------------------------- |
| Application created           | Calculate all 3 scores (exact, embedding, hybrid)  |
| Resume re-uploaded            | Recalculate for all applications using that resume |
| Job posting updated           | Clear explanations; recalculated on next access    |
| Employer clicks "Recalculate" | Fresh calculation on demand                        |

---

## Toggle Behavior

The employer can switch between scoring modes in the explanation drawer:

- **Hybrid** (default): Uses exact score if exact match found, otherwise embedding score per requirement
- **Exact Only**: Only exact keyword matches count (embedding contributions = 0)
- **Embedding Only**: Only semantic similarity counts (exact contributions = 0)

All 3 scores are pre-computed and stored — toggle is instant with no API call.

---

## Data Flow

```
Application Created
  → Fetch: resume.parsedText, job.requirements, candidate.profile
  → Phase 1: Experience Tier (deterministic)
  → Phase 2: Alignment Matrix (deterministic)
  → Phase 3: Quality Boosters (LLM call to Gemini)
  → Phase 4: Per-Requirement Matching (exact + embedding)
  → Phase 5: Composite Score
  → Store: Application.matchExplanation (JSON)
  → Update: Application.matchPercentage
```

---

## API Endpoints

| Method | Route                                   | Purpose                  |
| ------ | --------------------------------------- | ------------------------ |
| GET    | `/matching/application/:id/explanation` | Fetch stored explanation |
| POST   | `/matching/application/:id/recalculate` | Re-run calculation       |

---

## Frontend Components

| Component                | Location               | Purpose                                 |
| ------------------------ | ---------------------- | --------------------------------------- |
| `MatchExplanationButton` | `components/employer/` | Icon button on applicant cards          |
| `MatchExplanationDrawer` | `components/employer/` | Side panel with full breakdown + toggle |
