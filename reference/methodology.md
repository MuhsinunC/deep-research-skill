# Deep Research Methodology: 8-Phase Pipeline

## Overview

This document contains the detailed methodology for conducting deep research. The 8 phases represent a comprehensive approach to gathering, verifying, and synthesizing information from multiple sources.

## Inline Verification Principle (Inspired by MiroThinker)

**Verification is NOT just a post-hoc phase.** The highest-accuracy research framework (MiroThinker, 88.2% BrowseComp) builds verification INTO every reasoning step, not just at the end. Apply this principle throughout:

- **During RETRIEVE:** After each search result arrives, immediately assess: does this source look credible? Does the claim match what other sources say? Flag contradictions in real-time, don't wait for TRIANGULATE.
- **During SYNTHESIZE:** As you build arguments, check: is this conclusion supported by the evidence I screened, or am I extrapolating beyond what the sources actually say?
- **During REFINE:** When fixing critique findings, verify the fix doesn't introduce new inconsistencies (the "fake fix" problem — MiroThinker's ChainChecker catches these).

This does NOT replace the dedicated TRIANGULATE and VERIFY phases. It supplements them with continuous vigilance.

## Replanning on Contradiction

When evidence at ANY phase contradicts the current research direction or a key assumption from Phase 1 (SCOPE):
1. **Stop and acknowledge** the contradiction explicitly
2. **Assess severity:** Does this invalidate a minor detail, or does it undermine the research question's framing?
3. **If minor:** Note the contradiction, continue with adjusted claim
4. **If major:** Return to OUTLINE REFINEMENT (Phase 4.5) to restructure. Do NOT continue building on a foundation that the evidence has undermined.

This selective rollback approach prevents the sunk-cost fallacy of continuing research in a direction the evidence no longer supports.

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

Use the phase name string (e.g., `"SCOPE"`, `"RETRIEVE"`, `"OUTLINE_REFINEMENT"`, `"SELF-EVALUATE"`) for both `phase_completed` and `next_phase`. This avoids ambiguity with half-phases (4.5, 7.5).

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

**Extended Thinking Task:** Before committing to scope, think through 3 alternative framings of the research question. Consider: Is the question too broad? Too narrow? Is there a more precise version that would yield more actionable results? Choose the framing that best serves the user's likely intent.

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

**Extended Thinking Task:** Branch into multiple potential research paths — consider which paths are most likely to yield actionable evidence and which are dead ends. Converge on the optimal strategy before proceeding.

**Output:** Research plan with prioritized investigation paths. Save checkpoint.

---

## Phase 3: RETRIEVE - Parallel Information Gathering

**Objective:** Systematically collect information from multiple sources using parallel execution for maximum speed

**Progress:** `[Phase RETRIEVE] Launching N parallel searches + M sub-agents...`
Update progress after results arrive: `[Phase RETRIEVE] X/Y sources gathered, avg credibility Z/100...`

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

**Example parallel execution (using WebSearch):**
```
[Single message with multiple tool calls]
- WebSearch(query="quantum computing 2025 state of the art")
- WebSearch(query="quantum computing limitations challenges")
- WebSearch(query="quantum computing commercial applications [CURRENT_YEAR]")
- WebSearch(query="quantum computing vs classical comparison")
- WebSearch(query="quantum error correction research", allowed_domains=["arxiv.org", "scholar.google.com"])
- Task(subagent_type="general-purpose", description="Analyze quantum computing papers", prompt="Deep dive into quantum computing academic papers from [CURRENT_YEAR], extract key findings and methodologies")
- Task(subagent_type="general-purpose", description="Industry analysis", prompt="Analyze quantum computing industry reports and market data, identify commercial applications")
- Task(subagent_type="general-purpose", description="Technical challenges", prompt="Extract technical limitations and challenges from quantum computing research")
```

**Example parallel execution (using Exa MCP - if available):**
```
[Single message with multiple tool calls]
- mcp__Exa__exa_search(query="quantum computing state of the art", type="neural", num_results=10, start_published_date="[use current year from Step 0]")
- mcp__Exa__exa_search(query="quantum computing limitations", type="keyword", num_results=10)
- mcp__Exa__exa_search(query="quantum computing commercial", type="auto", num_results=10, start_published_date="[use current year from Step 0]")
- mcp__Exa__exa_search(query="quantum error correction", type="neural", num_results=10, include_domains=["arxiv.org"])
- Task(subagent_type="general-purpose", description="Academic analysis", prompt="Analyze quantum computing academic papers")
```

