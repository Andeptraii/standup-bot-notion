# Tasks: [Feature Name]

## Estimated Total Time: [X–Y minutes]

## Task Overview

[Brief summary of what needs to be built and the sequence of work]

## Tasks

- [ ] **TASK-XXX**: [Short, imperative description of the task] `src/path/to/file.js`
  - Requirement: [Reference to US-XX or AC-XX from requirements]
  - Files: [Exact files to create or modify, max 3]
  - Outcome: [One testable result that completes this task]
  - Est. time: [15–30 min]

- [ ] **TASK-YYY**: [Next task] `src/path/to/file.js`
  - Requirement: [Reference]
  - Files: [File paths]
  - Outcome: [Testable result]
  - Est. time: [15–30 min]

(Add 3–10 atomic tasks; each task should be completable by one developer in 15–30 minutes)

## Dependency Map

```
TASK-XXX ──→ TASK-YYY  (YYY depends on XXX)
TASK-AAA ──→ TASK-BBB
        └──→ TASK-CCC   (both depend on AAA)
```

[Show which tasks must complete before others; identify parallelization opportunities]

## Testing Strategy

- [Unit test strategy: what should be tested, how to verify]
- [Integration test strategy: mocked vs. real dependencies]
- [Manual verification steps: how to confirm the feature works end-to-end]
