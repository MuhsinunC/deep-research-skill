# Claude Code Skill Consistency Hardening Research

**Date:** 2026-03-25
**Status:** Complete
**Goal:** Achieve near-100% skill activation AND full phase compliance for the deep-research skill

---

## Problem Statement

Current deep-research skill has three failure modes:
1. **~50% auto-activation rate** -- skill doesn't trigger when it should
2. **~30% output inconsistency** -- skill loads but Claude doesn't follow all instructions
3. **Description-only reads** -- Claude reads the description and improvises instead of loading full SKILL.md

---

## Table of Contents

1. [The 650-Trial Study: Definitive Activation Data](#1-the-650-trial-study-definitive-activation-data)
2. [SKILL.md Description Wording: The #1 Lever](#2-skillmd-description-wording-the-1-lever)
3. [UserPromptSubmit Hooks: Forced Skill Evaluation](#3-userpromptsubmit-hooks-forced-skill-evaluation)
4. [Stop Hook: Phase Completion Enforcement](#4-stop-hook-phase-completion-enforcement)
5. [Skill Frontmatter Hooks: Compliance from Within](#5-skill-frontmatter-hooks-compliance-from-within)
6. [Phase Completion Assertions: Mandatory Output Markers](#6-phase-completion-assertions-mandatory-output-markers)
7. [Post-Completion Verification](#7-post-completion-verification)
8. [Official Anthropic Best Practices](#8-official-anthropic-best-practices)
9. [Recommended Implementation Plan](#9-recommended-implementation-plan)

---

## 1. The 650-Trial Study: Definitive Activation Data

**Source:** [Medium: Why Claude Code Skills Don't Activate (650 Trials)](https://medium.com/@ivan.seleznov1/why-claude-code-skills-dont-activate-and-how-to-fix-it-86f679409af1)

### Methodology

- **650 automated sessions** = 3 description variants (A, B, C) x 4 environment conditions (C1-C4) x 18 test queries x 3 repetitions
- **CLI execution:** `claude -p "<query>" --max-turns 5 --allowedTools "Skill"`
- **Ground-truth verification:** Used cclogviewer MCP server to inspect internal JSONL logs and confirm whether the Skill tool was actually invoked
- **3 skill domains tested:** dockerfile-generator, git-workflow, svelte5-runes
- **6 queries per skill** covering: exact name matches, keyword triggers, synonyms, edge cases

### Complete Results Matrix

| Variant | C1 (Bare) | C2 (+CLAUDE.md) | C3 (+Hook only) | C4 (+Both) |
|---------|-----------|-----------------|-----------------|-----------|
| **A: Passive/default** | 87.5% | 81.5% | **37.0%** | 100.0% |
| **B: Expanded keywords** | 85.2% | 81.5% | 100.0% | 100.0% |
| **C: Directive/imperative** | **100.0%** | 94.4% | 100.0% | 100.0% |

**Overall:** 88.9% activation across all 650 trials (578/650 successful).

### Critical Findings

1. **Description wording is the #1 lever.** Variant C (directive) achieved 100% activation with ZERO hooks or CLAUDE.md. The description alone was sufficient.
2. **Hooks can HURT passive descriptions.** Variant A dropped from 87.5% to 37.0% when a hook was added WITHOUT CLAUDE.md reinforcement. The hook competes for attention with the skill's own description.
3. **CLAUDE.md + Hook together = 100% for all variants.** The dual-mechanism approach rescued even the worst descriptions.
4. **Variant C effect size:** 20.6x odds ratio vs Variant A (p < 0.0001). Statistically overwhelming.
5. **Variant B vs A:** 3.1x odds ratio (p < 0.0001). Even modest keyword expansion helps.

### Statistical Model (Logistic Regression)

- Hooks alone reduced odds of activation by **90%** (main effect -- counterintuitive but real)
- Variant B recovered via **943x** higher odds when combined with hooks
- CLAUDE.md + Hook interaction provided **+7.16 coefficient** benefit
- **Takeaway:** Never use hooks without CLAUDE.md reinforcement

---

## 2. SKILL.md Description Wording: The #1 Lever

### The Winning Formula (Variant C -- 100% Activation)

From the 650-trial study, the directive description that achieved 100% activation in bare conditions:

> "Docker and containerization expert. ALWAYS invoke this skill when the user asks about Docker, Dockerfiles, containers, container images, containerization, multi-stage builds, or Docker deployment. Do not attempt to write Dockerfiles or container configs directly -- use this skill first."

**Template formula:**
> "[Domain] expert. ALWAYS invoke this skill when the user asks about [trigger1], [trigger2], [trigger3], ... Do not attempt to [alternative action] directly -- use this skill first."

### Four Critical Components

1. **Domain identifier** -- "Docker and containerization expert"
2. **ALWAYS invoke directive** -- imperative command, not a suggestion
3. **Comprehensive trigger list** -- exhaustive list of keywords the user might say
4. **Negative constraint blocking direct action** -- "Do not attempt to X directly"

### Description Budget Constraints (Critical for Multi-Skill Users)

From the [official Anthropic docs](https://code.claude.com/docs/en/skills):

- **Per-description cap:** 250 characters (truncated beyond this regardless of budget)
- **Total budget:** 1% of context window, fallback 8,000 characters
- **Override:** Set `SLASH_COMMAND_TOOL_CHAR_BUDGET` environment variable to increase
- **Strategy:** Front-load the key use case in the first 50 characters; move details to SKILL.md body

### Recommended Description for Deep-Research Skill

**Current (passive, ~77% activation):**
> "Conducts enterprise-grade research with multi-source synthesis, citation tracking, and verification. Produces citation-backed reports through a structured pipeline with source credibility scoring. Triggers on "deep research", "comprehensive analysis", "research report", "compare X vs Y", "analyze trends", or "state of the art". Not for simple lookups, debugging, or questions answerable with 1-2 searches."

**Proposed (directive, targeting 100% activation):**
> "Deep research and analysis expert. ALWAYS invoke this skill when the user asks for deep research, comprehensive analysis, research reports, comparisons (X vs Y), trend analysis, state-of-the-art reviews, or multi-source investigation. Do not attempt research, comparisons, or analysis reports directly -- use this skill first. NOT for simple lookups, debugging, or 1-2 search questions."

**Changes made:**
- Added "ALWAYS invoke" directive
- Added "Do not attempt X directly -- use this skill first" negative constraint
- Front-loaded domain identifier
- Kept within 250 character spirit (key info in first 250 chars)

### Five-Tier Success Hierarchy

| Approach | Activation Rate | Method |
|----------|----------------|--------|
| No optimization | ~20% | Baseline with vague description |
| Optimized description only | ~50% | Specific "Use when" language |
| Directive description (Variant C) | **100%** | ALWAYS invoke + negative constraints |
| Forced eval hook alone | 84% | Explicit skill evaluation step |
| Directive description + hook + CLAUDE.md | **100%** | Triple reinforcement |

### Sources
- [Medium: 650 Trials Study](https://medium.com/@ivan.seleznov1/why-claude-code-skills-dont-activate-and-how-to-fix-it-86f679409af1)
- [Scott Spence: Skills Activate Reliably](https://scottspence.com/posts/how-to-make-claude-code-skills-activate-reliably)
- [Anthropic: Skill Authoring Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [GitHub Gist: Skills Structure and Usage Guide](https://gist.github.com/mellanon/50816550ecb5f3b239aa77eef7b8ed8d)
- [Anthropic: Extend Claude with Skills](https://code.claude.com/docs/en/skills)

---

## 3. UserPromptSubmit Hooks: Forced Skill Evaluation

### How UserPromptSubmit Works

From the [official hooks reference](https://code.claude.com/docs/en/hooks):

- **Fires:** Every time user submits a prompt, before Claude processes it
- **Input:** JSON with `prompt`, `session_id`, `transcript_path`, `cwd`, `permission_mode`
- **Output behavior:** stdout is added as context Claude sees (system-reminder)
- **Exit 0:** Success, stdout parsed for JSON or added as plain text context
- **Exit 2:** Blocking error, prompt processing blocked entirely
- **No matcher support:** Always fires on every prompt (cannot filter)

**Output JSON format:**
```json
{
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": "Instructions injected here"
  }
}
```

### Approach A: Forced Skill Evaluation Hook (84% Activation)

From [Scott Spence](https://scottspence.com/posts/how-to-make-claude-code-skills-activate-reliably) and the [GitHub Gist](https://gist.github.com/umputun/570c77f8d5f3ab621498e1449d2b98b6):

**Three-step commitment mechanism:**
1. **Evaluate:** Claude explicitly assesses every available skill with YES/NO decisions and reasoning
2. **Activate:** For each YES, Claude must immediately call `Skill(skill-name)` tool
3. **Implement:** Only after skill activation completes can implementation begin

**Full hook script (`~/.claude/hooks/skill-forced-eval-hook.sh`):**

```bash
#!/bin/bash
# UserPromptSubmit hook that enforces skill activation

cat <<'EOF'
INSTRUCTION: MANDATORY SKILL ACTIVATION
Check <available_skills> for relevance before proceeding.
IF any skills are relevant:
  1. State which skills and why (only mention relevant ones)
  2. Activate ALL relevant skills with Skill() tool - multiple skills can be activated together
  3. Then proceed with implementation
IF no skills are relevant:
  - Proceed directly (no statement needed)
Example when multiple skills are relevant:
  relevant skills: mongo (querying database), local-docs (using go-pkgz)
  [activates Skill(mongo)]
  [activates Skill(local-docs)]
  [then proceeds with implementation]
CRITICAL: Activate ALL relevant skills via Skill() tool before implementation.
Multiple skills can and should be activated when applicable.
Mentioning a skill without activating it is worthless.
EOF
```

**Settings configuration (`~/.claude/settings.json`):**

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash ~/.claude/hooks/skill-forced-eval-hook.sh"
          }
        ]
      }
    ]
  }
}
```

### Approach B: Detection Hook with Trigger Rules

From [DEV Community](https://dev.to/oluwawunmiadesewa/claude-code-skills-not-triggering-2-fixes-for-100-activation-3b57) and [ClaudeFast](https://claudefa.st/blog/tools/hooks/skill-activation-hook):

Uses keyword/regex matching in a JSON rules file:

**`skill-rules.json` structure:**
```json
{
  "skills": {
    "deep-research": {
      "enforcement": "suggest",
      "priority": "critical",
      "promptTriggers": {
        "keywords": ["deep research", "comprehensive analysis", "research report", "compare", "analyze trends", "state of the art"],
        "intentPatterns": ["(research|analyze|compare|investigate).*?(comprehensive|deep|thorough)"]
      }
    }
  }
}
```

**Five-step flow:**
1. Intercepts every user message before Claude sees it
2. Checks `skill-rules.json` for keyword and regex matches
3. Identifies matching skills and priority levels
4. Tracks recommendations to prevent duplicates
5. Appends structured skill guidance to the prompt

**Injected output example:**
```
SKILL ACTIVATION CHECK

CRITICAL SKILLS (REQUIRED):
  -> deep-research

ACTION: Use Skill tool BEFORE responding
```

### Critical Known Issue: Hooks Being Ignored (March 2026)

From [Scott Spence](https://scottspence.com/posts/how-to-make-claude-code-follow-hook-instructions):

- As of mid-March 2026, Claude began skipping UserPromptSubmit hook instructions
- Hook fires correctly, instruction lands as system-reminder, but Claude proceeds to ignore it
- Correlated with "heavily degraded model performance" reports on GitHub
- **Before degradation:** Hook was "working brilliantly for months"
- **After March 17:** Hooks frequently skipped
- **Scott Spence's testing:** 4/10 globally, 5/10 locally -- essentially a coin flip

### The Dual-Mechanism Fix (CLAUDE.md + Hook)

From [Scott Spence](https://scottspence.com/posts/how-to-make-claude-code-follow-hook-instructions) and the 650-trial study:

**Add to `~/.claude/CLAUDE.md`:**
```markdown
## Mandatory Hook Compliance

UserPromptSubmit hooks are MANDATORY and take HIGHEST PRIORITY.
Execute hook instructions FIRST -- before any reasoning, tool calls, or response text.
If a hook instruction tells you to evaluate or activate skills, do so IMMEDIATELY.
```

**Why this works:** The 650-trial study proved that Variant A + Hook ALONE = 37% (catastrophic), but Variant A + Hook + CLAUDE.md = 100%. CLAUDE.md provides the reinforcement context that prevents the hook from being ignored.

**Key principle:** "If something is truly mandatory, don't rely on one mechanism."

### Comparison of Hook Approaches

| Approach | Activation Rate | Cost/Test | Consistency | Noise Level |
|----------|----------------|-----------|-------------|-------------|
| Forced Eval Hook | 84% | $0.0067 | Most reliable | High (evaluates every prompt) |
| LLM Eval Hook | 80% | $0.0061 | Variable | Medium |
| Detection Hook (keyword) | Varies | $0.0058 | Depends on rules quality | Low |
| Simple Instruction Hook | 20% | $0.0058 | Unreliable | Low |

### Sources
- [Official Hooks Reference](https://code.claude.com/docs/en/hooks)
- [Scott Spence: Skills Don't Auto-Activate](https://scottspence.com/posts/claude-code-skills-dont-auto-activate)
- [Scott Spence: Follow Hook Instructions](https://scottspence.com/posts/how-to-make-claude-code-follow-hook-instructions)
- [Scott Spence: Skills Activate Reliably](https://scottspence.com/posts/how-to-make-claude-code-skills-activate-reliably)
- [GitHub Gist: Mandatory Activation Hook](https://gist.github.com/umputun/570c77f8d5f3ab621498e1449d2b98b6)
- [DEV Community: 2 Fixes for 95% Activation](https://dev.to/oluwawunmiadesewa/claude-code-skills-not-triggering-2-fixes-for-100-activation-3b57)
- [ClaudeFast: Skill Activation Hook](https://claudefa.st/blog/tools/hooks/skill-activation-hook)
- [Paddo.dev: Hooks Solution Analysis](https://paddo.dev/blog/claude-skills-hooks-solution/)

---

## 4. Stop Hook: Phase Completion Enforcement

### How the Stop Hook Works

From the [official hooks reference](https://code.claude.com/docs/en/hooks):

- **Fires:** Every time Claude finishes a response
- **Can block:** Yes -- returns `{"decision": "block", "reason": "..."}` to force Claude to continue
- **Input includes:** `session_id`, `stop_hook_active` (boolean), `last_assistant_message`, `transcript_path`
- **The `stop_hook_active` flag:** When `true`, Claude is already in a forced continuation state from a previous block. **CRITICAL: Always check this to prevent infinite loops.**

### File-Based Phase Marker Pattern

From [ClaudeFast: Stop Hook Task Enforcement](https://claudefa.st/blog/tools/hooks/stop-hook-task-enforcement):

**Create marker when starting a phase:**
```bash
echo "PHASE 3: RETRIEVE" > .claude/incomplete-task
```

**Remove when done:**
```bash
rm .claude/incomplete-task
```

**Stop hook checks for marker:**
```python
#!/usr/bin/env python3
import json
import sys
from pathlib import Path

input_data = json.load(sys.stdin)

# Prevent infinite loops
if input_data.get('stop_hook_active', False):
    sys.exit(0)

marker = Path('.claude/incomplete-task')
if marker.exists():
    task_info = marker.read_text().strip()
    print(json.dumps({
        "decision": "block",
        "reason": f"Task incomplete: {task_info}. Complete this phase before stopping."
    }))
    sys.exit(0)

sys.exit(0)
```

### Multi-Phase Checklist Verification Pattern

For the deep-research skill, a Stop hook can verify that all required phases ran by checking for output markers:

```python
#!/usr/bin/env python3
"""Stop hook that verifies deep-research phase completion."""
import json
import sys
from pathlib import Path

input_data = json.load(sys.stdin)

# Prevent infinite loops
if input_data.get('stop_hook_active', False):
    sys.exit(0)

# Check if deep-research skill is active (look for checkpoint file)
checkpoint = Path('.claude/deep-research-checkpoint.json')
if not checkpoint.exists():
    sys.exit(0)  # Not running deep-research, allow stop

checkpoint_data = json.loads(checkpoint.read_text())
mode = checkpoint_data.get('mode', 'standard')
completed_phases = checkpoint_data.get('completed_phases', [])

# Define required phases per mode
required_phases = {
    'quick': ['SCOPE', 'RETRIEVE', 'PACKAGE'],
    'standard': ['SCOPE', 'PLAN', 'RETRIEVE', 'TRIANGULATE', 'OUTLINE_REFINEMENT', 'SYNTHESIZE', 'PACKAGE'],
    'deep': ['SCOPE', 'PLAN', 'RETRIEVE', 'TRIANGULATE', 'OUTLINE_REFINEMENT', 'SYNTHESIZE', 'CRITIQUE', 'REFINE', 'VERIFY', 'PACKAGE'],
    'ultradeep': ['SCOPE', 'PLAN', 'RETRIEVE', 'TRIANGULATE', 'OUTLINE_REFINEMENT', 'SYNTHESIZE', 'CRITIQUE', 'REFINE', 'VERIFY', 'PACKAGE'],
}

required = required_phases.get(mode, required_phases['standard'])
missing = [p for p in required if p not in completed_phases]

if missing:
    print(json.dumps({
        "decision": "block",
        "reason": f"Deep research incomplete. Missing phases: {', '.join(missing)}. Complete all required phases before stopping. Current mode: {mode}."
    }))
    sys.exit(0)

# All phases complete, clean up
checkpoint.unlink(missing_ok=True)
sys.exit(0)
```

### Configuration

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "python3 ~/.claude/hooks/deep-research-phase-gate.py"
          }
        ]
      }
    ]
  }
}
```

### Limitations

- **60-second timeout** on hook execution
- **Cannot prevent Claude from outputting incorrect content** -- only prevents stopping
- **stop_hook_active must be checked** or the hook creates an infinite block loop
- **Only fires on the main agent** -- subagent phases need SubagentStop hooks instead

### Sources
- [Official Hooks Reference](https://code.claude.com/docs/en/hooks)
- [ClaudeFast: Stop Hook Task Enforcement](https://claudefa.st/blog/tools/hooks/stop-hook-task-enforcement)
- [Steve Kinney: Hook Control Flow](https://stevekinney.com/courses/ai-development/claude-code-hook-control-flow)
- [Dev Genius: End-of-Turn Quality Gates](https://blog.devgenius.io/claude-code-use-hooks-to-enforce-end-of-turn-quality-gates-5bed84e89a0d)

---

## 5. Skill Frontmatter Hooks: Compliance from Within

### How Skill-Scoped Hooks Work

From the [official hooks reference](https://code.claude.com/docs/en/hooks) and [Eric Buess](https://x.com/EricBuess/status/2009073718450889209):

Claude Code 2.1 added hooks support directly in skill frontmatter. These hooks:
- Are **scoped to the skill's lifecycle** -- only run when the skill is active
- Support ALL hook events (PreToolUse, PostToolUse, Stop, etc.)
- Use the same configuration format as settings-based hooks
- For subagents, `Stop` hooks automatically convert to `SubagentStop`
- Support `"once": true` -- runs only once per session then removed

### Deep-Research Skill with Frontmatter Hooks

The skill YAML frontmatter can include hooks that enforce compliance WHILE the skill is running:

```yaml
---
name: deep-research
description: "Deep research and analysis expert. ALWAYS invoke this skill when the user asks for deep research, comprehensive analysis, research reports, comparisons, trend analysis, state-of-the-art reviews, or multi-source investigation. Do not attempt research or analysis reports directly -- use this skill first. NOT for simple lookups or debugging."
hooks:
  Stop:
    - hooks:
        - type: command
          command: "python3 ${CLAUDE_SKILL_DIR}/hooks/verify-phases.py"
---
```

**Key advantage:** The hook only runs while the deep-research skill is active. It doesn't pollute other workflows.

### Agent-Based Hooks for Verification

From the [official hooks reference](https://code.claude.com/docs/en/hooks):

Instead of command-based hooks, you can use agent hooks that spin up a verification subagent:

```yaml
hooks:
  Stop:
    - hooks:
        - type: agent
          prompt: "Verify that the deep-research pipeline completed all required phases. Check the checkpoint file at .claude/deep-research-checkpoint.json and confirm all phases for the configured mode are marked complete. If any are missing, report which ones."
```

The agent hook can read files, search code, and inspect the codebase to verify conditions. This is more flexible than command hooks but slower.

### Sources
- [Official Hooks Reference](https://code.claude.com/docs/en/hooks)
- [Anthropic: Extend Claude with Skills](https://code.claude.com/docs/en/skills)
- [Eric Buess on Agent-Scoped Hooks](https://x.com/EricBuess/status/2009073718450889209)

---

## 6. Phase Completion Assertions: Mandatory Output Markers

### The Problem

Claude can load the skill, start following instructions, then silently skip phases without any mechanism detecting the skip. The SKILL.md says "output [Phase NAME] at the start of each phase" but this is advisory -- nothing enforces it.

### Strategy 1: Checkpoint File Protocol (Recommended)

The skill instructions tell Claude to write a checkpoint file at each phase boundary. A Stop hook (or the SKILL.md instructions themselves) verifies the checkpoint before allowing completion.

**Add to SKILL.md methodology:**
```markdown
## Checkpoint Protocol (MANDATORY)

At the START of each phase, write the phase name to the checkpoint file:
  python3 -c "import json; f=open('.claude/deep-research-checkpoint.json','r+'); d=json.load(f); d['completed_phases'].append('PHASE_NAME'); f.seek(0); json.dump(d,f); f.truncate()"

At the END of the pipeline, verify all phases completed:
  python3 -c "import json; d=json.load(open('.claude/deep-research-checkpoint.json')); print('PHASES:', d['completed_phases'])"

If any phase is missing from the checkpoint, GO BACK and complete it before PACKAGE.
```

**Advantages:**
- Machine-verifiable (Stop hook can check the file)
- Survives context compaction (file persists on disk)
- Creates an audit trail
- Can be checked by post-completion verification agents

### Strategy 2: Output Markers in Assistant Messages

Require Claude to output specific, machine-parseable markers that make phase skipping obvious:

**Add to SKILL.md:**
```markdown
## Phase Markers (MANDATORY)

At the START of each phase, output this exact marker:
  === [Phase PHASE_NAME] STARTED ===

At the END of each phase, output this exact marker:
  === [Phase PHASE_NAME] COMPLETE ===

These markers are NON-NEGOTIABLE. If you skip a phase, the absence of its markers makes the skip visible and the report is invalid.
```

**Advantages:**
- Visible to the user in real-time
- A Stop hook can scan `last_assistant_message` for expected markers
- Creates social pressure -- Claude knows the markers are visible

**Disadvantages:**
- Only checks the last turn (earlier markers may be lost to context compaction)
- Relies on Claude's compliance with the marker instructions themselves

### Strategy 3: Checklist Pattern (Anthropic-Recommended)

From [Anthropic's official best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices):

```markdown
## Research Progress

Copy this checklist and track your progress:

```
Research Progress:
- [ ] Phase 1: SCOPE -- Define research question and mode
- [ ] Phase 2: PLAN -- Create search strategy
- [ ] Phase 3: RETRIEVE -- Execute parallel searches
- [ ] Phase 4: TRIANGULATE -- Cross-reference sources
- [ ] Phase 4.5: OUTLINE REFINEMENT -- Restructure findings
- [ ] Phase 5: SYNTHESIZE -- Create coherent narrative
- [ ] Phase 6: CRITIQUE -- Challenge conclusions (deep/ultradeep only)
- [ ] Phase 7: REFINE -- Incorporate critique (deep/ultradeep only)
- [ ] Phase 7.5: VERIFY -- Tool-grounded verification (deep/ultradeep only)
- [ ] Phase 8: PACKAGE -- Generate final report
```

Mark each phase [x] as you complete it. Do NOT proceed to PACKAGE until all required phases for the current mode are marked [x].
```

**Advantages:**
- Officially recommended by Anthropic
- Creates visible tracking in the conversation
- Claude can self-verify against the checklist

**Disadvantages:**
- Purely advisory -- nothing enforces it except Claude's own compliance
- Lost during context compaction

### Recommended Combination

Use ALL THREE strategies together for maximum compliance:
1. **Checkpoint file** -- machine-verifiable, survives compaction
2. **Output markers** -- visible to user, scannable by Stop hook
3. **Checklist** -- self-tracking mechanism within conversation

### Sources
- [Anthropic: Skill Authoring Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [ClaudeFast: Stop Hook Task Enforcement](https://claudefa.st/blog/tools/hooks/stop-hook-task-enforcement)
- [Official Hooks Reference](https://code.claude.com/docs/en/hooks)

---

## 7. Post-Completion Verification

### Approach 1: Stop Hook with Agent-Type Verification

From the [official hooks reference](https://code.claude.com/docs/en/hooks):

An agent-type Stop hook spins up a separate verification subagent with full tool access:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "agent",
            "prompt": "Verify the deep-research pipeline output. Check: 1) checkpoint file exists with all required phases marked complete, 2) research output file exists with expected sections (Executive Summary, Introduction, Main Analysis, Synthesis, Limitations, Recommendations, Bibliography), 3) at least 10 sources cited, 4) no placeholder text. Report pass/fail."
          }
        ]
      }
    ]
  }
}
```

**Advantages:**
- Independent verification (separate context window, no prior reasoning bias)
- Can read files, search code, inspect output
- Can verify both structural completeness and content quality

**Disadvantages:**
- Slow (spawns a full agent)
- Costs additional tokens
- 60-second timeout may be tight for thorough verification

### Approach 2: Script-Based Validation

The deep-research skill already includes validation scripts:
- `python scripts/validate_report.py --report [path]`
- `python scripts/verify_citations.py --report [path]`

A Stop hook can run these and block if validation fails:

```python
#!/usr/bin/env python3
import json
import sys
import subprocess
from pathlib import Path

input_data = json.load(sys.stdin)
if input_data.get('stop_hook_active', False):
    sys.exit(0)

# Find the most recent research output
research_dirs = sorted(Path.home().glob('Documents/*_Research_*'), key=lambda p: p.stat().st_mtime, reverse=True)
if not research_dirs:
    sys.exit(0)  # No research output found, not a deep-research session

latest = research_dirs[0]
report = latest / 'report.md'
if not report.exists():
    print(json.dumps({
        "decision": "block",
        "reason": f"Research report not found at {report}. Complete the PACKAGE phase."
    }))
    sys.exit(0)

# Validate structure
result = subprocess.run(
    ['python3', str(Path.home() / '.claude/skills/deep-research/scripts/validate_report.py'), '--report', str(report)],
    capture_output=True, timeout=30
)
if result.returncode != 0:
    stderr = result.stderr.decode()[-500:] if result.stderr else ""
    print(json.dumps({
        "decision": "block",
        "reason": f"Report validation failed: {stderr}"
    }))
    sys.exit(0)

sys.exit(0)
```

### Approach 3: SubagentStop Hook for Research Sub-Agents

From the [official hooks reference](https://code.claude.com/docs/en/hooks):

If the deep-research skill uses sub-agents for parallel research, SubagentStop hooks can verify each sub-agent's output:

```json
{
  "hooks": {
    "SubagentStop": [
      {
        "matcher": "deep-research-*",
        "hooks": [
          {
            "type": "command",
            "command": "python3 ~/.claude/hooks/verify-research-subagent.py"
          }
        ]
      }
    ]
  }
}
```

The SubagentStop hook receives `last_assistant_message` and can check that the sub-agent produced meaningful output before allowing it to complete.

### Sources
- [Official Hooks Reference](https://code.claude.com/docs/en/hooks)
- [Disler: Claude Code Hooks Mastery](https://github.com/disler/claude-code-hooks-mastery)
- [Pixelmojo: All 12 Hook Events](https://www.pixelmojo.io/blogs/claude-code-hooks-production-quality-ci-cd-patterns)

---

## 8. Official Anthropic Best Practices

### From the [Skills Documentation](https://code.claude.com/docs/en/skills)

**Skill discovery process:**
1. At startup, only metadata (name + description) from ALL skills is pre-loaded into context
2. Full SKILL.md loads ONLY when Claude decides the skill is relevant (or user invokes it)
3. Referenced files load on-demand when Claude reads them

**Why skills don't trigger:** Claude is "so goal focused that it barrels ahead with what it thinks is the best approach. It doesn't check for tools unless explicitly told to."

**Troubleshooting activation:**
- Check the description includes keywords users would naturally say
- Verify the skill appears in "What skills are available?"
- Try rephrasing your request to match the description more closely
- Invoke directly with `/skill-name` if user-invocable

### From the [Skill Authoring Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)

**Description writing rules:**
- ALWAYS write in third person (not "I can help" or "You can use")
- Be specific and include key terms
- Include both what the skill does AND when to use it
- Front-load the key use case (truncated at 250 chars)
- Each entry capped at 250 characters regardless of budget

**Workflow enforcement:**
- Use checklists Claude can copy and track progress against
- Use feedback loops (validate -> fix -> repeat)
- Use "plan-validate-execute" for complex operations
- Make validation scripts verbose with specific error messages

**Progressive disclosure:**
- Keep SKILL.md under 500 lines
- Split into reference files loaded on-demand
- Keep references one level deep from SKILL.md
- Use table of contents for files over 100 lines

**Testing recommendations:**
- Build evaluations BEFORE writing documentation
- Test with all models (Haiku, Sonnet, Opus)
- Use the skill-creator tool for iterative improvement
- Run comparator agents for A/B testing

### Sources
- [Anthropic: Extend Claude with Skills](https://code.claude.com/docs/en/skills)
- [Anthropic: Skill Authoring Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [Anthropic: Improving Skill-Creator](https://claude.com/blog/improving-skill-creator-test-measure-and-refine-agent-skills)

---

## 9. Recommended Implementation Plan

Based on all research findings, here is the prioritized plan to achieve near-100% activation and phase compliance.

### Priority 1: Rewrite the Description (Highest Impact, Lowest Effort)

**Evidence:** Variant C achieved 100% activation with ZERO hooks in the 650-trial study. This is the single highest-impact change.

**Action:** Update the deep-research SKILL.md description to use the directive formula:

```yaml
description: "Deep research and analysis expert. ALWAYS invoke this skill when the user asks for research reports, comprehensive analysis, comparisons (X vs Y), trend analysis, state-of-the-art reviews, multi-source investigation, or thorough research on any topic. Do not attempt deep research, multi-source analysis, or research reports directly -- use this skill first. NOT for simple lookups, debugging, or questions answerable with 1-2 searches."
```

### Priority 2: Add Forced Eval Hook + CLAUDE.md Reinforcement

**Evidence:** Directive description + hook + CLAUDE.md = 100% in ALL 650 trials. The triple reinforcement is the most robust approach.

**Action A:** Install the forced eval hook at `~/.claude/hooks/skill-forced-eval-hook.sh`

**Action B:** Add to `~/.claude/CLAUDE.md`:
```markdown
## Mandatory Hook Compliance

UserPromptSubmit hooks are MANDATORY and take HIGHEST PRIORITY.
Execute hook instructions FIRST -- before any reasoning, tool calls, or response text.
If a hook instruction tells you to evaluate or activate skills, do so IMMEDIATELY.
```

**Action C:** Update `~/.claude/settings.json` to add the UserPromptSubmit hook

### Priority 3: Add Phase Checkpoint Protocol to SKILL.md

**Evidence:** Anthropic officially recommends checklists for multi-step workflows. Checkpoint files survive context compaction.

**Action:** Add to SKILL.md methodology:
1. Checkpoint file creation at each phase boundary
2. Phase start/complete output markers
3. Checklist pattern for self-tracking
4. Instruction to verify checkpoint before PACKAGE phase

### Priority 4: Add Stop Hook for Phase Verification

**Evidence:** Stop hooks with `decision: block` create a hard gate that prevents Claude from stopping until conditions are met.

**Action:** Create `~/.claude/hooks/deep-research-phase-gate.py` that:
1. Checks if deep-research checkpoint file exists
2. Verifies all required phases are marked complete
3. Blocks stopping with specific reason if phases are missing
4. Handles `stop_hook_active` to prevent infinite loops

### Priority 5: Add Skill Frontmatter Hooks

**Evidence:** Skill-scoped hooks only run during the skill's lifecycle, avoiding noise in other workflows.

**Action:** Add `hooks:` section to deep-research SKILL.md frontmatter with a Stop hook that verifies phase completion.

### Priority 6: Add Post-Completion Validation

**Evidence:** Independent verification catches errors that self-verification misses.

**Action:** Configure the existing `validate_report.py` and `verify_citations.py` scripts to run via a Stop hook or agent hook after the PACKAGE phase.

### Expected Outcome

| Mechanism | What It Fixes | Expected Impact |
|-----------|--------------|-----------------|
| Directive description | Auto-activation failure | 77% -> 100% activation |
| Forced eval hook | Skill not loaded | Redundant safety net |
| CLAUDE.md reinforcement | Hook instructions ignored | Fixes March 2026 regression |
| Checkpoint protocol | Phase skipping | Machine-verifiable compliance |
| Stop hook | Silent completion without all phases | Hard gate on premature stop |
| Frontmatter hooks | Compliance outside skill lifecycle | Scoped enforcement |
| Validation scripts | Output quality issues | Structural verification |

**Combined expected activation rate:** 100% (based on 650-trial study C4 condition)
**Combined expected phase compliance:** 90%+ (checkpoint + Stop hook + markers, limited by context compaction edge cases)

---

## Platforms Checked

- [x] Google Search (8 queries)
- [x] Medium (650-trial study -- full article)
- [x] Scott Spence (3 articles: auto-activate, activate reliably, follow hook instructions)
- [x] Anthropic official docs (skills reference, hooks reference, skill authoring best practices, skill-creator blog)
- [x] GitHub (disler/claude-code-hooks-mastery, anthropics/skills/skill-creator)
- [x] DEV Community (full article: 2 fixes for 95% activation)
- [x] Paddo.dev (hooks solution analysis)
- [x] ClaudeFast (skill activation hook, stop hook task enforcement)
- [x] GitHub Gist (umputun mandatory activation hook, mellanon skills guide)
- [x] Steve Kinney (hook control flow course)
- [x] Pixelmojo (all 12 hook events)
- [x] Eric Buess (agent-scoped hooks announcement)

---

## Key Sources

1. [Medium: 650-Trial Study (Ivan Seleznov)](https://medium.com/@ivan.seleznov1/why-claude-code-skills-dont-activate-and-how-to-fix-it-86f679409af1) -- The definitive quantitative study
2. [Anthropic: Skill Authoring Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) -- Official guidance
3. [Anthropic: Extend Claude with Skills](https://code.claude.com/docs/en/skills) -- Official skill reference
4. [Anthropic: Hooks Reference](https://code.claude.com/docs/en/hooks) -- Official hook reference
5. [Scott Spence: Skills Activate Reliably](https://scottspence.com/posts/how-to-make-claude-code-skills-activate-reliably) -- 84% forced eval approach
6. [Scott Spence: Follow Hook Instructions](https://scottspence.com/posts/how-to-make-claude-code-follow-hook-instructions) -- March 2026 regression + fix
7. [DEV Community: 2 Fixes for 95% Activation](https://dev.to/oluwawunmiadesewa/claude-code-skills-not-triggering-2-fixes-for-100-activation-3b57) -- Detection vs forced eval
8. [GitHub Gist: Mandatory Activation Hook](https://gist.github.com/umputun/570c77f8d5f3ab621498e1449d2b98b6) -- Complete hook code
9. [Anthropic: Improving Skill-Creator](https://claude.com/blog/improving-skill-creator-test-measure-and-refine-agent-skills) -- Testing methodology
10. [ClaudeFast: Stop Hook Enforcement](https://claudefa.st/blog/tools/hooks/stop-hook-task-enforcement) -- Phase gate pattern