**Step 3: Collect and organize results**

As results arrive:
1. Extract key passages with source metadata (title, URL, date, credibility)
2. Track information gaps that emerge
3. Follow promising tangents with additional targeted searches
4. Maintain source diversity (mix academic, industry, news, technical docs)
5. Monitor for quality threshold (see FFS pattern below)

### First Finish Search (FFS) Pattern

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

#### 2. Stuck Agent Detection and Recovery

When sub-agents are spawned for parallel retrieval, monitor them at escalating intervals:
- First check: 60 seconds after launch
- Second check: 3 minutes after launch
- Third check: 5 minutes after launch
- Subsequent checks: every 5 minutes

**Detection method:** Check each agent's designated output file line count with `wc -l [OUTPUT_FILE_PATH]`. If an agent's file line count has NOT increased between two consecutive checks, it is stuck. This requires that sub-agent prompts include a specific output file path (as specified in section 1 above).

**Recovery action:** Do not wait for the stuck agent. Launch a new replacement agent with:
- The stuck agent's partial output (read from its output file) pre-loaded in the prompt
- A note about which sections remain incomplete
- Stricter time expectations

Discard the stuck agent's results if it eventually completes after the replacement has finished. This prevents the common failure mode where an agent hangs on a slow WebFetch and blocks the entire retrieval phase.

#### 3. Blocked Site Handling (403 Errors)

When a WebFetch returns a 403, paywall, or access-denied error:
1. **Write what you already have** to your output file immediately
2. If browser automation tools are available (e.g., `mcp__claude-in-chrome`), try the original URL via browser
3. Otherwise, try ONE alternative URL for the same information
4. **Write again** after the attempt
5. Move on — do NOT try multiple alternative URLs in a row without writing

This prevents the failure mode where an agent enters a retry loop on blocked sites, wasting context and time without producing output.

#### Phase 3 Completion Gate

**Do NOT proceed to Phase 4 until ALL sub-agents have completed or been recovered via the stuck-agent protocol.** The stuck-agent detection ensures no agent blocks indefinitely — use it. Triangulation requires ALL retrieved evidence, not just the first results that arrive.

The FFS (First Finish Search) pattern above applies only to the initial parallel search burst (Step 1). It does NOT grant permission to skip ahead while sub-agents (Step 2) are still running. Sub-agent results are deep-dive evidence that triangulation depends on for cross-referencing.

**Output:** Incrementally-persisted research files with source tracking, credibility scores, and coverage map. Save checkpoint.

---

## Phase 4: TRIANGULATE - Cross-Reference Verification

**Objective:** Validate information across multiple independent sources

**Progress:** `[Phase TRIANGULATE] Cross-referencing X sources, Y claims to verify...`

**Extended Thinking Task:** Before checking sources, think through which claims are most likely to have conflicting evidence. What are the controversial or rapidly-evolving aspects of this topic? Focus verification effort there.

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
3. **Check recency** — more recent data may supersede older claims (especially for technology, pricing, regulatory topics)
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

**Quality Standards:**
- Core claims must have 3+ independent sources
- Flag any single-source information
- Note recency of information
- Identify potential biases
- Every contradiction must be resolved or labeled "contested" — no silent disagreements
- Devil's advocate searches must be performed — no exceptions

**Output:** Verified fact base with confidence levels, resolved contradictions, and devil's advocate search results. Save checkpoint.

---

## Phase 4.5: OUTLINE REFINEMENT - Dynamic Evolution (WebWeaver 2025)

**Objective:** Adapt research direction based on evidence discovered

**Progress:** `[Phase OUTLINE REFINEMENT] Comparing initial scope against discovered evidence...`

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

