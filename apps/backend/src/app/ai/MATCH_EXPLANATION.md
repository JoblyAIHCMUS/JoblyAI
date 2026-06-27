# Hybrid Match Explanation System

## Overview

The Hybrid Match Explanation System evaluates how well a candidate matches a job posting by combining two scoring approaches: **Exact Keyword Matching** (30%) and **Semantic Embedding Matching** (70%). The system produces a deterministic, explainable score with per-requirement justification.

---

## Scoring Architecture

```
Final Score = (Requirement Score × 0.6) + (Experience Score × 0.4)
```

### Requirement Score (60% weight)

The requirement score is calculated differently based on the scoring mode:

| Mode | Formula |
|------|---------|
| **Hybrid** | `exactPercentage × 0.3 + embeddingPercentage × 0.7` |
| **Exact Only** | `exactPercentage` (100%) |
| **Embedding Only** | `embeddingPercentage` (100%) |

### Experience Score (40% weight)

```
Experience Score = Alignment Multiplier × (Base Score + Quality Boosters)
```

---

## The 5-Phase Scoring Pipeline

### Phase 1: Experience Tier (Logarithmic Growth Curve)

Determines the candidate's base score based on total years of experience.

| Years | Tier | Label | Base Score |
|-------|------|-------|------------|
| 0–1 | 1 | Fresher | 40 pts |
| 1–2.9 | 2 | Junior | 65 pts |
| 3–4.9 | 3 | Senior | 85 pts |
| 5–7.9 | 4 | Long-term Senior | 100 pts |
| 8+ | 5 | Master / Lead | 110 pts |

**Formula:** Logarithmic curve that rewards early growth heavily, then tapers at mastery level.

### Phase 2: Alignment Matrix

Prevents absurd placements (e.g., Fresher applying for Lead role) via a distance-based multiplier.

```
Distance = Candidate Tier − Job Tier
```

| Distance | Scenario | Multiplier |
|----------|----------|------------|
| 0 | Perfect match | 1.0× |
| −1 | Slight stretch | 0.85× |
| ≤ −2 | Grossly underqualified | 0.3× |
| +1 | Slight overqualification | 1.0× (no penalty) |
| +2 | Moderate overqualification | 0.7× |
| ≥ +3 | Grossly overqualified | 0.4× |

**Job Tier Derivation:** Combined from job requirements (max `minYearsExperience`) + LLM classification of job title/description.

### Phase 3: Quality Boosters (LLM-Based)

Extracts contextual signals from the resume using the Gemini LLM.

| Category | Max Points | Detection Method |
|----------|------------|------------------|
| Project Type | 20 | LLM: enterprise/industrial vs personal/indie |
| Scale | 15 | LLM: high-traffic apps, complex architecture |
| Leadership | 15 | LLM: direct management, mentorship, sole contributor |

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
|--------------------------------|-------|
| ≥ 2× requirement | 100 |
| ≥ 1.5× requirement | 90 |
| ≥ 1× requirement | 80 |
| ≥ 0.75× requirement | 60 |
| ≥ 0.5× requirement | 40 |
| < 0.5× requirement | 20 |

#### Step 2: Embedding Fallback (if no exact match)

```
embeddingMatch(skillEmbedding, resumeEmbedding) → { similarity, matched }
```

- Generates 768-dim vector for the skill requirement
- Computes cosine similarity with resume embedding
- Matched if similarity > 0.5 (50%)

**Score:** `similarity × 100`

#### Step 3: Importance Weighting

| Importance | Weight |
|------------|--------|
| REQUIRED | 3× |
| PREFERRED | 2× |
| OPTIONAL | 1× |

**Per-requirement score** = `rawScore × importanceWeight`

#### Step 4: Status Determination

| Score Range | Status |
|-------------|--------|
| ≥ 80 | `strong_match` |
| ≥ 60 | `match` |
| ≥ 30 | `partial` |
| < 30 | `no_match` |

### Phase 5: Final Score Calculation

```typescript
// Calculate exact-only percentage (only exact matches)
exactPercentage = (exactMatchScores / maxExactScores) × 100

// Calculate embedding percentage (exact + embedding matches)
embeddingPercentage = (embeddingMatchScores / maxEmbeddingScores) × 100

// Hybrid: 30% exact + 70% embedding
requirementPercentage = exactPercentage × 0.3 + embeddingPercentage × 0.7

// Final: 60% requirements + 40% experience
finalScore = requirementPercentage × 0.6 + experienceScore × 0.4
```

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

| Requirement | Exact Score | Embedding Score | Importance | Weighted |
|-------------|-------------|-----------------|------------|----------|
| React.js | 80 (4yr ≥ 2yr) | N/A (exact found) | REQUIRED (3×) | 240 |
| TypeScript | 80 (3yr ≥ 1yr) | N/A (exact found) | REQUIRED (3×) | 240 |
| GraphQL | 0 (not found) | 62 (similarity) | PREFERRED (2×) | 124 |

**Exact percentage:** (240 + 240) / (300 + 300) × 100 = **80%**
**Embedding percentage:** (240 + 240 + 124) / (300 + 300 + 200) × 100 = **78%**
**Hybrid requirement score:** 80 × 0.3 + 78 × 0.7 = **78.6%**

**Experience:** 4 years → Tier 3 (Senior, 85 pts) + Quality Boosters (+35) = 120 pts
**Alignment:** Job Tier 3, Candidate Tier 3, Distance 0, Multiplier 1.0×
**Experience Score:** 1.0 × (85 + 35) = **120**

**Final Score:** 78.6 × 0.6 + 120 × 0.4 = **47.2 + 48 = 95/100**

---

## When Scores Are Calculated

| Trigger | Action |
|---------|--------|
| Application created | Calculate all 3 scores (exact, embedding, hybrid) |
| Resume re-uploaded | Recalculate for all applications using that resume |
| Job posting updated | Clear explanations; recalculated on next access |
| Employer clicks "Recalculate" | Fresh calculation on demand |

---

## Toggle Behavior

The employer can switch between scoring modes in the explanation drawer:

- **Hybrid** (default): 30% exact + 70% embedding
- **Exact Only**: Only exact keyword matches count
- **Embedding Only**: Only semantic similarity counts

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

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/matching/application/:id/explanation` | Fetch stored explanation |
| POST | `/matching/application/:id/recalculate` | Re-run calculation |

---

## Frontend Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `MatchExplanationButton` | `components/employer/` | Icon button on applicant cards |
| `MatchExplanationDrawer` | `components/employer/` | Side panel with full breakdown + toggle |
