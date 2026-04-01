# Deep Research Methodology: 10-Phase Pipeline

## Overview

This document contains the detailed methodology for conducting deep research. The 10 phases (including sub-phases 4.5 and 7.5) represent a comprehensive approach to gathering, verifying, and synthesizing information from multiple sources.

## Inline Verification Principle (Inspired by MiroThinker)

**Verification is NOT just a post-hoc phase.** The highest-accuracy research framework (MiroThinker, 88.2% BrowseComp) builds verification INTO every reasoning step, not just at the end. Apply this principle throughout:

- **During RETRIEVE:** After each search result arrives, immediately assess: does this source look credible? Does the claim match what other sources say? Flag contradictions in real-time, don't wait for TRIANGULATE.
- **During SYNTHESIZE:** As you build arguments, check: is this conclusion supported by the evidence I screened, or am I extrapolating beyond what the sources actually say?
- **During REFINE:** When fixing critique findings, verify the fix doesn't introduce new inconsistencies (the "fake fix" problem — MiroThinker's ChainChecker catches these).

This does NOT replace the dedicated TRIANGULATE and VERIFY phases. It supplements them with continuous vigilance.

## High-Confidence Hallucination Vigilance

LLMs produce their most confident-sounding output on claims that are most likely to be hallucinated — a calibration inversion where surface fluency masks factual unreliability. Specific, detailed, authoritative-sounding claims (exact numbers, precise dates, named entities, causal mechanisms) are higher hallucination risk than vague or hedged claims. The model can fluently reproduce the *pattern* of confidence without having verified the *content*.

**Counter-intuitive rule: Be MORE skeptical of claims you're most confident about.**

**High-risk claim categories (ranked by severity-if-wrong, in descending order):**
1. **Causal claims** ("X causes Y because Z") — verify the causal mechanism, not just the correlation
2. **Precise quantitative claims** ("costs $Y/month," "achieves 94.3% accuracy") — require source verification even if they feel "obviously correct"
3. **Named-entity relationships** ("Company X acquired Company Y in 2024") — verify the specific relationship, not just that both entities exist
4. **Temporal claims** ("introduced in March 2025") — exact dates are frequently hallucinated
5. **Comparative claims** ("X is faster than Y") — verify the comparison was measured, not assumed

**Application across phases:**
- **RETRIEVE:** Don't skip searching for claims you think you already know. Training data may be outdated or wrong.
- **TRIANGULATE:** Give extra verification attention to claims where confidence is highest — these are the claims most likely to have subtle errors that pass unnoticed.
- **SYNTHESIZE:** When screening claims, flag any that feel "obviously true" for additional scrutiny. Obvious-feeling claims are where hallucination hides.
- **VERIFY:** Prioritize high-confidence claims for tool-grounded verification — they are the most dangerous if wrong because readers won't question them either.
- **PACKAGE:** When writing report prose, verify that confidence language ("research shows," "clearly," "demonstrates") is warranted by the evidence status from VERIFY. Do not upgrade hedged or single-source findings to definitive claims during report writing.

This principle augments the Inline Verification Principle above by targeting verification effort where it is most needed — on claims where confidence is highest and verification instinct is weakest.

## Replanning on Contradiction

When evidence at ANY phase contradicts the current research direction or a key assumption from Phase 1 (SCOPE):
1. **Stop and acknowledge** the contradiction explicitly
2. **Assess severity:** Does this invalidate a minor detail, or does it undermine the research question's framing?
3. **If minor:** Note the contradiction, continue with adjusted claim
4. **If major:** Return to OUTLINE REFINEMENT (Phase 4.5) to restructure. Do NOT continue building on a foundation that the evidence has undermined.

This selective rollback approach prevents the sunk-cost fallacy of continuing research in a direction the evidence no longer supports.

---

## Metacognitive Cycling Protocol (Think2)

Academic research on LLM self-correction shows that unstructured "think step-by-step" prompting underperforms structured metacognitive cycling. Studies on 8B-parameter models (Llama-3, Qwen-3) found ~3x improvement in successful self-correction rate when reasoning is structured into Planning, Monitoring, and Evaluation layers rather than freeform chain-of-thought. The Think2 approach structures each phase's reasoning into three layers:

**Before executing a phase (PLAN):**
- What is the specific goal of this phase?
- What inputs do I have, and what outputs must I produce?
- What are the most likely failure modes for this phase?

**During execution (MONITOR):**
- Am I making progress toward the phase goal, or am I stuck/drifting?
- Am I following the methodology, or have I deviated?
- Have I encountered any of the predicted failure modes?

**After completing a phase (EVALUATE):**
- Did I achieve the phase goal? What evidence confirms this?
- What was the quality of my output? (Be specific — count claims, sources, gaps)
- What should the next phase be especially careful about, given what I found?

**Application:** Each phase already has an Extended Thinking Task that provides phase-specific reasoning prompts. Wrap those within this Plan→Monitor→Evaluate cycle: the Extended Thinking Task becomes the PLAN step. After executing the phase's activities, run MONITOR (mid-phase self-check) and EVALUATE (post-phase quality check) as brief internal assessments before saving the checkpoint.

This is NOT additional time — it's structuring the thinking that already happens into a more effective pattern. The EVALUATE step's output feeds directly into the next phase's PLAN step, creating a continuous improvement loop across the pipeline.

**Note on MONITOR:** Unlike PLAN and EVALUATE (which have explicit checkpoints), MONITOR operates continuously during execution. Check against phase goals and predicted failure modes whenever you complete a sub-step. The most valuable MONITOR points are: during RETRIEVE when collecting parallel results (are sub-agents producing output?), during TRIANGULATE when resolving contradictions (am I anchoring on the first source?), during SYNTHESIZE when building arguments (am I extrapolating beyond the evidence?), during REFINE when applying fixes (is this fix introducing new inconsistencies?), during VERIFY when processing sub-agent results (is confirmation bias affecting my interpretation?), and during VERIFY Step 5 when running supersession searches (am I spending the budget on the most important claims?).

---

## Progress Reporting

**At the start of each phase, output a brief progress line to the user.** Long research sessions (5-45 minutes) with no visible progress feel broken. Format:

```
[Phase NAME] Brief description of what's happening...
[Phase NAME] Key metric update (e.g., "15/20 sources gathered, avg credibility 72/100")...
```

Use the phase name (e.g., `SCOPE`, `RETRIEVE`, `TRIANGULATE`), not a numeric index. This avoids ambiguity around half-phases (4.5, 7.5) and mode-dependent phase counts.

This applies to every phase. It is not optional.

---

## Task Registration and Output Directory

**Before starting Phase 1**, generate a unique task ID and create the output directory:

```bash
UUID8=$(uuidgen | cut -c1-8)
DATE=$(date +%Y%m%d)
OUTPUT_DIR=~/Documents/Research/[Topic_Slug]_${DATE}_${UUID8}
mkdir -p "$OUTPUT_DIR"
```

