# spec-check Skill

Audit implementation against task spec before marking complete.

## Trigger
Run before completing any TASK-XXX.

## Steps
1. Read TASK-XXX.md acceptance criteria
2. Check each criterion against implementation
3. Run test suite
4. Report pass/fail per criterion

## Context
Project: Standup Bot (Notion)