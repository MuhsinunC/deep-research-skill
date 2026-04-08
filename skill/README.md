# Deep Research Skill for Claude Code

Enterprise-grade research engine for Claude Code. Produces citation-backed reports with source credibility scoring, multi-provider search, rubric-guided verification, and automated validation.

## About this project

This project started as a fork of [199-biotechnologies/claude-deep-research-skill](https://github.com/199-biotechnologies/claude-deep-research-skill) and has been substantially extended. Full credit to the original author for the initial pipeline design and implementation. What began as a fork has grown into its own body of work: **47 commits, +30,699 / −630 lines** across 172 files, a different architectural philosophy, and a full repository restructure.

**Key differences from the upstream:**

- **Drop-in philosophy.** No required external API tools or paid services — works out of the box with any Claude Code install. (Upstream optionally integrates with `search-cli`; this project treats that as an enhancement, not a requirement.)
- **Hybrid model architecture.** Opus lead coordinator + Sonnet sub-agents, with explicit `EFFORT REINFORCEMENT` clauses on every spawn prompt and verified max-effort propagation across subprocess boundaries.
- **Rubric-guided verification.** DRA (Deep Research Assistant) failure taxonomy with 13 sub-categories for claim-level verification, an adversarial refutation agent (REFUTED / WEAKENED / WITHSTOOD verdicts), and pro/con query pairs during retrieval.
- **Blocked-site fallback tier.** `WebFetch` → Chrome MCP → Playwright MCP, with ordered escalation for anti-bot sites like Reddit, X, and LinkedIn.
- **Feynman-style query decomposition.** Recursive sub-query spawning for complex topics with layered knowledge aggregation.
- **Budget-aware synthesis.** Emergency synthesis safety net that triggers when the context budget is exceeded, ensuring the pipeline always produces a final report.
- **Source/deploy separation.** The repository distinguishes runtime skill files (`skill/`) from development artifacts (`notes/`, `tests/`, `tools/`, `CLAUDE.md`). Only `skill/` is deployed to your Claude Code install.

## Installation

This skill is distributed as a repository you clone for development, then deploy into your local Claude Code skills directory via a script.

```bash
# 1. Clone the repo
git clone https://github.com/MuhsinunC/deep-research-skill.git
cd deep-research-skill

# 2. Deploy the skill to your local Claude Code install
./tools/deploy-to-live.sh
```

The deploy script copies the `skill/` directory into `~/.claude/skills/deep-research/`. Restart Claude Code (or start a new session) to pick up the skill. Use `./tools/deploy-to-live.sh --dry-run` to preview changes without touching anything.

### Optional: search-cli (multi-provider search)

For aggregated search across Brave, Serper, Exa, Jina, and Firecrawl:

```bash
brew tap 199-biotechnologies/tap && brew install search-cli
search config set keys.brave YOUR_KEY  # configure at least one provider
```

The skill works fine **without** `search-cli` — it falls back to Claude Code's built-in `WebSearch` and `WebFetch` tools. `search-cli` is recommended for high-volume research where query diversity matters.

## Usage

```
deep research on the current state of quantum computing
```

```
deep research in ultradeep mode: compare PostgreSQL vs Supabase for our stack
```

## Research Modes

| Mode | Phases | Duration | Best For |
|------|--------|----------|----------|
| Quick | 3 | 2-5 min | Initial exploration |
| Standard | 7 | 5-10 min | Most research questions |
| Deep | 10 | 10-20 min | Complex topics, critical decisions |
| UltraDeep | 10 | 20-45 min | Comprehensive reports, maximum rigor |

## Pipeline

Scope → Plan → **Retrieve** (parallel search + heterogeneous-lens sub-agents + pro/con query pairs) → Triangulate → Outline Refinement → Synthesize → Critique (with loop-back) → Refine → **Verify** (DRA rubric + adversarial refutation) → Package

Key features:

- **Hybrid model orchestration**: Opus lead with Sonnet sub-agents, all carrying explicit `EFFORT REINFORCEMENT` clauses
- **Heterogeneous lens assignment**: Each retrieval sub-agent gets a distinct research lens (academic, practitioner, historical, critical)
- **Pro/con query pairs**: Major claims are searched from both directions
- **DRA verification rubric**: 13 sub-categories of failure modes (R1-R4, T1-T4, G1-G5) for structured claim verification
- **Adversarial refutation**: Dedicated agent that attempts to refute verified claims; returns REFUTED / WEAKENED / WITHSTOOD verdicts
- **Temporal-active verification**: Domain-specific half-lives for time-sensitive claims
- **Verifier-guided retry (Step 6)**: Spawns a fresh subprocess to re-verify critical claims
- **Blocked-site fallback**: `WebFetch` → Chrome MCP → Playwright MCP tier escalation
- **Budget-aware synthesis**: Emergency synthesis safety net at context limit
- **Disk-persisted citations**: `sources.json` survives context compaction and continuation agents

## Output

Reports are saved to `~/Documents/Research/[Topic]_[YYYYMMDD]_[UUID8]/`:

- Markdown (primary source of truth)
- HTML (McKinsey-style, auto-opened in browser)
- PDF (professional print via WeasyPrint)

Reports over 18K words auto-continue via recursive agent spawning with context preservation.

## Quality Standards

- 10+ sources, 3+ per major claim
- Executive summary 200-400 words
- Findings 600-2,000 words each, prose-first (≥80%)
- Full bibliography with URLs, no placeholders
- Automated validation: `validate_report.py` (9 checks) + `verify_citations.py` (DOI / URL / hallucination detection)
- Validation loop: validate → fix → retry (max 3 cycles)

## Search Tools

| Tool | When | Setup |
|------|------|-------|
| WebSearch | Default, always available | None |
| WebFetch | Default retrieval tier 1 | None |
| Chrome MCP | Blocked-site fallback tier 2 | MCP config |
| Playwright MCP | Blocked-site fallback tier 3 | MCP config |
| Exa MCP | Semantic / neural search | MCP config (optional) |
| search-cli | Multi-provider aggregation | `brew install search-cli` + API keys (optional) |

## Deployed skill layout

After running `./tools/deploy-to-live.sh`, the skill lives at:

```
~/.claude/skills/deep-research/
├── SKILL.md                          # Skill entry point
├── README.md                         # This file
├── requirements.txt                  # Python dependencies (WeasyPrint, etc.)
├── reference/
│   ├── methodology.md                # 10-phase pipeline details
│   ├── report-assembly.md            # Progressive generation strategy
│   ├── quality-gates.md              # Validation standards
│   ├── html-generation.md            # McKinsey HTML conversion
│   ├── continuation.md               # Auto-continuation protocol
│   └── weasyprint_guidelines.md      # PDF generation
├── templates/
│   ├── report_template.md            # Report structure template
│   └── mckinsey_report_template.html # HTML report template
└── scripts/
    ├── validate_report.py            # 9-check structure validator
    ├── verify_citations.py           # DOI / URL / hallucination checker
    ├── source_evaluator.py           # Source credibility scoring
    ├── citation_manager.py           # Citation tracking
    ├── md_to_html.py                 # Markdown → HTML converter
    ├── verify_html.py                # HTML verification
    └── research_engine.py            # Core orchestration engine
```

The source repository (what you clone for development) additionally contains `notes/` (research history, test run outputs, architecture decision records), `tools/` (deploy script), `tests/` (fixtures for manual validator iteration), and `CLAUDE.md` (workflow documentation). None of those are deployed to your runtime skill directory.

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.4 | 2026-04 | **Reliability & verification overhaul.** Hybrid Opus + Sonnet sub-agents with `EFFORT REINFORCEMENT` on every spawn. DRA rubric-guided verification (13-category failure taxonomy). Adversarial refutation agent. Pro/con query pairs in retrieval. Feynman-style query decomposition. Budget-aware synthesis with emergency safety net. Removed `--max-turns` flag (was cutting research short mid-pipeline). Playwright fallback tier for anti-bot sites (Reddit, X, LinkedIn). Repo restructure: `skill/` + `notes/` + `tools/` + `CLAUDE.md`. Deploy-script workflow replaces direct-clone-to-skills install. Single-source-of-truth architecture. |
| 2.3.1 | 2026-03-19 | Template / validator harmonization, structured evidence, critique loop-back, multi-persona red teaming |
| 2.3 | 2026-03-19 | Contract harmonization, search-cli integration, dynamic year detection, disk-persisted citations, validation loops |
| 2.2 | 2025-11-05 | Auto-continuation system for unlimited length |
| 2.1 | 2025-11-05 | Progressive file assembly |
| 1.0 | 2025-11-04 | Initial release |