**Register the task** in `~/.claude/research-tasks.json` (create if doesn't exist):
```json
{
  "tasks": [
    {
      "uuid": "a7f3b2c1",
      "topic": "Cat Genomes Research",
      "status": "in_progress",
      "output_dir": "~/Documents/Research/Cat_Genomes_20260323_a7f3b2c1/",
      "start_time": "2026-03-23T16:00:00Z",
      "mode": "standard"
    }
  ]
}
```

Update the task status to `"completed"` in Phase 8 (PACKAGE) after the report is written.

---

## Checkpoint/Resume Protocol

**At the end of each phase, save a checkpoint file** to the research output directory as `_checkpoint.json`:

```json
{
  "phase_completed": "TRIANGULATE",
  "mode": "standard",
  "topic": "research topic here",
  "sources_gathered": 18,
  "output_dir": "/path/to/output/",
  "next_phase": "OUTLINE_REFINEMENT",
  "timestamp": "2026-03-22T14:30:00Z"
}
```

Use the phase name string (e.g., `"SCOPE"`, `"RETRIEVE"`, `"OUTLINE_REFINEMENT"`, `"VERIFY"`) for both `phase_completed` and `next_phase`. This avoids ambiguity with half-phases (4.5, 7.5).

**On invocation:** Before starting Phase 1, check the output directory for an existing `_checkpoint.json`. If found, offer to resume from the last completed phase. This prevents total loss of work when context compaction or session interruption occurs mid-research.

---

## Phase 1: SCOPE - Research Framing

**Objective:** Define research boundaries and success criteria

**Progress:** `[Phase SCOPE] Framing research question and defining boundaries...`

**Activities:**
1. Decompose the question into core components
2. Identify stakeholder perspectives
3. Define scope boundaries (what's in/out)
4. Establish success criteria
5. List key assumptions to validate
6. Classify topic time domain for temporal credibility decay (see Source Preference Heuristics). For multi-domain topics, assign per sub-question: e.g., "regulatory aspect = Legal/5yr, tooling aspect = Tech/90d"

**Extended Thinking Task (Think2 PLAN step):** Before committing to scope, think through 3 alternative framings of the research question. Consider: Is the question too broad? Too narrow? Is there a more precise version that would yield more actionable results? Choose the framing that best serves the user's likely intent. Identify likely failure modes: Are any assumptions unverifiable? Is the scope too broad for the selected mode?

**Think2 EVALUATE (after activities):** Did the scope capture all components of the research question? Count: how many sub-questions were identified, how many assumptions need validation? Flag anything the next phase (PLAN) should be especially careful about.

**Output:** Structured scope document with research boundaries. Save checkpoint.

---

## Phase 2: PLAN - Strategy Formulation

**Objective:** Create an intelligent research roadmap

**Progress:** `[Phase PLAN] Creating research strategy and query plan...`

**Activities:**
1. Identify primary and secondary sources
2. Map knowledge dependencies (what must be understood first)
3. Create search query strategy with variants
4. Plan triangulation approach
5. Estimate time/effort per phase
6. Define quality gates

**Extended Thinking Task (Think2 PLAN step):** Review any flagged concerns from SCOPE's evaluation. Then branch into multiple potential research paths — consider which paths are most likely to yield actionable evidence and which are dead ends. Converge on the optimal strategy before proceeding. Predict: which query formulations are most likely to fail? Which source types will be hardest to find?

**Think2 EVALUATE (after activities):** Does the plan cover all sub-questions from SCOPE? Count: how many search angles were identified? Are there any single-source dependencies in the plan? Flag gaps for RETRIEVE.

**Output:** Research plan with prioritized investigation paths. Save checkpoint.

---

## Phase 3: RETRIEVE - Parallel Information Gathering

**Objective:** Systematically collect information from multiple sources using parallel execution for maximum speed

**Progress:** `[Phase RETRIEVE] Launching N parallel searches + M sub-agents...`
Update progress after results arrive: `[Phase RETRIEVE] X/Y sources gathered, avg credibility Z/100...`

**Extended Thinking Task (Think2 PLAN step):** Before launching searches, review the query decomposition strategy. Which search angles are highest priority? Which are most likely to return nothing (apply exhaustion criteria proactively)? Plan the sub-agent lens assignments. Predict: which sources will be hardest to access (paywalls, Cloudflare)? Which sub-topics have the highest risk of correlated results across agents?

**CRITICAL: Execute ALL searches in parallel using a single message with multiple tool calls**

### Source Preference Heuristics

**When evaluating search results and choosing which sources to fetch/read deeply, follow this priority order:**

1. **Primary sources** — official documentation, research papers, government data, original datasets
2. **Authoritative analysis** — peer-reviewed journals, recognized industry analysts, established research organizations
3. **Quality journalism** — established publications with editorial standards and fact-checking processes
4. **Technical content from verified practitioners** — blog posts from recognized experts with verifiable credentials

**DEPRIORITIZE (lower credibility score, use only when primary sources are unavailable):**
- SEO-optimized aggregator sites ("Top 10 best X" listicles, "Ultimate guide to Y")
- AI-generated content farms (repetitive phrasing, no author attribution, thin content)
- Sites with excessive ads/popups (proxy for low editorial standards)
- Undated content with no author attribution
- Paraphrased/rewritten versions of primary sources (find the original instead)

**Temporal Credibility Decay:**
Source freshness matters differently depending on the topic domain. Apply domain-appropriate recency weighting:

| Domain | Half-life | Meaning |
|--------|-----------|---------|
| Breaking news / trending | 7 days | A 2-week-old news article is stale |
| Technology / software | 90 days | A 6-month-old tech review is outdated |
| Business / market data | 180 days | A 1-year-old market report is unreliable |
| Science / academic | 365 days | A 2-year-old paper is still relevant |
| Legal / regulatory | 5 years | A 3-year-old regulation is likely current |
| Historical / reference | No decay | A 10-year-old history source is fine |

**How to apply:** Sources past 2 half-lives from today should be deprioritized unless they are foundational/seminal works. When two sources conflict and one is significantly more recent in a fast-moving domain, favor the newer source (note this in contradiction resolution).

**Determine the domain at SCOPE time** (Activity 6) and apply the appropriate half-life throughout retrieval and triangulation. For research spanning multiple domains, assign the half-life per sub-question or section rather than a single global value.

This heuristic applies to both the main agent's search evaluation and to sub-agent prompts. Include this guidance in sub-agent prompts.

### Query Decomposition Strategy

Before launching searches, decompose the research question into 5-10 independent search angles:

1. **Core topic (semantic search)** - Meaning-based exploration of main concept
2. **Technical details (keyword search)** - Specific terms, APIs, implementations
3. **Recent developments (date-filtered)** - What's new in last 12-18 months (use current date from Step 0)
4. **Academic sources (domain-specific)** - Papers, research, formal analysis
5. **Alternative perspectives (comparison)** - Competing approaches, criticisms
6. **Statistical/data sources** - Quantitative evidence, metrics, benchmarks
7. **Industry analysis** - Commercial applications, market trends
8. **Critical analysis/limitations** - Known problems, failure modes, edge cases

### Parallel Execution Protocol

**Step 0: Get the current date**

Before ANY searches, retrieve today's date using Bash: `date +%Y-%m-%d`
Use the returned year for all date-filtered queries and recency checks. Do NOT assume a year from training data.

**Step 1: Launch ALL searches concurrently (single message)**

**CRITICAL: Use correct tool and parameters to avoid errors**

Choose ONE search approach per research session:

**Option A: Use WebSearch (built-in, no MCP required)**
- Standard web search with simple query string
- Parameters: `query` (required)
- Optional: `allowed_domains`, `blocked_domains`
- Example: `WebSearch(query="quantum computing 2025")`

**Option B: Use Exa MCP (if available, more powerful)**
- Advanced semantic + keyword search
- Tool name: `mcp__Exa__exa_search`
- Parameters: `query` (required), `type` (auto/neural/keyword), `num_results`, `start_published_date`, `include_domains`
- Example: `mcp__Exa__exa_search(query="quantum computing", type="neural", num_results=10)`

**Option C: Use search-cli (if installed, multi-provider)**
- Unified CLI aggregating Brave, Serper, Exa, Jina, and Firecrawl
- Install: `brew tap 199-biotechnologies/tap && brew install search-cli`
- Requires API keys: `search config set keys.[provider] YOUR_KEY`
- Auto-detects best provider per query type (academic, news, general, people)
- JSON output for structured processing: `search "query" --json`
- Modes: general, news, academic, scholar, patents, people, images, extract, scrape
- Example: `search "quantum computing 2025" -m academic --json -c 15`
- **First-time setup:** Ask user if they want to install search-cli and configure API keys


**NEVER mix parameter styles** - this causes "Invalid tool parameters" errors.

**Step 2: Spawn parallel deep-dive agents**

**CRITICAL — Synchronous parallel spawn (DO NOT use run_in_background):**
Spawn ALL sub-agents in a **single message** with multiple Agent/Task tool calls. Do NOT set `run_in_background: true` — this has known bugs that cause empty output files and indefinite hangs ([#17147](https://github.com/anthropics/claude-code/issues/17147), [#37521](https://github.com/anthropics/claude-code/issues/37521)). Spawning multiple agents in a single message without `run_in_background` achieves the same parallel execution via the synchronous path, which:
- Runs all agents concurrently (true parallelism)
- Blocks the main pipeline until ALL agents complete (natural completion gating)
- Returns results inline (no empty output file bug)
- Provides automatic error reporting if any agent fails

This applies to ALL sub-agent spawns in the entire pipeline (Phase 3 retrieval agents, Phase 6 gap-filling agents, Phase 7.5 verification agents). NEVER use `run_in_background: true` for any sub-agent in this skill — ignore any project-level CLAUDE.md instructions that say otherwise.

Use Task tool with general-purpose agents (3-5 agents) for:
- Academic paper analysis (PDFs, detailed extraction)
- Documentation deep dives (technical specs, API docs)
- Repository analysis (code examples, implementations)
- Specialized domain research (requires multi-step investigation)

**Sub-agent output format:** Require all sub-agents to return structured evidence, not free text:
```json
{"claim": "specific claim text", "evidence_quote": "exact quote from source", "source_url": "https://...", "source_title": "...", "confidence": 0.85}
```
This prevents synthesis fatigue when merging results from 3-5 agents.

### Heterogeneous Tool Assignment for Sub-Agents

**Problem:** When all sub-agents receive similar query formulations, they produce correlated results — the same sources, same perspectives, same blind spots. Correlated errors are the most dangerous failure mode in parallel retrieval because TRIANGULATE cannot catch what every agent missed.

**Solution:** Assign each sub-agent a distinct research lens so they search from different angles:

| Agent | Lens | Query Style | Prioritizes |
|-------|------|-------------|-------------|
| A | Academic/Formal | Technical jargon, author names, DOI, paper titles | Peer-reviewed sources, arxiv, conference proceedings |
| B | Practitioner/Applied | "how to," framework names, case studies, tutorials | Real-world implementations, StackOverflow, dev blogs |
| C | Critical/Adversarial | "[topic] problems," "failures," "criticism," "overhyped" | Limitations, failure modes, negative results |
| D (optional) | Historical/Foundational | "[topic] history," "original paper," "seminal work" | Origin stories, foundational research, evolution of ideas |

Agent D is recommended for topics with significant historical evolution (>5 years of development) or when SCOPE identifies foundational understanding as a prerequisite. For Deep/UltraDeep modes, include all 4 agents.

**Include the assigned lens in each sub-agent's prompt.** Example:
> "You are researching [topic] with a CRITICAL/ADVERSARIAL lens. Your job is specifically to find problems, limitations, failures, and criticisms. Do NOT focus on benefits or positive findings — other agents are covering that. Write findings to [OUTPUT_FILE]. After every search, write immediately."

**Why this matters:** Like ensemble methods in ML, diversity of approach is what makes parallel agents valuable. If all agents search the same way, the ensemble has no advantage over a single agent. Heterogeneous assignment ensures that at least one agent is looking where the others aren't.

**Relationship to Query Decomposition Strategy:** The query decomposition angles (above) guide the main agent's Step 1 parallel searches for broad coverage. The lens assignments guide Step 2 sub-agents for sustained deep investigation. There is intentional overlap — sub-agents deepen the angles that benefit from multi-step research, while Step 1 searches provide breadth.

**Example parallel execution (using WebSearch):**
```
[Single message with multiple tool calls]
- WebSearch(query="quantum computing 2025 state of the art")
- WebSearch(query="quantum computing limitations challenges")
- WebSearch(query="quantum computing commercial applications [CURRENT_YEAR]")
- WebSearch(query="quantum computing vs classical comparison")
- WebSearch(query="quantum error correction research", allowed_domains=["arxiv.org", "scholar.google.com"])
- Task(subagent_type="general-purpose", description="Academic deep dive", prompt="LENS: ACADEMIC/FORMAL. Deep dive into quantum computing academic papers from [CURRENT_YEAR]. Use technical jargon, author names, DOI searches. Prioritize peer-reviewed sources, arxiv, conference proceedings. Write findings to [OUTPUT_FILE]. After every search, write immediately. Prioritize primary sources over SEO content.")
- Task(subagent_type="general-purpose", description="Practitioner analysis", prompt="LENS: PRACTITIONER/APPLIED. Analyze quantum computing real-world implementations, industry reports, case studies, and market data. Use practical terms, framework names. Write findings to [OUTPUT_FILE]. After every search, write immediately. Prioritize primary sources over SEO content.")
- Task(subagent_type="general-purpose", description="Critical analysis", prompt="LENS: CRITICAL/ADVERSARIAL. Find problems, limitations, failures, and criticisms of quantum computing. Search for 'quantum computing problems', 'overhyped', 'limitations'. Do NOT focus on benefits. Write findings to [OUTPUT_FILE]. After every search, write immediately. Prioritize primary sources over SEO content.")
```

**NOTE:** All Phase 3 retrieval sub-agent prompts MUST include: (1) write-after-search protocol, (2) output file path, (3) source preference heuristics, (4) assigned research lens (see Heterogeneous Tool Assignment). The examples above show the minimum required additions. Phase 6 gap-filling sub-agents and Phase 7.5 verification sub-agents have different requirements — see those phases for their specific prompt instructions.

**Example parallel execution (using Exa MCP - if available):**
```
[Single message with multiple tool calls]
- mcp__Exa__exa_search(query="quantum computing state of the art", type="neural", num_results=10, start_published_date="[use current year from Step 0]")
- mcp__Exa__exa_search(query="quantum computing limitations", type="keyword", num_results=10)
- mcp__Exa__exa_search(query="quantum computing commercial", type="auto", num_results=10, start_published_date="[use current year from Step 0]")
- mcp__Exa__exa_search(query="quantum error correction", type="neural", num_results=10, include_domains=["arxiv.org"])
- Task(subagent_type="general-purpose", description="Academic deep dive", prompt="LENS: ACADEMIC/FORMAL. Deep dive into quantum computing academic papers. Use technical jargon, author names, DOI searches. Write findings to [OUTPUT_FILE]. After every search, write immediately. Prioritize primary sources over SEO content.")
- Task(subagent_type="general-purpose", description="Practitioner analysis", prompt="LENS: PRACTITIONER/APPLIED. Analyze quantum computing real-world implementations, industry reports, case studies, and market data. Use practical terms, framework names. Write findings to [OUTPUT_FILE]. After every search, write immediately. Prioritize primary sources over SEO content.")
- Task(subagent_type="general-purpose", description="Critical analysis", prompt="LENS: CRITICAL/ADVERSARIAL. Find problems, limitations, failures, and criticisms of quantum computing. Do NOT focus on benefits. Write findings to [OUTPUT_FILE]. After every search, write immediately. Prioritize primary sources over SEO content.")
```

**Step 3: Collect and organize results**

As results arrive:
1. Extract key passages with source metadata (title, URL, date, credibility)
2. Track information gaps that emerge
3. Follow promising tangents with additional targeted searches
4. Maintain source diversity (mix academic, industry, news, technical docs)
5. Monitor for quality threshold (see FFS pattern below)

### First Finish Search (FFS) Pattern

**Note:** This pattern applies to Step 1 parallel searches only. Sub-agents (Step 2) must ALL complete before Phase 4 — see Phase 3 Completion Gate below.

**Adaptive completion based on quality threshold:**

**Quality gate:** Proceed to Phase 4 when FIRST threshold reached:
- **Quick mode:** 10+ sources with avg credibility >60/100 OR 2 minutes elapsed
- **Standard mode:** 15+ sources with avg credibility >60/100 OR 5 minutes elapsed
- **Deep mode:** 25+ sources with avg credibility >70/100 OR 10 minutes elapsed
- **UltraDeep mode:** 30+ sources with avg credibility >75/100 OR 15 minutes elapsed

**Continue background searches:**
- If threshold reached early, continue remaining parallel searches in background
- Additional sources used in Phase 5 (SYNTHESIZE) for depth and diversity
- Allows fast progression without sacrificing thoroughness

**Exhaustion criteria (when to STOP searching):**
The FFS pattern defines when you have ENOUGH. These criteria define when information likely DOESN'T EXIST — preventing endless searching for something that isn't published:

- **5+ searches** on the same sub-topic with zero relevant results → declare "No published evidence found for [sub-topic]"
- **3+ different query formulations** (keyword, semantic, domain-specific) all return nothing → the information likely doesn't exist in searchable form
- **All found sources are beyond 2 half-lives** old with no recent updates → topic may be dormant; note "No recent activity found"

**When declaring absence, this IS a finding.** Document it in the report:
> "No published evidence was found for [claim/topic] despite [N] searches across [M] query formulations. This absence is itself informative — it suggests [the topic is under-researched / the claim is unsupported / the question may be novel]."

Do NOT keep searching past exhaustion criteria hoping something will appear. Absence of evidence, after systematic search, is data.

### Quality Standards

**Source diversity requirements:**
- Minimum 3 source types (academic, industry, news, technical docs)
- Temporal diversity (mix of recent 12-18 months + foundational older sources)
- Perspective diversity (proponents + critics + neutral analysis)
- Geographic diversity (not just US sources)

**Credibility tracking:**
- Score each source 0-100 using source_evaluator.py
- Flag low-credibility sources (<40) for additional verification
- Prioritize high-credibility sources (>80) for core claims

**Techniques:**
- Use WebSearch for current information (primary tool)
- Use search-cli for multi-provider aggregated search (if installed)
- Use WebFetch for deep dives into specific sources (secondary)
- Use Exa search (via WebSearch with type="neural") for semantic exploration
- Use Grep/Read for local documentation
- Execute code for computational analysis (when needed)
- Use Task tool to spawn parallel retrieval agents (3-5 agents)

### Operational Reliability Protocol

**These rules prevent common failure modes during retrieval without affecting research accuracy.** The three protocols work together: the write-after-search pattern creates the file artifacts that stuck-agent detection monitors, and blocked-site handling is a specialized application of write-after-search for error scenarios.

#### 1. Write-After-Search Protocol

The initial parallel search burst (Step 1) launches all searches concurrently in a single message — this is unaffected. The write-after-search protocol applies to what happens **after** the burst results arrive and during **follow-up searches**:

- **After the Step 1 parallel results arrive:** Immediately write ALL results to disk before performing any follow-up searches.
- **All subsequent follow-up searches** (Step 3 tangents, gap-filling queries) must follow the strict pattern:

```
Follow-up Search → Write findings to file → Follow-up Search → Write findings to file
```

**NEVER perform a follow-up search without first writing all pending results to disk.** Context compaction can destroy unsaved search results. Writing before each follow-up ensures no findings are lost, even if the session is interrupted or context is compacted.

**For sub-agents** spawned via the Task tool, the write-after-search pattern applies to every search since sub-agents execute sequentially. Include this instruction in their prompt along with a specific output file path (e.g., `/tmp/research_agent_N.md`):
> "Write all findings to [OUTPUT_FILE_PATH]. After every search or fetch, immediately write your findings to your output file. Never accumulate multiple search results in memory without saving. The pattern is: Search → Edit file → Search → Edit file. No exceptions."

#### 2. Sub-Agent Failure Handling

**With synchronous parallel spawn (the default — see Step 2), sub-agents that fail return errors inline.** The file-monitoring approach below is a fallback for edge cases where an agent produces partial output.

**If a sub-agent returns an error or empty result:**
1. Read any partial output it produced
2. Launch ONE replacement agent with:
   - The failed agent's partial output pre-loaded in the prompt
   - A note about which sections remain incomplete
   - A different query formulation (to avoid correlated failure)
3. If the replacement also fails: document the gap (see Completion Gate below)

**If a sub-agent hangs indefinitely** (no response returned after the synchronous call — rare with the synchronous path, but possible due to [API streaming stalls](https://github.com/anthropics/claude-code/issues/25979)):
- The pipeline will be blocked. If this happens, the main `claude -p` session may hit its max-turns limit, producing a partial report. The checkpoint protocol ensures partial work is recoverable.

#### 3. Blocked Site Handling (403 Errors)

When a WebFetch returns a 403, paywall, or access-denied error:
1. **Write what you already have** to your output file immediately
2. If browser automation tools are available (e.g., `mcp__claude-in-chrome`), try the original URL via browser
3. Otherwise, try ONE alternative URL for the same information
4. **Write again** after the attempt
5. Move on — do NOT try multiple alternative URLs in a row without writing

This prevents the failure mode where an agent enters a retry loop on blocked sites, wasting context and time without producing output.

#### Phase 3 Completion Gate

**MANDATORY — Do NOT proceed to Phase 4 until ALL sub-agents have completed.** This is a hard gate, not a suggestion. Triangulation requires ALL retrieved evidence, not just the first results that arrive. Skipping ahead with incomplete evidence produces reports with systematic blind spots.

**With synchronous parallel spawn (see Step 2), this gate is automatically enforced** — the pipeline blocks until all agents in the single-message spawn complete. No manual monitoring is needed. If any agent fails, its error is returned inline and you MUST launch a replacement before proceeding.

**Retry logic for failed sub-agents:**
1. If a sub-agent returns an error or empty result: launch ONE replacement agent with a different query formulation
2. If the replacement also fails: document the coverage gap explicitly — "The [lens] perspective is underrepresented because sub-agent retrieval failed despite retry. The following research angles were not covered: [list]." Include this in the report's Limitations section.
3. NEVER proceed to Phase 4 with zero results from a sub-agent without either a successful retry OR an explicit documented gap.

**Maximum 1 retry per failed sub-agent.** Do not retry more than once — if two attempts fail, the information may not be available, and further retries waste budget.

The FFS (First Finish Search) pattern above applies only to the initial parallel search burst (Step 1). It does NOT grant permission to skip ahead while sub-agents (Step 2) are still running. Sub-agent results are deep-dive evidence that triangulation depends on for cross-referencing.

**Think2 EVALUATE (after activities):** Count sources gathered vs. target. Assess: what percentage of PLAN's search angles yielded results? Which angles came up empty — is that exhaustion or bad queries? What does the next phase (TRIANGULATE) need to watch for?

**Output:** Incrementally-persisted research files with source tracking, credibility scores, and coverage map. Save checkpoint.

---

## Phase 4: TRIANGULATE - Cross-Reference Verification

**Objective:** Validate information across multiple independent sources

**Progress:** `[Phase TRIANGULATE] Cross-referencing X sources, Y claims to verify...`

**Extended Thinking Task (Think2 PLAN step):** Review RETRIEVE's evaluation for coverage gaps and flagged issues. Then think through which claims are most likely to have conflicting evidence. What are the controversial or rapidly-evolving aspects of this topic? Focus verification effort there.

**Activities:**
1. Identify claims requiring verification
2. Cross-reference facts across 3+ sources
3. Identify and **resolve** contradictions (not just flag them — see protocol below)
4. Assess source credibility
5. Note consensus vs. debate areas
6. Document verification status per claim

### Contradiction Resolution Protocol

When sources disagree on a claim, do NOT simply flag "sources disagree" and move on. Resolve each contradiction:

1. **Identify the specific claim** where sources disagree
2. **Compare source authority** — use credibility scores to weight which source is more trustworthy
3. **Check recency** — apply the temporal credibility decay half-life (see Source Preference Heuristics) to determine whether the age difference is material. A source within 1 half-life is still current; beyond 2 half-lives, favor the newer source
4. **Seek a tiebreaker** — look for a third independent source that confirms one position
5. **Present the resolution in the report** with explicit reasoning:
   > "Source A claims X [1], while Source B claims Y [2]. Based on [Source A's higher authority / more recent data / third source C confirming X], X appears more accurate because [specific reasoning]."
6. **If genuinely unresolvable** — present both positions with equal weight and explicitly label as "contested":
   > "This remains contested: Source A claims X [1] while Source B claims Y [2]. No tiebreaking evidence was found."

### Anchoring Bias Countermeasures

Claude exhibits anchoring bias — once a conclusion forms early in research (based on the first few search results), it resists contradictory evidence that arrives later. This is a documented failure mode that corrupts research objectivity. Countermeasures:

**1. Devil's Advocate Searches (mandatory):**
After initial cross-referencing, dedicate 2-3 searches SPECIFICALLY to finding evidence that CONTRADICTS the emerging thesis. Search for:
- "[topic] criticism problems limitations"
- "[topic] wrong overhyped debunked"
- "[main conclusion] counterargument alternative"

If no contradictory evidence is found, that's a data point (strong consensus). If contradictory evidence IS found, it must be integrated via the Contradiction Resolution Protocol above.

**2. Steelman the Opposition:**
When presenting contradictions in the report, always present the STRONGEST version of the opposing view — not a strawman. If Source B disagrees with the emerging thesis, present Source B's argument as compellingly as possible before explaining why the evidence favors a different conclusion (or labeling it as contested).

**3. Recency Awareness:**
Early search results are not inherently more accurate. Explicitly check whether later-discovered sources contain more recent data that supersedes earlier findings. Do not let the first source set an anchor that later sources merely confirm.

### Source Independence Detection

Before accepting that a claim has "3+ independent sources," verify the sources are actually independent — not all citing the same original. This prevents circular citation from inflating confidence.

**For each major claim with 2+ sources, check:**
1. **Do the sources cite each other?** If Source B explicitly references Source A, they are not independent — Source B is an echo of Source A.
2. **Do they trace to the same original?** If three blog posts all summarize the same research paper, that's 1 source with 3 echoes, not 3 independent sources. Look for the original and cite it instead.
3. **Are they from the same organization/author?** Multiple publications from the same research group on the same topic count as 1 perspective, not independent confirmation.

**Independence scoring (affects downstream SYNTHESIZE gate):**
- 3+ truly independent sources → **effective source count = actual count** (proceed normally)
- 1 original + multiple echoes → **effective source count = 1** regardless of echo count (label as "widely reported but single-origin" in the report)
- 1 source only, no echoes → **effective source count = 1** (label as "single-source, unverified" in the report)

The SYNTHESIZE phase's atomic claim screening uses effective source count (not raw count) when checking "2+ independent sources." A claim with 5 blog posts all citing the same study has effective count = 1 and will be flagged as single-source.

**When independence is unclear:** Check the publication dates. If multiple sources appeared within days of each other on the same claim, they likely trace to a common press release or original report. Find the original.

**Quality Standards:**
- Core claims must have 3+ **independent** sources (per independence check above)
- Flag any single-source or single-origin information
- Note recency of information
- Identify potential biases
- Every contradiction must be resolved or labeled "contested" — no silent disagreements
- Devil's advocate searches must be performed — no exceptions

**Think2 EVALUATE (after activities):** Count: how many claims were verified vs. contested vs. single-source? How many contradictions were resolved vs. left contested? Did devil's advocate searches uncover anything that changes the emerging thesis? Flag weak claims for SYNTHESIZE screening.

**Output:** Verified fact base with confidence levels, independence assessments, resolved contradictions, and devil's advocate search results. Save checkpoint.

---

## Phase 4.5: OUTLINE REFINEMENT - Dynamic Evolution (WebWeaver 2025)

**Objective:** Adapt research direction based on evidence discovered

**Progress:** `[Phase OUTLINE REFINEMENT] Comparing initial scope against discovered evidence...`

**Extended Thinking Task (Think2 PLAN step):** Think through whether the evidence gathered actually supports the original outline structure. Are there findings that don't fit any current section? Are there sections with weak evidence that should be demoted? Would a domain expert organize this information differently?

**Problem Solved:** Prevents "locked-in" research when evidence points to different conclusions or uncovers more important angles than initially planned.

**When to Execute:**
- **Standard/Deep/UltraDeep modes only** (Quick mode skips this)
- After Phase 4 (TRIANGULATE) completes
- Before Phase 5 (SYNTHESIZE)

**Activities:**

1. **Review Initial Scope vs. Actual Findings**
   - Compare Phase 1 scope with Phase 3-4 discoveries
   - Identify unexpected patterns or contradictions
   - Note underexplored angles that emerged as critical
   - Flag overexplored areas that proved less important

2. **Evaluate Outline Adaptation Need**

   **Signals for adaptation (ANY triggers refinement):**
   - Major findings contradict initial assumptions
   - Evidence reveals more important angle than originally scoped
   - Critical subtopic emerged that wasn't in original plan
   - Original research question was too broad/narrow based on evidence
   - Sources consistently discuss aspects not in initial outline

   **Signals to keep current outline:**
   - Evidence aligns with initial scope
   - All key angles adequately covered
   - No major gaps or surprises

3. **Refine Outline (if needed)**

   **Update structure to reflect evidence:**
   - Add sections for unexpected but important findings
   - Demote/remove sections with insufficient evidence
   - Reorder sections based on evidence strength and importance
   - Adjust scope boundaries based on what's actually discoverable

   **Example adaptation:**
   ```
   Original outline:
   1. Introduction
   2. Technical Architecture
   3. Performance Benchmarks
   4. Conclusion

   Refined after Phase 4 (evidence revealed security as critical):
   1. Introduction
   2. Technical Architecture
   3. **Security Vulnerabilities (NEW - major finding)**
   4. Performance Benchmarks (demoted - less critical than expected)
   5. **Real-World Failure Modes (NEW - pattern emerged)**
   6. Synthesis & Recommendations
   ```

4. **Draft-Guided Query Refinement and Gap Filling**

   After refining the outline, review each section. For sections where evidence is thin, generate **refined search queries** that use specific terminology, findings, or author names discovered during initial retrieval. These targeted queries find sources that generic initial searches missed.

   **Query refinement technique:** Use knowledge from the draft to construct better queries:
   - If you found a key paper, search for papers that cite it or by the same authors
   - If you found a specific technical term, search for that exact term (initial generic queries may have missed it)
   - If a section has conflicting evidence, search specifically for the unresolved claim
   - If a section covers a niche subtopic, use domain-specific jargon discovered during retrieval

   **Execution:**
   - Launch 2-3 refined searches per weak section
   - Apply Source Preference Heuristics from Phase 3
   - Quick retrieval only (don't restart full Phase 3)
   - Time-box to 2-5 minutes
   - Update triangulation and independence scoring for new evidence only

5. **Document Adaptation Rationale**

   Record in methodology appendix:
   - What changed in outline
   - Why it changed (evidence-driven reasons)
   - What additional research was conducted (if any)

**Quality Standards:**
- Adaptation must be evidence-driven (cite specific sources that prompted change)
- No more than 50% outline restructuring (if more needed, scope was severely mis scoped)
- Retain original research question core (don't drift into different topic entirely)
- New sections must have supporting evidence already gathered

**Think2 EVALUATE (after activities):** Did the outline change? If so, is every change evidence-driven (cite the source)? Count: how many sections were added/removed/reordered? Are any new sections still evidence-thin? Flag remaining gaps for SYNTHESIZE to handle.

**Output:** Refined outline that accurately reflects evidence landscape, ready for synthesis. Save checkpoint.

**Anti-Pattern Warning:**
- ❌ DON'T adapt outline based on speculation or "what would be interesting"
- ❌ DON'T add sections without supporting evidence already in hand
- ❌ DON'T completely abandon original research question
- ✅ DO adapt when evidence clearly indicates better structure
- ✅ DO document rationale for changes
- ✅ DO stay within original topic scope

---

## Phase 5: SYNTHESIZE - Deep Analysis

**Objective:** Connect insights and generate novel understanding

**Progress:** `[Phase SYNTHESIZE] Connecting insights across X verified claims...`

### Atomic Claim Screening (Error Amplification Prevention)

Before synthesizing, screen each major claim for independent verifiability. This prevents the "Spark to Fire" failure mode (DeepMind, 2026) where errors in one part of the evidence base amplify through synthesis into systematically wrong conclusions.

**For each major claim entering synthesis:**
1. Does this claim have an **effective source count** of 2+ (per independence scoring from TRIANGULATE — not raw count, which may include echoes of the same original)?
2. Was this claim verified during TRIANGULATE, or is it an unverified carryover?
3. Is this claim from a high-credibility source (>60/100) or a low-credibility one?

**Screening decision:**
- 2+ independent sources + verified → **ACCEPT into synthesis**
- 1 source only + verified → **ACCEPT but label as "single-source" in the report**
- Unverified + any source count → **DO NOT synthesize** — return to TRIANGULATE for this specific claim, or exclude from synthesis and note in Limitations
- Low-credibility source only → **DO NOT synthesize** — seek a higher-credibility source or exclude

This prevents the hub-corruption failure: if one bad claim is accepted into synthesis, it can distort the entire report's conclusions. Screening catches it before amplification.

**Activities:**
1. Screen claims via atomic claim protocol above
2. Identify patterns across ACCEPTED claims only
3. Map relationships between concepts
4. Generate insights beyond source material
5. Create conceptual frameworks
6. Build argument structures
7. Develop evidence hierarchies

**Extended Thinking Task (Think2 PLAN step):** Think through non-obvious connections and second-order implications. What patterns emerge when you look at the evidence as a whole that aren't visible in any single source? What would a domain expert notice that a generalist might miss? Are any of your emerging conclusions dependent on a single source — if so, how confident should you be?

**Think2 EVALUATE (after activities):** Count: how many claims passed screening vs. were rejected? Are any conclusions dependent on a single source? Do the insights go beyond what any individual source says (genuine synthesis) or are they just summaries? Flag any single-source conclusions for CRITIQUE.

**Output:** Synthesized understanding with insight generation, with claim acceptance/rejection log. Save checkpoint.

---

## Phase 6: CRITIQUE - Quality Assurance

**Objective:** Rigorously evaluate research quality

**Progress:** `[Phase CRITIQUE] Running red-team analysis and identifying gaps...`

**Extended Thinking Task (Think2 PLAN step):** Think through what a skeptical domain expert would challenge about these findings. What claims feel weakest? Where is the evidence thinnest? What alternative explanations haven't been considered?

**Activities:**
1. Review for logical consistency
2. Check citation completeness
3. Identify gaps or weaknesses
4. Assess balance and objectivity
5. Verify claims against sources
6. Test alternative interpretations

**Red Team Questions:**
- What's missing?
- What could be wrong?
- What alternative explanations exist?
- What biases might be present?
- What counterfactuals should be considered?

**Persona-Based Critique (Deep/UltraDeep only):**
Simulate 2-3 specific critic personas relevant to the topic:
- "Skeptical Practitioner" — Would someone doing this daily trust these findings?
- "Adversarial Reviewer" — What would a peer reviewer reject?
- "Implementation Engineer" — Can these recommendations actually be executed?

**Critical Gap Loop-Back with Targeted Sub-Agents:**
If critique identifies a critical knowledge gap (not just a writing issue):
1. **Spawn 1-2 targeted sub-agents** via the Task tool to investigate the specific gap. Each sub-agent gets a focused prompt describing exactly what's missing and where to look. Include Source Preference Heuristics from Phase 3 in the sub-agent prompt.
2. Sub-agents follow the same write-after-search protocol and output file path requirements as Phase 3 sub-agents.
3. Wait for gap-filling sub-agents to complete (same stuck-agent monitoring applies).
4. Integrate new evidence into the existing research before proceeding to Phase 7.
5. **Time-box to 5 minutes** (sub-agents need startup time, so 3 minutes is too tight). If gaps cannot be filled, document them explicitly as limitations in the final report.

This is more powerful than the original "return to Phase 3" approach because targeted sub-agents can investigate specific deficiencies in parallel without restarting the entire retrieval pipeline.

**Think2 EVALUATE (after activities):** Count: how many critical gaps were found vs. minor issues? Were gap-filling sub-agents needed? Did any critique finding fundamentally challenge a conclusion from SYNTHESIZE? Flag the most damaging findings for REFINE priority.

**Output:** Critique report with improvement recommendations. Save checkpoint.

---

## Phase 7: REFINE - Iterative Improvement

**Objective:** Address gaps and strengthen weak areas

**Progress:** `[Phase REFINE] Addressing critique findings and strengthening weak areas...`

**Extended Thinking Task (Think2 PLAN step):** Review the critique report. Which issues are most damaging to the research's credibility? Prioritize those fixes. Think through whether the proposed fixes might introduce new inconsistencies.

**Activities:**
1. Conduct additional research for gaps
2. Strengthen weak arguments
3. Add missing perspectives
4. Resolve contradictions
5. Enhance clarity
6. Verify revised content

**Think2 EVALUATE (after activities):** Did each critique finding get addressed? Count: how many gaps were filled vs. documented as limitations? Did any fixes introduce new inconsistencies (the "fake fix" problem)? Is the research ready for verification?

**Output:** Strengthened research with addressed deficiencies. Save checkpoint.

---

## Phase 7.5: VERIFY - Tool-Grounded Claim Verification (Deep/UltraDeep only)

**Objective:** Verify the research output using external tool checks, not internal self-reflection. Academic research (Huang et al., CRITIC framework) shows pure self-reflection can DECREASE accuracy — models change correct answers to wrong ones more often than they fix errors. Tool-grounded verification is the only reliable approach.

**Progress:** `[Phase VERIFY] Decomposing report into claims and verifying against sources...`

**Extended Thinking Task (Think2 PLAN step):** Before decomposing, think through which claims in the report are highest-risk for inaccuracy. Quantitative claims, causal claims, and claims that surprised you during research are the most likely to be wrong. Prioritize verifying those. Also: which claims are highest-risk for supersession based on domain half-life and source age? Plan supersession search budget allocation — spend on the most critical claims first. If verification persistently fails, which claims are the weakest and what information would the Retry Brief need to convey about them? (Query formulation is the subprocess's job — focus on characterizing the failures.)

**When to Execute:** Deep and UltraDeep modes only (Quick and Standard skip this).

**WARNING — DO NOT self-score.** Do NOT re-read the report and assign subjective quality scores. This is the "self-correction blind spot" — models are poor at catching their own reasoning mistakes (CorrectBench, 2025). Instead, use the Decompose-Retrieve-Verify pattern below, which uses external tool calls to ground every check.

### Step 1: Decompose Report into Atomic Claims

Extract the 10-20 most important factual claims from the draft report. For each claim, record:
- The exact claim text
- The citation number(s) attached to it
- The source URL(s) from the bibliography

Focus on claims that are:
- Central to the report's conclusions
- Quantitative (numbers, dates, percentages)
- Comparative ("X is better than Y")
- Causal ("X causes Y")

Skip claims that are:
- Common knowledge
- The author's own synthesis/opinion (clearly labeled as such)
- Trivially verifiable definitions

### Step 2: Spawn Citation Verification Sub-Agents

Spawn 2-3 sub-agents to verify claims in parallel. Each sub-agent gets a batch of claims and their cited source URLs.

**CRITICAL — Information Asymmetry Protocol:**
Verification sub-agents must receive ONLY the claims and their cited source URLs — NOT the full report, NOT the surrounding analysis, and NOT the report's conclusions. This prevents confirmation bias: a verifier who has read the full report will unconsciously seek to confirm its conclusions rather than genuinely checking the evidence.

**What to include in the verification prompt:**
- The exact claim text (isolated from its surrounding paragraph)
- The citation number and source URL
- The verification instructions below

**What to EXCLUDE from the verification prompt:**
- The full report draft
- The report's conclusions or synthesis
- Other claims (each batch should be verifiable without knowing what else the report says)
- The research question or scope (the verifier doesn't need to know the report's thesis)

**Limitation: claim text as implicit context.** Claim text inherently reveals partial context about the report's subject matter. The asymmetry protocol reduces but does not eliminate confirmation bias. To maximize the effect: (1) strip hedging language and evaluative framing from claims before sending (convert "our analysis shows X is significantly better than Y" to "X outperforms Y by N%"), and (2) accept that the protocol provides partial blinding, not full blinding — it prevents the verifier from knowing the report's overall narrative arc and conclusions, even though the topic domain will be apparent. If a claim contains a contextualizing preamble (e.g., "In the context of X, ..."), include it as-is — stripping it would change the claim's meaning and make verification meaningless.

**Batch composition:** When distributing claims across sub-agents, apply two shuffling rules: (1) no batch should contain more than 2 claims from the same report section, and (2) mix claim types (quantitative, causal, comparative) across batches rather than concentrating them. If the claim count and agent count make perfect distribution impossible, prioritize rule 1 over rule 2.

**Prompt for each verification sub-agent:**
> "You are a claim verification agent. You have NO context about what report these claims come from or what conclusions the report reaches. Your ONLY job is to check whether each cited source actually supports the claim.
>
> For each claim below, use WebFetch to retrieve the cited source URL and verify whether the source actually supports the claim. Do NOT rely on your training data — you MUST fetch and read the source.
>
> For each claim, report:
> - VERIFIED: Source content confirms the claim
> - QUESTIONABLE: Source exists but doesn't clearly support the claim, or the claim overstates/distorts what the source says
> - UNVERIFIABLE: Source URL returns 403/404/error, or content doesn't address the claim at all
> - CONTRADICTED: Source actually contradicts the claim
>
> Write results to [OUTPUT_FILE_PATH]. After every verification, immediately write to the file. Format:
> Claim: [exact claim text]
> Citation: [N]
> Source: [URL]
> Status: VERIFIED/QUESTIONABLE/UNVERIFIABLE/CONTRADICTED
> Evidence: [direct quote from the source, in quotation marks, with the surrounding sentence for context. Do NOT paraphrase — copy the exact text that supports or contradicts the claim.]
> ---"

Sub-agents follow the same reliability protocols: write-after-search, designated output file paths.

**Note on Phase 3 sub-agent requirements:** Verification sub-agents do not require a research lens (item 4 from Phase 3's NOTE) since they verify specific URLs rather than conducting open research. Source preference heuristics (item 3) apply only if a cited URL is inaccessible and the verifier must find an alternative source — in that case, follow the Source Preference Heuristics from Phase 3 and the Blocked Site Handling protocol.

### Step 3: Process Verification Results

Wait for all verification sub-agents to complete (same stuck-agent monitoring applies).

Read all verification results. Categorize:
- **All VERIFIED:** Proceed to Step 4 (completeness and source quality checks still apply, and Step 5 supersession checks may catch issues that citation verification cannot)
- **Any CONTRADICTED:** This is critical — the report contains a claim that is actively wrong. Return to Phase 7 (REFINE) to fix the specific claim. Remove or correct it with the contradicting evidence.
- **3+ QUESTIONABLE:** The report may be overstating its evidence base. Return to Phase 7 (REFINE) to soften overstated claims or find stronger supporting sources.
- **3+ UNVERIFIABLE:** Too many dead/blocked sources. Return to Phase 3 (RETRIEVE) to find replacement sources for unverifiable citations.

Before looping back, check the global loop-back budget (see Step 5's shared budget note). If the 2-cycle budget is exhausted, proceed to Step 4 instead of looping back, and document remaining issues in Limitations.

### Step 4: Completeness and Source Quality Check

After claim verification, do two quick tool-grounded checks:

**Completeness check:** Re-read the original research question from Phase 1 SCOPE. List each component of the question. For each component, verify that the report addresses it with at least one finding. If a component is unaddressed, note it as a gap.

**Source quality check:** Count sources by type (academic, industry, journalism, blog, SEO). If >30% of sources are blogs/SEO content, note this as a limitation. If <3 source types are represented, note as limitation.

These are structural checks (counting, matching) not subjective quality scoring.

### Step 5: Temporal Supersession Check (conditional)

**Objective:** Actively search for evidence that key claims have been superseded by newer information. Temporal credibility decay (Phase 3) is passive — it down-weights old sources at retrieval time. This step catches claims that were current when retrieved but have since been contradicted, replaced, or rendered obsolete — including cases where new information emerged during a long research session.

**Gate check:** Only execute when the topic domain's half-life (from Phase 1 SCOPE, Activity 6) is **≤90 days** (news/trending = 7d, tech/software = 90d). If domain half-life >90 days for all sub-questions, SKIP this step entirely and proceed to Think2 EVALUATE, then Phase 8 (PACKAGE). For multi-domain topics, apply only to claims in sub-questions with half-life ≤90 days.

**Budget:** Maximum 2 supersession searches per claim, maximum 10 total supersession searches per report. Use **WebSearch** for all supersession searches (these are discovery searches for newer information, not URL verification).

**Claim prioritization:** When eligible claims exceed the search budget, prioritize claims that are (a) central to the report's conclusions and (b) oldest relative to their domain half-life. Skip peripheral claims. Select the top N claims such that estimated search count fits within the 10-search budget, using worst-case estimates (2 searches each for claims beyond 2 half-lives). This prevents budget exhaustion on low-value checks, especially for 7-day half-life domains where nearly every source older than a week would trigger searches.

**For each prioritized claim:**

1. **Identify the claim's source date** — extract the publication date from the cited source. If a claim cites multiple sources, use the oldest source date to determine search effort (conservative — if the oldest supporting source is still current, the claim is likely current). If the source has no identifiable publication date, treat it as being at 2 half-lives old (maximum search effort). Undated sources in fast-moving domains are the highest risk for being outdated.
2. **If the source is within 1 half-life of today** — skip (still current)
3. **If the source is between 1-2 half-lives old** — run ONE supersession search
4. **If the source is beyond 2 half-lives** — run TWO supersession searches (higher risk of being outdated)

**Generating supersession search queries:** For each claim, identify the most specific named entity or metric (benchmark name, product name, framework name, version number) and use that as the primary search term. If the claim contains a quantitative result, search for the current state of that metric. If the claim is about an entity's status, search for the entity name plus the current year.

Query templates by claim type:
- Benchmark claims: `"[benchmark name] state of the art [current year]"` or `"[benchmark name] leaderboard [current year]"`
- Technology claims: `"[technology/framework] [current year] changes OR updates OR deprecated"`
- Market/pricing claims: `"[product/service] pricing [current year]"` or `"[product/service] pricing changes"`
- Research findings: `"[key finding terms] [current year] update OR contradicted OR replicated"`
- Factual claims about entities: `"[entity name] [current year]"` (catches acquisitions, shutdowns, pivots)

**Processing results:** For each supersession search result:
- If newer evidence **contradicts** the claim → mark as **SUPERSEDED** with the newer source
- If newer evidence **updates** the claim (e.g., new pricing, new version) → mark as **OUTDATED** with the current information
- If no newer evidence found → the claim stands (no status change needed — absence of superseding evidence is the default). Only record SUPERSEDED and OUTDATED statuses in the output to avoid noise.

**Output format for supersession results:**
```
Claim: [exact claim text]
Original Source Date: [date or "undated"]
Supersession Status: SUPERSEDED / OUTDATED
Newer Source: [URL]
Evidence: [what changed — brief summary of the superseding information]
---
```

**Step 5 loop-back decision (independent of Step 3):**
- **Any SUPERSEDED:** Return to Phase 7 (REFINE) to replace the claim with current information from the superseding source
- **3+ OUTDATED:** Return to Phase 7 (REFINE) to update the outdated claims with current data (OUTDATED is less severe than SUPERSEDED — individual outdated claims are noted as limitations rather than triggering rework)
- **Fewer than 3 OUTDATED and zero SUPERSEDED:** Proceed to Think2 EVALUATE → Phase 8 (PACKAGE)

**Maximum 2 loop-back cycles (global budget, shared with Step 3):** A single counter tracks total VERIFY → REFINE round-trips regardless of whether Step 3 or Step 5 triggered the loop-back. If the budget is exhausted, check whether Step 6 (Verifier-Guided Retry) should trigger before proceeding to PACKAGE.

### Step 6: Verifier-Guided Retry (conditional — Deep/UltraDeep only, one-shot)

**Objective:** When the loop-back budget is exhausted and persistent verification failures remain, spawn a fresh subprocess with isolated context to generate an independent second candidate, then merge the best evidence from both. Inspired by Marco DeepResearch (arXiv 2603.28376), which showed +12.1 average improvement from verification-guided retry with genuine context isolation.

**Trigger gate (ALL conditions must be met):**
1. Deep or UltraDeep mode
2. The 2-cycle loop-back budget is exhausted
3. Persistent failures remain in the MOST RECENT VERIFY pass (the one that exhausted the budget, not cumulative counts across all cycles): ≥2 CONTRADICTED (from Step 3), OR ≥3 QUESTIONABLE (from Step 3), OR ≥2 SUPERSEDED (from Step 5). Count each status type independently from its originating step.

If ANY condition is not met, proceed to PACKAGE and document remaining issues in Limitations (existing behavior).

**Key architectural principle:** Genuine context isolation requires spawning a NEW process. Instructing a Claude instance to "ignore prior context" within the same context window does not work — the model will still be influenced by prior searches and reasoning, producing correlated errors. The retry MUST be a subprocess with its own fresh context.

#### Phase 6A — Save Candidate A

**Progress:** `[Phase VERIFY] Step 6 triggered — saving Candidate A and preparing retry...`

1. Save the current report draft as `candidate_A.md` in the output directory
2. Save Candidate A's full verification results (all claim statuses from Steps 2-5) as `candidate_A_verification.md`
3. Record which claims failed and why (the specific CONTRADICTED/QUESTIONABLE/SUPERSEDED claims with their evidence)
4. Save checkpoint: `"phase_completed": "VERIFY_RETRY_STARTED"` with `"candidate_a_path"` and `"candidate_a_verification_path"` fields, so a resumed session can detect a retry was in progress and locate Candidate A

#### Phase 6B — Spawn Fresh Subprocess (Genuine Context Isolation)

**Progress:** `[Phase VERIFY] Spawning retry subprocess with fresh context...`

Prepare a Retry Brief (written to a temp file, then passed to `claude -p`):

```
RETRY BRIEF
============
ORIGINAL SCOPE: [paste the Phase 1 SCOPE output]
ORIGINAL PLAN: [paste the Phase 2 PLAN output]
OUTPUT DIRECTORY: [paste the actual resolved output directory path]
TOPIC DOMAIN HALF-LIFE: [paste the half-life assigned in SCOPE Activity 6]

SOURCE PREFERENCE HEURISTICS: Prioritize primary sources (official docs, research papers,
government data) over aggregator sites, AI-generated content, and SEO listicles. See the
Source Preference Heuristics in the deep-research methodology for the full priority order.

TEMPORAL CREDIBILITY DECAY: Sources past 2 half-lives should be deprioritized unless they
are foundational works. The topic domain half-life is stated above.

FAILED CLAIMS FROM FIRST PASS:
- Claim: [exact text] | Status: CONTRADICTED/QUESTIONABLE/SUPERSEDED | Reason: [brief]
- [repeat for each failed claim]

INSTRUCTIONS:
You are generating Candidate B for a research topic that already has a Candidate A.
Candidate A had persistent verification failures on the claims listed above.

Run a compressed research pipeline (CRITIQUE and REFINE are omitted because Candidate B's
claims will be merged into Candidate A's structure, which already went through the full
CRITIQUE/REFINE cycle — do not attempt additional refinement passes):
1. RETRIEVE: Use DIFFERENT query formulations than typical. Use the same heterogeneous
   sub-agent lenses (Academic/Practitioner/Critical) but with different specific search
   terms — correlated errors come from identical queries, not identical lenses. Pay
   special attention to finding ALTERNATIVE sources for the failed claims listed above.
2. TRIANGULATE: Cross-reference as normal, with special attention to the failed claims.
3. OUTLINE REFINEMENT: Adapt the outline if new evidence warrants it.
4. SYNTHESIZE: Synthesize normally.
5. Lightweight VERIFY: Run Steps 1-3 only (claim decomposition + citation verification).
   Skip Steps 4-6 to limit cost.

Save report to ${OUTPUT_DIRECTORY}/candidate_B.md
Save verification results to ${OUTPUT_DIRECTORY}/candidate_B_verification.md
```

**Spawn command:**
```bash
cat > /tmp/retry-brief-${UUID8}.txt << 'BRIEF'
[Retry Brief content]
BRIEF

# --dangerously-skip-permissions: Required because the subprocess has no interactive
# stdin (< /dev/null) and cannot prompt for tool permissions.
# --max-turns 80: Sufficient for compressed pipeline (RETRIEVE through lightweight VERIFY).
# --dangerously-skip-permissions: Required — subprocess has no interactive stdin.
claude -p "$(cat /tmp/retry-brief-${UUID8}.txt)" --max-turns 80 \
  --dangerously-skip-permissions < /dev/null 2>/tmp/retry-${UUID8}.err
```

**Failure detection:** After the subprocess exits, check:
1. Non-zero exit code (crash or max-turns exhausted) → fall back to Candidate A
2. `candidate_B.md` does not exist or is <500 words → empty/incomplete output → fall back
3. `candidate_B_verification.md` does not exist → incomplete VERIFY → fall back

If all three checks pass, proceed to Phase 6C. On any failure, proceed to PACKAGE with Candidate A and document persistent issues in Limitations. Do NOT attempt a second retry.

#### Phase 6C — Joint Verify and Merge

**Progress:** `[Phase VERIFY] Merging Candidate A and Candidate B...`

Wait for the subprocess to complete. Read Candidate B and its verification results from disk.

**Structure:** Use Candidate A's report structure as the skeleton (it went through the full pipeline including CRITIQUE/REFINE). Replace specific claims per the logic below, but keep A's section organization and heading hierarchy.

**For each major claim, compare Candidate A and Candidate B:**
- **Both agree (same conclusion, both verified):** High confidence — keep the better-evidenced version (stronger sources, more citations)
- **A verified, B not present or failed:** Keep A's version
- **B verified, A failed:** Replace with B's version and citation
- **Both failed:** The claim is genuinely unsupported — remove from main analysis, document in Limitations
- **A and B contradict each other:** Apply the Contradiction Resolution Protocol from Phase 4 (compare source authority, check recency, seek tiebreaker, present resolution with reasoning)
- **B introduces a new finding with no counterpart in A:** If the finding is relevant to the original SCOPE and verified, add it as a new subsection or append to the most relevant existing section. Do not add more than 2 new subsections to avoid scope creep.

**After claim-level merge:**
1. Merge bibliographies: deduplicate sources, renumber citations to be sequential
2. Consistency check: re-read the merged report and verify no section references a claim or citation that was removed/replaced during merge
3. Regenerate the executive summary to accurately reflect the merged content
4. If the merged report exceeds Candidate A's length by more than 20%, review for redundancy introduced by the merge — deduplicate overlapping evidence and prefer the more concise formulation when two versions are equivalent in evidence strength

The merged report goes directly to Phase 8 (PACKAGE) — no additional full VERIFY cycles.

**Cost:** Step 6 adds approximately 80-120% of the original research cost when triggered. For reports that pass verification normally (no persistent failures after 2 cycles), Step 6 adds ZERO cost. It is a one-shot retry — runs at most once per research task.

**Think2 EVALUATE (after activities):** Count: how many claims VERIFIED vs. QUESTIONABLE vs. CONTRADICTED vs. UNVERIFIABLE? How many claims were checked for supersession? How many were SUPERSEDED/OUTDATED? Did the supersession budget allocation target the right claims? Was Step 6 triggered? If so, how many claims improved in Candidate B vs Candidate A? Did the merge produce a stronger report than either candidate alone? What should PACKAGE emphasize in the methodology appendix?

**Output:** Verification results file with per-claim status and evidence. If Step 6 was triggered, also Candidate A, Candidate B, and merged report. Save checkpoint.

---

## Phase 8: PACKAGE - Report Generation

**Objective:** Deliver professional, actionable research

**Progress:** `[Phase PACKAGE] Generating final report with bibliography...`

**Extended Thinking Task (Think2 PLAN step):** Before writing, review the refined outline and verification results. Which findings are most important for the executive summary? Are there any VERIFY results (QUESTIONABLE/CONTRADICTED/SUPERSEDED/OUTDATED) that must be reflected in the limitations section? Does the bibliography need cleanup (duplicates, dead links)?

**Activities:**
1. Structure report with clear hierarchy
2. Write executive summary
3. Develop detailed sections
4. Create visualizations (tables, diagrams)
5. Compile full bibliography
6. Add methodology appendix
7. Include verification results summary (per-claim status from Phase 7.5 VERIFY) in the methodology appendix
8. If Step 6 (Verifier-Guided Retry) was triggered, include a methodology note: "A verification-guided retry was performed. The final report merges the strongest evidence from two independent research passes." List which claims were replaced from Candidate B.

**Think2 EVALUATE (after activities):** Does the report address every component of the original research question from SCOPE? Count: citations in text vs. bibliography entries — do they match? Are all VERIFY findings represented in the methodology appendix? Are supersession check results (SUPERSEDED/OUTDATED) documented alongside citation verification results? Is the executive summary accurate and not overstated relative to the evidence?

**Output:** Complete research report ready for use. Save final checkpoint.

---

## Advanced Features

### Graph-of-Thoughts Reasoning

Rather than linear thinking, branch into multiple reasoning paths:
- Explore alternative framings in parallel
- Pursue tangential leads that might be relevant
- Merge insights from different branches
- Backtrack and revise as new information emerges

### Parallel Agent Deployment

Use Task tool to spawn sub-agents for:
- Parallel source retrieval
- Independent verification paths
- Competing hypothesis evaluation
- Specialized domain analysis

### Adaptive Depth Control

Automatically adjust research depth based on:
- Information complexity
- Source availability
- Time constraints
- Confidence levels

### Citation Intelligence

Smart citation management:
- Track provenance of every claim
- Link to original sources
- Assess source credibility
- Handle conflicting sources
- Generate proper bibliographies