4. **Targeted Gap Filling (if major gaps found)**

   If outline refinement reveals critical knowledge gaps:
   - Launch 2-3 targeted searches for newly identified angles
   - Apply Source Preference Heuristics from Phase 3
   - Quick retrieval only (don't restart full Phase 3)
   - Time-box to 2-5 minutes
   - Update triangulation for new evidence only

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
1. Does this claim have support from 2+ INDEPENDENT sources (not sources citing each other)?
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

**Extended Thinking Task:** Think through non-obvious connections and second-order implications. What patterns emerge when you look at the evidence as a whole that aren't visible in any single source? What would a domain expert notice that a generalist might miss? Are any of your emerging conclusions dependent on a single source — if so, how confident should you be?

**Output:** Synthesized understanding with insight generation, with claim acceptance/rejection log. Save checkpoint.

---

## Phase 6: CRITIQUE - Quality Assurance

**Objective:** Rigorously evaluate research quality

**Progress:** `[Phase CRITIQUE] Running red-team analysis and identifying gaps...`

**Extended Thinking Task:** Think through what a skeptical domain expert would challenge about these findings. What claims feel weakest? Where is the evidence thinnest? What alternative explanations haven't been considered?

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

**Output:** Critique report with improvement recommendations. Save checkpoint.

---

## Phase 7: REFINE - Iterative Improvement

**Objective:** Address gaps and strengthen weak areas

**Progress:** `[Phase REFINE] Addressing critique findings and strengthening weak areas...`

**Extended Thinking Task:** Review the critique report. Which issues are most damaging to the research's credibility? Prioritize those fixes. Think through whether the proposed fixes might introduce new inconsistencies.

**Activities:**
1. Conduct additional research for gaps
2. Strengthen weak arguments
3. Add missing perspectives
4. Resolve contradictions
5. Enhance clarity
6. Verify revised content

**Output:** Strengthened research with addressed deficiencies. Save checkpoint.

---

## Phase 7.5: VERIFY - Tool-Grounded Claim Verification (Deep/UltraDeep only)

**Objective:** Verify the research output using external tool checks, not internal self-reflection. Academic research (Huang et al., CRITIC framework) shows pure self-reflection can DECREASE accuracy — models change correct answers to wrong ones more often than they fix errors. Tool-grounded verification is the only reliable approach.

**Progress:** `[Phase VERIFY] Decomposing report into claims and verifying against sources...`

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

**Prompt for each verification sub-agent:**
> "You are a claim verification agent. For each claim below, use WebFetch to retrieve the cited source URL and verify whether the source actually supports the claim. Do NOT rely on your training data — you MUST fetch and read the source.
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
> Evidence: [quote or summary from the actual source content]
> ---"

Sub-agents follow the same reliability protocols: write-after-search, designated output file paths.

### Step 3: Process Verification Results

Wait for all verification sub-agents to complete (same stuck-agent monitoring applies).

Read all verification results. Categorize:
- **All VERIFIED:** Proceed to Phase 8 (PACKAGE)
- **Any CONTRADICTED:** This is critical — the report contains a claim that is actively wrong. Return to Phase 7 (REFINE) to fix the specific claim. Remove or correct it with the contradicting evidence.
- **3+ QUESTIONABLE:** The report may be overstating its evidence base. Return to Phase 7 (REFINE) to soften overstated claims or find stronger supporting sources.
- **3+ UNVERIFIABLE:** Too many dead/blocked sources. Return to Phase 3 (RETRIEVE) to find replacement sources for unverifiable citations.

### Step 4: Completeness and Source Quality Check

After claim verification, do two quick tool-grounded checks:

**Completeness check:** Re-read the original research question from Phase 1 SCOPE. List each component of the question. For each component, verify that the report addresses it with at least one finding. If a component is unaddressed, note it as a gap.

**Source quality check:** Count sources by type (academic, industry, journalism, blog, SEO). If >30% of sources are blogs/SEO content, note this as a limitation. If <3 source types are represented, note as limitation.

These are structural checks (counting, matching) not subjective quality scoring.

**Maximum 2 loop-back cycles** to prevent infinite loops. If issues persist after 2 cycles, proceed to PACKAGE and document all QUESTIONABLE/UNVERIFIABLE/CONTRADICTED claims in the Limitations section.

**Output:** Verification results file with per-claim status and evidence. Save checkpoint.

---

## Phase 8: PACKAGE - Report Generation

**Objective:** Deliver professional, actionable research

**Progress:** `[Phase PACKAGE] Generating final report with bibliography...`

**Activities:**
1. Structure report with clear hierarchy
2. Write executive summary
3. Develop detailed sections
4. Create visualizations (tables, diagrams)
5. Compile full bibliography
6. Add methodology appendix
7. Include self-evaluation scorecard (if Phase 7.5 was executed) in the methodology appendix

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
