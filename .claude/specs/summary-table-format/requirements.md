# Requirements: Summary Table Format

## Overview

The daily standup summary page (published at 9:00 AM) currently displays team members' responses using a toggle block format—each member is a collapsible toggle containing bulleted items. This makes it difficult to quickly compare responses across the team without expanding individual toggles. This feature converts the report format to a Notion table with 4 columns (Thành viên, Hôm qua, Hôm nay, Blocker) so team leads can scan all information at a glance.

## User Stories

- **US-01**: As a Team Lead, I want the standup summary to display as a table in Notion, so that I can compare all team members' responses across columns without expanding toggles.
- **US-02**: As a Team Lead, I want the table header row to clearly label the columns (Thành viên, Hôm qua, Hôm nay, Blocker), so that I immediately understand the column structure without prior context.
- **US-03**: As a Team Lead, I want Blocker cells with actual content to be highlighted in red, so that urgent blockers are immediately visible when scanning the table.
- **US-04**: As a Team Lead, I want empty cells to show `(chưa điền)` text, so that I can distinguish a member who has nothing to report from one who has not yet filled in their standup.

## Acceptance Criteria

### US-01: Table Format

- WHEN `buildSummaryBlocks` is called with member summaries, THEN the returned blocks array SHALL contain exactly one block of `type: 'table'` with `table_width: 4` and `has_column_header: true`
- WHEN called, THEN no `toggle` blocks SHALL be present in the result
- WHEN `aggregateStandups` is called, THEN `notion.appendBlocks` SHALL be called exactly once with all table rows included in a single call

### US-02: Table Headers

- WHEN `buildSummaryBlocks` is called, THEN the first `table_row` child of the table block SHALL have exactly 4 cells
- THEN the cells SHALL contain bold text: "Thành viên", "Hôm qua", "Hôm nay", "Blocker" (in that order)
- THEN the header row cells SHALL have `annotations.bold === true`

### US-03: Blocker Highlighting

- WHEN a member's Blocker section contains one or more non-empty strings, THEN the Blocker cell for that member SHALL have `annotations.color === 'red'`
- WHEN a member's Blocker section is empty, THEN the Blocker cell SHALL have `annotations.color === 'default'` and content `(chưa điền)`

### US-04: Empty Cell Display

- WHEN a member's "Hôm qua" section is empty, THEN the "Hôm qua" cell SHALL display plain text `(chưa điền)`
- WHEN a member's "Hôm nay" section is empty, THEN the "Hôm nay" cell SHALL display plain text `(chưa điền)`
- WHEN multiple paragraphs exist in a section, THEN they SHALL be joined with `\n` into a single cell content string

### Additional Criteria

- WHEN `buildSummaryBlocks` is called, THEN the first block in the returned array SHALL be `type: 'heading_1'` (date heading) and the second SHALL be `type: 'divider'`, unchanged from current implementation
- IF `memberSummaries` is an empty array, THEN the table block SHALL still be present with only the header row

## Out of Scope

- Retroactively converting existing toggle-format summaries to table format
- Adding additional columns or metrics beyond the 4 specified
- Custom styling or cell merging
- Exporting table data to external formats

## Non-functional Requirements

- **Performance**: Appending a table block with ≤100 members SHALL complete in <5 seconds (Notion API constraint)
- **Compatibility**: Must use `@notionhq/client` library's standard Notion block API (no custom plugins)
- **Error Handling**: Notion API rate limits and transient failures SHALL be handled with existing retry logic in the notion service

## Dependencies

- `@notionhq/client` library (Notion API client)
- `src/services/notion.js` — for `appendBlocks`, `queryDatabase`, `getPageBlocks`
- `src/services/summary.js` — existing functions `extractTextFromBlocks`, `getMemberName`, `aggregateStandups`
- `src/services/dailyStandup.js` — `formatDate` utility
