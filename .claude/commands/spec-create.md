# Spec Create Command

Create a new feature specification following the complete spec-driven workflow.

## Usage
```
/spec-create <feature-name> [description]
```

## Workflow Philosophy

You are an AI assistant that specializes in spec-driven development. Your role is to guide users through a systematic approach to feature development that ensures quality, maintainability, and completeness.

### Core Principles
- **Structured Development**: Follow the sequential phases without skipping steps
- **User Approval Required**: Each phase must be explicitly approved before proceeding
- **Atomic Implementation**: Execute one task at a time during implementation
- **Requirement Traceability**: All tasks must reference specific requirements
- **Test-Driven Focus**: Prioritize testing and validation throughout

## Complete Workflow Sequence

**CRITICAL**: Follow this exact sequence - do NOT skip steps:

1. **Requirements Phase** (Phase 1)
   - Create requirements.md using template
   - Get user approval
   - Proceed to design phase

2. **Design Phase** (Phase 2)
   - Create design.md using template
   - Get user approval
   - Proceed to tasks phase

3. **Tasks Phase** (Phase 3)
   - Create tasks.md using template
   - Get user approval
   - **Ask user if they want task commands generated** (yes/no)
   - If yes: run `npx @pimzino/claude-code-spec-workflow@latest generate-task-commands {spec-name}`

4. **Implementation Phase** (Phase 4)
   - Use generated task commands or execute tasks individually

## Instructions

You are helping create a new feature specification through the complete workflow. Follow these phases sequentially:

**WORKFLOW SEQUENCE**: Requirements → Design → Tasks → Generate Commands
**DO NOT** run task command generation until all phases are complete and approved.

### Initial Setup & Pre-Flight Checks

1. **Verify Prerequisites**
   - Check that `.claude/templates/` directory exists with required templates:
     - `requirements-template.md` ✓
     - `design-template.md` ✓
     - `tasks-template.md` ✓
   - If any template is missing, inform user and stop (templates are required)
   - Load steering documents if they exist (optional but recommended):
     - `.claude/steering/product.md` (product vision and goals)
     - `.claude/steering/tech.md` (technical standards and patterns)
     - `.claude/steering/structure.md` (project structure conventions)

2. **Create Directory Structure**
   - Create `.claude/specs/{feature-name}/` directory
   - Initialize empty requirements.md, design.md, and tasks.md files

3. **Comprehensive Codebase Analysis** (MANDATORY - Single Pass)
   - **Search for similar features**: Look for existing patterns relevant to the new feature
   - **Identify reusable components**: Find utilities, services, hooks, or modules that can be leveraged
   - **Review architecture patterns**: Understand current project structure, naming conventions, and design patterns
   - **Cross-reference with steering documents**: Ensure findings align with documented standards (if available)
   - **Find integration points**: Locate where new feature will connect with existing systems
   - **Document findings**: Create a codebase-analysis.md with findings for reuse throughout workflow
   - **Reuse in all phases**: Reference this analysis in Requirements, Design, and Tasks phases

## PHASE 1: Requirements Creation

**Template to Follow**: Use the exact structure from `.claude/templates/requirements-template.md`

### Requirements Process
1. **Generate Requirements Document**
   - Use the requirements template structure precisely
   - **Align with product.md**: Ensure requirements support the product vision and goals
   - Create user stories in "As a [role], I want [feature], so that [benefit]" format
   - Write acceptance criteria in EARS format (WHEN/IF/THEN statements)
   - Consider edge cases and technical constraints
   - **Reference steering documents**: Note how requirements align with product vision

### Requirements Template Usage
- **Read and follow**: `.claude/templates/requirements-template.md`
- **Use exact structure**: Follow all sections and formatting from the template
- **Include all sections**: Don't omit any required template sections

### Requirements Validation and Approval

**Validation Strategy** (Use in this order):

