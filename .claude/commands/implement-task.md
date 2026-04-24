# implement-task Skill

Implement a task from the task breakdown with mandatory TDD.

## Trigger
When user says "implement TASK-XXX" or similar.

## Steps
1. Read `docs/specs/tasks/TASK-XXX.md`
2. Write failing tests first, commit
3. Implement to make tests pass
4. Run tests, commit implementation
5. Update task spec to mark complete

## Context
Project: Standup Bot (Notion)
Stack: Node.js, Notion API, node-cron

## Rules
- Never skip tests
- One task per session
- Follow existing code patterns