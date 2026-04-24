# Tasks: Summary Table Format

## Estimated Total Time: 100–120 minutes

## Task Overview

Convert the standup summary format from toggle + bullet blocks to a Notion table with 4 columns. The work follows test-driven development (TDD): write failing tests first, then implement to make them pass. Tasks are organized by dependency: tests first, then helpers, then main implementation, then spec documentation.

## Tasks

- [x] **TASK-T01**: Write failing tests for table format `src/__tests__/summary.service.test.js`
  - Requirement: US-01, US-02, US-03, US-04
  - Files: `src/__tests__/summary.service.test.js`
  - Outcome: 8 new failing test cases assert table block structure, column headers, blocker highlighting, and empty cell display
  - Est. time: 20 min

- [x] **TASK-T02**: Add private helper `buildRichText` `src/services/summary.js`
  - Requirement: Design section "Interface Definitions"
  - Files: `src/services/summary.js`
  - Outcome: Function creates rich-text elements with optional bold and color annotations; no tests fail
  - Est. time: 10 min

- [x] **TASK-T03**: Add private helper `buildTableRow` `src/services/summary.js`
  - Requirement: Design section "Interface Definitions"
  - Files: `src/services/summary.js`
  - Outcome: Function creates table_row blocks from cell arrays; no tests fail
  - Est. time: 10 min

- [x] **TASK-T04**: Replace toggle loop with table logic `src/services/summary.js`
  - Requirement: US-01, US-02, US-03, US-04, AC-01 through AC-09
  - Files: `src/services/summary.js`
  - Outcome: All 8 tests from T01 pass; integration tests remain green; no `toggle` blocks in output
  - Est. time: 25 min

- [x] **TASK-T05**: Create `.claude/templates/` with 3 template files
  - Requirement: `/spec-create` command requires templates to exist before running
  - Files: 
    - `.claude/templates/requirements-template.md`
    - `.claude/templates/design-template.md`
    - `.claude/templates/tasks-template.md`
  - Outcome: `/spec-create` no longer halts with "templates missing" error
  - Est. time: 20 min

- [x] **TASK-T06**: Create spec documents under `.claude/specs/summary-table-format/`
  - Requirement: Document this feature's requirements, design, and tasks for future reference
  - Files:
    - `.claude/specs/summary-table-format/requirements.md`
    - `.claude/specs/summary-table-format/design.md`
    - `.claude/specs/summary-table-format/tasks.md`
  - Outcome: Spec documents populated with full context; can be referenced by `/implement-task` or `/spec-check` in future
  - Est. time: 15 min

## Dependency Map

```
TASK-T01 (write tests)
    ↓
    ├─→ TASK-T02 (buildRichText helper)
    │     ↓
    │     └─→ TASK-T03 (buildTableRow helper)
    │           ↓
    │           └─→ TASK-T04 (implement table logic)
    │
TASK-T05 (create templates)
    ↓
    └─→ TASK-T06 (create spec docs)
```

**Parallelization**:
- T01 and T02 can run in parallel
- T03 depends on T02
- T04 depends on T01, T02, T03 (all three must complete)
- T05 and T06 are independent of T01–T04 (can run any time)

## Testing Strategy

### Unit Tests for `buildSummaryBlocks`
- Test 1: Returns exactly 1 table block (AC-01)
- Test 2: Table has table_width = 4 (AC-01)
- Test 3: Table has has_column_header = true (AC-01)
- Test 4: Header row has 4 bold cells with correct labels (AC-02)
- Test 5: Data rows count matches memberSummaries.length (AC-01, AC-07)
- Test 6: Blocker cell is red when non-empty (AC-03)
- Test 7: Empty cells display `(chưa điền)` (AC-04)
- Test 8: Heading_1 and divider are first 2 blocks (AC-05)
- Test 9: Empty summaries still produce header row (AC-08)

All tests use mocked memberSummaries input; no real Notion API calls.

### Integration Tests
- `aggregateStandups` test remains unchanged; verifies:
  - `notion.appendBlocks` called exactly once with all blocks
  - All members' standup pages are queried and processed
  - Block array structure is correct

### Manual Verification
```bash
# Run tests
npm test -- --testPathPattern=summary.service.test

# Run full suite to verify no regression
npm test

# Optional: trigger job manually to see Notion output
npm run trigger:summary
```

After running `npm run trigger:summary`, open the Notion summary page and verify:
- A **table with 4 columns** appears (not toggles)
- **Header row** is bold and readable
- **Blocker cells** are red if they contain content
- **Empty cells** display `(chưa điền)`
- **Date heading** and divider line still appear above the table
