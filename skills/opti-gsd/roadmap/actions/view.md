# View Existing Roadmap

Display the current roadmap with live phase status from state.json.

## Step 1: Load State

Read `.opti-gsd/state.json` and `.opti-gsd/roadmap.md`.

## Step 2: Display Roadmap with Status

Render the roadmap with current status annotations for each phase:

```markdown
# Roadmap: v1.0

## Phase 1: Authentication [COMPLETE]
- Requirements: AUTH-01, AUTH-02, AUTH-03
- Success: User can register, login, logout, reset password

## Phase 2: Dashboard [IN PROGRESS - Task 3/5]
- Requirements: DASH-01, DASH-02
- Success: User sees personalized dashboard with stats

## Phase 3: Settings [PENDING]
- Requirements: USER-01, USER-02
- Success: User can manage profile and preferences

## Phase 4: Payments [PENDING]
- Requirements: PAY-01, PAY-02
- Success: User can subscribe and manage billing

---
Progress: 1/4 phases complete (25%)
Current: Phase 2, Task 3
Next action: /opti-gsd:execute to continue
```

## Context Budget

~5%