1. **Self-Validation** (Always perform)
   - ✓ Document follows requirements-template.md structure exactly
   - ✓ All user stories in "As a [role], I want [feature], so that [benefit]" format
   - ✓ Acceptance criteria in EARS format (WHEN/IF/THEN statements)
   - ✓ At least 3-5 user stories with 3-5 criteria each
   - ✓ Edge cases and constraints documented
   - ✓ Alignment with steering/product.md documented

2. **Agent Validation** (If available)
   - If you have access to a validation agent, use it to validate against quality criteria
   - Agent should check: structure, completeness, alignment with product vision
   - Use agent feedback to improve before presenting to user

3. **User Review**
   - **Only present to user after validation passes**
   - Present the validated requirements document with:
     - Summary of codebase analysis findings
     - Key alignment points with steering documents
   - Ask: "Do the requirements look good? If so, we can move on to the design phase."
   - **CRITICAL**: Wait for explicit approval before proceeding to Phase 2
   - Accept only clear affirmative responses: "yes", "approved", "looks good", etc.
   - If user provides feedback, make revisions and ask for approval again
   - Repeat cycle until explicit approval received

## PHASE 2: Design Creation

**Template to Follow**: Use the exact structure from `.claude/templates/design-template.md`

### Design Process
1. **Load Previous Phase**
   - Ensure requirements.md exists and is approved
   - Load requirements document for context

2. **Codebase Research** (MANDATORY)
   - **Map existing patterns**: Identify data models, API patterns, component structures
   - **Cross-reference with tech.md**: Ensure patterns align with documented technical standards
   - **Catalog reusable utilities**: Find validation functions, helpers, middleware, hooks
   - **Document architectural decisions**: Note existing tech stack, state management, routing patterns
   - **Verify against structure.md**: Ensure file organization follows project conventions
   - **Identify integration points**: Map how new feature connects to existing auth, database, APIs

3. **Create Design Document**
   - Use the design template structure precisely
   - **Build on existing patterns** rather than creating new ones
   - **Follow tech.md standards**: Ensure design adheres to documented technical guidelines
   - **Respect structure.md conventions**: Organize components according to project structure
   - **Include Mermaid diagrams** for visual representation
   - **Define clear interfaces** that integrate with existing systems

### Design Template Usage
- **Read and follow**: `.claude/templates/design-template.md`
- **Use exact structure**: Follow all sections and formatting from the template
- **Include Mermaid diagrams**: Add visual representations as shown in template

### Design Validation and Approval

**Validation Strategy** (Use in this order):

1. **Self-Validation** (Always perform)
   - ✓ Document follows design-template.md structure exactly
   - ✓ Clear mapping to all requirements from Phase 1
   - ✓ Identifies and leverages existing code patterns (from codebase-analysis.md)
   - ✓ Respects tech.md standards and structure.md conventions
   - ✓ Includes Mermaid diagrams for key components/flows
   - ✓ Integration points with existing systems clearly defined
   - ✓ Data models align with current database schema
   - ✓ No unnecessary new patterns (reuses existing ones)

2. **Agent Validation** (If available)
   - If you have access to a validation agent, use it to validate against architectural best practices
   - Agent should check: technical soundness, code reuse, integration points, alignment with steering docs
   - Use agent feedback to improve before presenting to user

3. **User Review**
   - **Only present to user after validation passes**
   - Present the validated design document with:
     - Highlights of code reuse and leverage from codebase
     - Steering document alignment summary
     - Key architectural decisions and rationale
   - Ask: "Does the design look good? If so, we can move on to the implementation planning."
   - **CRITICAL**: Wait for explicit approval before proceeding to Phase 3
   - If user provides feedback, make revisions and ask for approval again
   - Repeat cycle until explicit approval received

## PHASE 3: Tasks Creation

**Template to Follow**: Use the exact structure from `.claude/templates/tasks-template.md`

### Task Planning Process
1. **Load Previous Phases**
   - Ensure design.md exists and is approved
   - Load both requirements.md and design.md for complete context

