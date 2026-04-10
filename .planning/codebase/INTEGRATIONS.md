# External Integrations

**Analysis Date:** 2026-04-10

## APIs & External Services

**Anthropic / Claude Code (primary runtime):**
- Service: Anthropic Claude API (accessed via `claude -p` CLI, not direct HTTP)
- What it does: Hosts the entire research pipeline; the skill IS Claude Code running headless
- Model tier: Opus 4.6 (lead agent, all phases) + Sonnet 4.6 (Task tool sub-agents)
- Auth: Managed by Claude Code CLI — no API key in skill files
- Config: `--model opus --effort max` on spawn command in `skill/SKILL.md`

**DOI Resolution Service (doi.org):**
- Service: `https://doi.org/` — free content negotiation API
- What it does: Resolves DOIs to citation metadata (title, year, authors, venue) for citation verification
- Used by: `skill/scripts/verify_citations.py` (`CitationVerifier.verify_doi()`)
- Auth: None required — public free API
- Request format: `Accept: application/vnd.citationstyles.csl+json` header
- No API key needed; respects HTTP 404 for non-existent DOIs

**URL Accessibility Check (arbitrary web URLs):**
- Service: Any URL from research bibliography
- What it does: HTTP HEAD requests to verify cited URLs are reachable
- Used by: `skill/scripts/verify_citations.py` (`CitationVerifier.verify_url()`)
- Auth: None; sends `User-Agent: Mozilla/5.0 (Research Citation Verifier)`
- Timeout: 10 seconds per request

## Search Providers (Optional / User-Configured)

**Claude Code built-in WebSearch:**
- Service: Claude Code's native `WebSearch` tool
- What it does: Primary search tool for Phase 3 RETRIEVE across all research modes
- Auth: Managed by Claude Code — no configuration needed in skill
- Usage: `WebSearch(query="...")` called inline during research phases
- Spec: `skill/reference/methodology.md` Phase 3

**Exa MCP (Optional):**
- Service: Exa semantic search API via MCP integration
- What it does: Neural and keyword search, more powerful than WebSearch for academic queries
- Tool name: `mcp__Exa__exa_search`
- Auth: MCP plugin configuration (user must have Exa MCP installed)
- Used when: Exa MCP is available in the session; falls back to WebSearch otherwise
- Spec: `skill/reference/methodology.md` Phase 3 "Option B"

**search-cli (Optional, not currently installed):**
- Service: Multi-provider CLI aggregating Brave Search, Serper, Exa, Jina, Firecrawl
- What it does: Unified search across 5 providers simultaneously for broader coverage
- Install: `brew tap 199-biotechnologies/tap && brew install search-cli`
- Config: `search config set keys.[provider] YOUR_KEY` for each provider
- Auth: Per-provider API keys (Brave, Serper, Exa, Jina, Firecrawl)
- Used when: Installed and configured; third fallback after WebSearch and Exa MCP
- Spec: `skill/requirements.txt`, `skill/reference/methodology.md` Phase 3 "Option C"

**WebFetch (built-in):**
- Service: Claude Code's native `WebFetch` tool
- What it does: Deep-read specific URLs discovered during search (Phase 3 source retrieval)
- Auth: None; inherits whatever session cookies Claude Code uses
- Fallback chain: WebFetch → Chrome MCP → Playwright MCP (per `skill/reference/methodology.md`)

## Browser Automation

**Chrome MCP Extension (`mcp__claude-in-chrome__*`):**
- Service: Browser MCP extension for Claude Code
- What it does: Tier 2 fallback when WebFetch returns 403/Cloudflare/login wall; reuses user's Chrome session and cookies
- Auth: Reuses active Chrome browser session — no separate credentials
- Used when: WebFetch returns bot-detection or requires JavaScript rendering

**Playwright MCP (`mcp__plugin_playwright_playwright__*`):**
- Service: Headless browser automation
- What it does: Tier 3 fallback for sites that block Chrome MCP (anti-bot bypass)
- Auth: Clean headless profile — no user credentials
- Used when: Chrome MCP also gets blocked
- Spec: `skill/reference/methodology.md` "Blocked Site Handling"

## Data Storage

**Databases:**
- None — no database used anywhere in the stack

**File Storage:**
- Research output directory: `~/Documents/Research/[TopicName]_[YYYYMMDD]_[UUID8]/`
  - Contains: `research_report_*.md`, `research_report_*.html`, `research_report_*.pdf`, `_checkpoint.json`, `plan.md`, `sources.json`, per-phase sub-agent output files
- Internal tracking copy: `~/.claude/research_output/` (duplicate of final report)
- Task registry: `~/.claude/research-tasks.json` — flat JSON file tracking all research sessions
- Research state snapshots: `_checkpoint.json` written after each phase (in output directory)

**Caching:**
- No explicit cache layer
- `sources.json` in the output directory serves as durable provenance state that survives context compaction and enables session resume

## Authentication & Identity

**Auth Provider:**
- None — no user authentication in the skill
- All external calls are either unauthenticated (doi.org, URL checks) or rely on Claude Code's own session management
- search-cli API keys are stored via `search config set keys.*` (CLI config, not in this repo)

## Monitoring & Observability

**Error Tracking:**
- None — no error tracking service
- Errors are written to stderr of the spawned `claude -p` process: `/tmp/research-${UUID8}.err`
- Process stdout is logged to `/tmp/research-${UUID8}.log` via `tee`

**Logs:**
- `/tmp/research-${UUID8}.log` — captured stdout of the spawned research subprocess
- `/tmp/research-${UUID8}.err` — stderr from the subprocess
- `_checkpoint.json` per-phase — structured JSON checkpoints in the output directory
- `notes/test-run-log.md` — manually maintained log of development test runs

## CI/CD & Deployment

**Hosting:**
- Local machine only — no cloud hosting, no server
- Live skill directory: `~/.claude/skills/deep-research/`

**Deployment:**
- Script: `tools/deploy-to-live.sh`
- Mechanism: `rsync -av --delete` from `skill/` to `~/.claude/skills/deep-research/`
- Dry-run: `tools/deploy-to-live.sh --dry-run`
- No automated CI pipeline; manual deploy-and-restart workflow

**CI Pipeline:**
- None — no GitHub Actions, no CI service

## Environment Configuration

**Required:**
- `CLAUDE_CODE_EFFORT_LEVEL=max` in `~/.zshrc` (for interactive parent sessions)
- Claude Code CLI installed at `/Users/user/.local/bin/claude`

**Optional (for enhanced features):**
- `weasyprint` installed (`/opt/homebrew/bin/weasyprint`) — for PDF output
- Exa MCP plugin configured — for semantic search fallback
- Playwright MCP plugin configured — for anti-bot browser fallback
- Chrome MCP extension installed — for Cloudflare/JS-required sites
- search-cli with API keys — for multi-provider search aggregation

**Secrets location:**
- API keys for search-cli providers stored in search-cli's own config (not in this repo)
- No secrets in any committed file
- `.gitignore` excludes `*.json` at root (with exception for `notes/**/*.json`)

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

---

*Integration audit: 2026-04-10*