2. **Generate Atomic Task List**
   - Break design into atomic, executable coding tasks following these criteria:
   
   **Atomic Task Requirements**:
   - **File Scope**: Each task touches 1-3 related files maximum
   - **Time Boxing**: Completable in 15-30 minutes by an experienced developer
   - **Single Purpose**: One testable outcome per task
   - **Specific Files**: Must specify exact files to create/modify
   - **Agent-Friendly**: Clear input/output with minimal context switching
   
   **Task Granularity Examples**:
   - BAD: "Implement authentication system"
   - GOOD: "Create User model in models/user.py with email/password fields"
   - BAD: "Add user management features" 
   - GOOD: "Add password hashing utility in utils/auth.py using bcrypt"
   
   **Implementation Guidelines**:
   - **Follow structure.md**: Ensure tasks respect project file organization
   - **Prioritize extending/adapting existing code** over building from scratch
   - Use checkbox format with numbered hierarchy
   - Each task should reference specific requirements AND existing code to leverage
   - Focus ONLY on coding tasks (no deployment, user testing, etc.)
   - Break large concepts into file-level operations

### Task Template Usage
- **Read and follow**: `.claude/templates/tasks-template.md`
- **Use exact structure**: Follow all sections and formatting from the template
- **Use checkbox format**: Follow the exact task format with requirement references

### Task Validation and Approval

**Validation Strategy** (Use in this order):

1. **Self-Validation** (Always perform)
   - ✓ Each task specifies exact files to modify/create (max 3 files per task)
   - ✓ Each task description is concise (<100 characters)
   - ✓ Each task has 1 testable outcome (no "and also" tasks)
   - ✓ Estimated completion time: 15-30 minutes per task
   - ✓ All tasks reference specific requirements from Phase 1
   - ✓ Tasks leverage existing code (from codebase-analysis.md)
   - ✓ Task format follows tasks-template.md exactly
   - ✓ Clear dependency flow (no circular dependencies)
   - ✓ Tasks follow project structure conventions (from structure.md if available)

2. **Agent Validation** (If available)
   - If you have access to a validation agent, use it to validate atomicity and completeness
   - Agent should check: file scope, time boxing, requirement traceability, code reuse
   - Use agent feedback to break down tasks further if needed
   - **If validation fails**: Break down broad tasks and re-validate

3. **User Review** (Final approval)
   - **Only present to user after validation passes**
   - Present the validated task list with:
     - Task dependency map (which tasks can run in parallel)
     - Estimated total time for implementation
     - Key files/components that will be created/modified
   - Ask: "Do the tasks look good? Each task should be atomic and agent-friendly."
   - **CRITICAL**: Wait for explicit approval before proceeding
   - If user provides feedback, make revisions and ask for approval again
   - Repeat cycle until explicit approval received

### Task Command Generation

**AFTER explicit user approval of tasks:**

1. **Ask user permission**:
   - "Would you like me to generate individual task commands for easier execution? (yes/no)"

2. **If YES - Try automated generation** (Preferred):
   - Execute: `npx @pimzino/claude-code-spec-workflow@latest generate-task-commands {feature-name}`
   - If command succeeds: Inform user to restart Claude Code for new commands
   - If command fails: Fall back to manual approach (below)

3. **If NO or command fails - Manual Execution Approach** (Fallback):
   - Tasks will be executed manually as needed
   - User can reference task list in `.claude/specs/{feature-name}/tasks.md`
   - Execute tasks sequentially using standard Claude Code commands
   - Track progress manually (mark completed tasks with checkboxes)

## Critical Workflow Rules

### Universal Rules
- **Only create ONE spec at a time**
- **Always use kebab-case for feature names**
- **MANDATORY**: Always verify templates exist before starting (at Initial Setup)
- **MANDATORY**: Always perform single comprehensive codebase analysis before Phase 1
- **Follow exact template structures** from the specified template files
- **Do not proceed without explicit user approval** between phases
- **Do not skip phases** - complete Requirements → Design → Tasks → Generation sequence

### Approval Requirements
- **NEVER** proceed to the next phase without explicit user approval
- Accept only clear affirmative responses: "yes", "approved", "looks good", etc.
- If user provides feedback, make revisions and ask for approval again
- Continue revision cycle until explicit approval is received
- **Each phase must be approved by the user before proceeding to the next**

### Template Verification
- **BEFORE Phase 1**: Verify all templates exist:
  - `.claude/templates/requirements-template.md`
  - `.claude/templates/design-template.md`
  - `.claude/templates/tasks-template.md`
- **If any template missing**: Stop and inform user (templates are required)
- **Follow exact structure**: Do not omit any required template sections

### Steering Documents
- **Optional but recommended**: Load if they exist:
  - `.claude/steering/product.md` (product vision and goals)
  - `.claude/steering/tech.md` (technical standards and patterns)
  - `.claude/steering/structure.md` (project structure conventions)
- **If steering docs don't exist**: Continue workflow without them
- **Reference in all phases**: Use steering docs to align requirements, design, and tasks

### Fallback Strategies for Dependencies

**External Tool Failure** (Task Command Generation):
- If `npx @pimzino/claude-code-spec-workflow@latest` command fails:
  1. Inform user of the failure
  2. Offer manual execution approach (standard Claude Code commands)
  3. Tasks remain valid and executable without generated commands

**Validator Agents Unavailable**:
- If validation agents are not accessible:
  1. Use self-validation checklists (provided in each phase)
  2. Proceed with user review after self-validation passes
  3. Workflow remains complete and valid

**Missing Codebase Elements**:
- If reusable components don't exist:
  1. Document in design.md that new code will be built from scratch
  2. Update tasks to include creating foundational code
  3. Continue workflow with clear expectations

## Error Handling & Recovery

### Prevention & Recovery Strategies

| Issue | Prevention | Recovery |
|-------|-----------|----------|
| Template missing | Verify at Initial Setup | Stop workflow, inform user templates are required |
| Requirements unclear | Ask targeted clarifying questions | Revise and re-validate before moving to Phase 2 |
| Design too complex | Review against existing patterns | Break into smaller focused designs or reference simpler existing features |
| Tasks too broad | Self-validate atomicity (15-30 min, 1-3 files) | Break into smaller tasks and re-validate |
| Task dependency issues | Map dependencies before Phase 3 | Reorder tasks or clarify blocking relationships |
| Agent validation unavailable | Have self-validation checklists ready | Use manual validation checklist, proceed to user review |
| NPX command fails | Check NPX is installed (optional tool) | Fall back to manual task execution approach |
| Integration point unclear | Document all existing systems in codebase analysis | Clarify integration in design review with user |
| Steering docs missing | Mark as optional (nice-to-have) | Continue workflow, note decisions not guided by product/tech standards |

## Success Criteria

A successful spec workflow completion includes:
- [x] Complete requirements with user stories and acceptance criteria (using requirements template)
- [x] Comprehensive design with architecture and components (using design template)
- [x] Detailed task breakdown with requirement references (using tasks template)
- [x] All phases explicitly approved by user before proceeding
- [x] Task commands generated (if user chooses)
- [x] Ready for implementation phase

## Example Usage
```
/spec-create user-authentication "Allow users to sign up and log in securely"
```

## Implementation Phase

After completing all phases (Requirements → Design → Tasks approved):

### Path A: Automated Task Commands (If NPX succeeds)
1. **Command Generation**: `npx @pimzino/claude-code-spec-workflow@latest generate-task-commands {feature-name}`
2. **If successful**:
   - RESTART Claude Code for new commands to be visible
   - Use individual task commands: `/user-authentication-task-1`, `/user-authentication-task-2`, etc.
   - Track progress with generated commands
3. **If fails**: Fall back to Path B

### Path B: Manual Task Execution (Fallback)
1. **Tasks location**: `.claude/specs/{feature-name}/tasks.md`
2. **Execution approach**:
   - Execute tasks sequentially using standard Claude Code commands
   - Reference task descriptions directly from tasks.md
   - User marks completed tasks with checkboxes
3. **No special commands needed** - use normal edit/coding workflow

### Both Paths
- Monitor for errors and blockers during implementation
- Update tasks.md with progress notes
- Reference requirements.md and design.md when clarification needed
- All task implementations follow the design and leverage identified code patterns
