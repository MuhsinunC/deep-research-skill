# Third-Party AI Research Tools & MCP Servers for Claude Code

**Date:** 2026-03-21
**Status:** Complete

---

## Table of Contents

1. [Search API MCP Servers](#1-search-api-mcp-servers)
2. [Deep Research MCP Servers](#2-deep-research-mcp-servers)
3. [Web Scraping / Content Extraction MCP Servers](#3-web-scraping--content-extraction-mcp-servers)
4. [Deep Research as a Service APIs](#4-deep-research-as-a-service-apis)
5. [Open-Source Deep Research Agents](#5-open-source-deep-research-agents)
6. [Documentation / Knowledge MCP Servers](#6-documentation--knowledge-mcp-servers)
7. [Comparison Matrix](#7-comparison-matrix)
8. [Recommended Stack](#8-recommended-stack)

---

## 1. Search API MCP Servers

These provide web search capabilities to Claude Code via MCP, acting as building blocks for research workflows.

### Tavily MCP Server

- **What it is:** AI-optimized search API with MCP server, designed specifically for LLM agents. Returns pre-processed, structured results optimized for context windows.
- **GitHub:** https://github.com/tavily-ai/tavily-mcp
- **npm:** `tavily-mcp@latest`
- **Docs:** https://docs.tavily.com/documentation/mcp
- **Key tools:** `tavily-search`, `tavily-extract`, `tavily-map`, `tavily-crawl`
- **Pricing:** Free tier available. ~$800 per 100K pages at scale. Acquired by Nebius in Feb 2026.
- **Best for:** Citation-ready search results with source-first discovery; quick breadth across many sources.

**Claude Code setup (Method 1 - Hosted HTTP):**
```bash
claude mcp add --transport http tavily https://mcp.tavily.com/mcp/?tavilyApiKey=<YOUR_API_KEY>
```

**Claude Code setup (Method 2 - Local npx):**
```json
{
  "mcpServers": {
    "tavily-mcp": {
      "command": "npx",
      "args": ["-y", "tavily-mcp@latest"],
      "env": {
        "TAVILY_API_KEY": "your-api-key-here",
        "DEFAULT_PARAMETERS": "{\"include_images\": true, \"max_results\": 15, \"search_depth\": \"advanced\"}"
      }
    }
  }
}
```

Add `--scope user` for global availability across all projects.

---

### Exa MCP Server

- **What it is:** Neural/semantic search engine built for LLMs. Uses embeddings to match query intent, not just keywords. Includes deep research agent capability.
- **GitHub:** https://github.com/exa-labs/exa-mcp-server
- **npm:** `exa-mcp-server`
- **Docs:** https://exa.ai/docs/reference/exa-mcp
- **Key tools:** Web search, code context search, people/company research (LinkedIn), deep research agent
- **Pricing:** Free tier available. Higher tiers for production use.
- **Best for:** Semantic/research search; complex retrieval tasks where keyword search fails; company/people research.
- **Benchmarks:** Scores 81% vs Tavily's 71% on complex retrieval tasks. 2-3x faster than Tavily on average.

**Claude Code setup:**
```json
{
  "mcpServers": {
    "exa": {
      "command": "npx",
      "args": ["-y", "exa-mcp-server"],
      "env": {
        "EXA_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**Standout feature:** Built-in deep research tool that autonomously searches, crawls, analyzes, and synthesizes findings into reports with citations. This is not just search -- it is an agentic research pipeline inside the MCP server.

---

### Brave Search MCP Server

- **What it is:** Privacy-first search engine with its own independent index of 30B+ pages (not a Google/Bing wrapper).
- **GitHub:** https://github.com/brave/brave-search-mcp-server
- **npm:** `@modelcontextprotocol/server-brave-search`
- **Docs:** https://brave.com/search/api/
- **Key tools:** `brave_web_search`, `brave_local_search`
- **Pricing:** Free tier: 2,000 queries/month (1 query/sec). Paid: $3-5 per 1,000 requests. Very cost-effective for high volume.
- **Best for:** Budget-friendly high-volume search; privacy-conscious deployments; local business search.
- **Benchmarks:** Leads benchmark scores (14.89) among search APIs. Lowest latency at ~669ms average.

**Claude Code setup:**
```bash
claude mcp add brave-search -e BRAVE_API_KEY=your-key -- npx -y @modelcontextprotocol/server-brave-search
```

---

### SerpAPI MCP Server

- **What it is:** Multi-engine search API (Google, Bing, Yahoo, YouTube, etc.) with structured result parsing.
- **GitHub:** https://github.com/serpapi/serpapi-mcp
- **Docs:** https://serpapi.com/mcp
- **Key tools:** `search` (unified tool across multiple engines)
- **Pricing:** Free tier: 100 searches/month. Paid plans start at $75/month for 5,000 searches.
- **Best for:** Google-specific search features (Shopping, Maps, Scholar, Patents); multi-engine coverage.

**Claude Code setup (Hosted):**
```bash
claude mcp add --transport http serpapi https://mcp.serpapi.com/YOUR_SERPAPI_API_KEY/mcp
```

---

### Linkup Search MCP Server

- **What it is:** AI search tool focused on factual accuracy from trusted sources. Scored highest on OpenAI's SimpleQA factuality benchmark.
- **Website:** https://www.linkup.so/
- **Key tools:** `search` with `depth` parameter (Standard for quick facts, Deep for comprehensive research)
- **Output types:** `sourcedanswer`, `searchresults`, `structured`
- **Best for:** Factual accuracy; sourced answers with citations.

---

## 2. Deep Research MCP Servers

These go beyond simple search -- they run multi-step research workflows autonomously.

### GPT Researcher MCP (gptr-mcp)

- **What it is:** Autonomous deep research agent exposed as an MCP server. Plans, executes multi-step research, writes citation-backed reports.
- **GitHub:** https://github.com/assafelovic/gptr-mcp
- **Language:** Python
- **Key tools:** `quick_search`, `write_report`, `get_research_sources`, `get_research_context`
- **Requirements:** Python 3.11+, OpenAI API key, Tavily API key
- **Best for:** Full autonomous research reports; complex multi-step investigations.

**Claude Desktop / Code setup:**
```json
{
  "mcpServers": {
    "gpt-researcher": {
      "command": "python",
      "args": ["/absolute/path/to/gptr-mcp/server.py"],
      "env": {
        "OPENAI_API_KEY": "your-key",
        "TAVILY_API_KEY": "your-key"
      }
    }
  }
}
```

Can also be run via Docker: `docker-compose up` from the gptr-mcp repo.

**Key difference from plain search:** Standard search tools return raw results requiring manual filtering. GPT Researcher autonomously explores and validates numerous sources, focusing only on relevant, trusted, and up-to-date information.

---

### Jina AI MCP Server (with DeepSearch)

- **What it is:** Remote MCP server with web content retrieval, search, academic research (arXiv/SSRN), and DeepSearch (iterative search-read-reason loop).
- **GitHub:** https://github.com/jina-ai/MCP
- **Language:** TypeScript (Apache-2.0)
- **Transport:** Streamable HTTP (MCP spec 2025-03-26)
- **Key tools:** Web content to markdown, web search, parallel web search, page analysis, image search, arXiv/SSRN academic search, DeepSearch
- **Note:** Jina AI was acquired by Elastic in Oct 2025; models remain open on HuggingFace.
- **Best for:** Academic research; iterative deep search that reasons until it finds an answer or exhausts token budget.

---

### Gemini Deep Research MCP Server

- **What it is:** MCP server wrapping Google's Gemini API for deep research.
- **GitHub:** https://github.com/ssdeanx/deep-research-mcp-server
- **Key feature:** Uses Gemini as the research AI agent backbone.
- **Best for:** Teams already invested in Google's AI ecosystem.

---

### MCP-DEEPwebresearch

- **What it is:** Enhanced MCP server for deep web research with multi-step workflows.
- **GitHub:** https://github.com/qpd-v/mcp-DEEPwebresearch
- **Workflow:** Question elaboration -> sub-question generation -> web search -> content analysis -> report generation
- **Best for:** Python-based research pipelines.

---

### MCP Deep Research (baranwang)

- **What it is:** MCP server for deep research with detailed progress reporting.
- **Listed at:** https://mcpservers.org/en/servers/baranwang/mcp-deep-research
- **Best for:** Progress-tracked research tasks.

---

### Perplexity Deep Research MCP

- **What it is:** MCP server wrapping Perplexity's sonar-deep-research model.
- **GitHub (official):** https://github.com/perplexityai/modelcontextprotocol
- **GitHub (community):** https://github.com/arjunkmrm/perplexity-deep-research, https://github.com/cyanheads/perplexity-mcp-server
- **Models available:** sonar (quick), sonar-pro (detailed), sonar-reasoning-pro (complex analysis), sonar-deep-research (thorough investigation)
- **Note:** As of March 2026, Perplexity's CTO announced they are moving away from MCP toward traditional APIs/CLIs, citing context window consumption issues. The MCP server still works but is no longer their flagship integration.
- **Best for:** Quick sonar-powered research with citations; though the strategic direction is uncertain.

---

## 3. Web Scraping / Content Extraction MCP Servers

Essential for research that requires reading full page content, not just search snippets.

### Firecrawl MCP Server

- **What it is:** Web scraping and content extraction as MCP tools. Converts URLs to clean markdown/HTML/JSON.
- **GitHub:** https://github.com/firecrawl/firecrawl-mcp-server
- **npm:** `firecrawl-mcp`
- **Docs:** https://docs.firecrawl.dev/mcp-server
- **Key tools:** `scrape`, `crawl`, `map`, `search`, `extract` (structured with JSON schema), `batch_scrape`
- **Pricing:** Free tier available. Flat-rate pricing for high volume.
- **Benchmarks:** 83% accuracy, fastest MCP (avg 7s). 77.2% URL coverage vs Tavily's 67.8%. Reported 50x faster than Apify for scraping.
- **Best for:** Building knowledge bases from specific sites; RAG pipelines; reading full documentation; competitive research.

**Claude Code setup:**
```bash
npx -y firecrawl-mcp
```

Then configure with your `FIRECRAWL_API_KEY`.

---

### Bright Data Web MCP

- **What it is:** Browser-level web scraping with anti-bot bypass (Cloudflare, CAPTCHA, etc.).
- **GitHub:** 1.9k+ stars
- **Key tools:** `scrape_as_markdown`, `scrape_as_html`, web search, 60+ tools total
- **Pricing:** Free MCP tier (no credit card). Paid for production.
- **Benchmarks:** 100% success rate on web search & extraction tasks. 90% success on browser automation tasks.
- **Best for:** Sites that block normal scraping; anti-bot-protected pages; large-scale extraction.

---

### Apify MCP Server

- **What it is:** Access to 3,000+ web scraping "Actors" for specific sites (Google Maps, LinkedIn, Amazon, Instagram, YouTube, etc.).
- **GitHub:** 700+ stars
- **Best for:** Site-specific scrapers; structured data from known platforms.

---

## 4. Deep Research as a Service APIs

These are commercial APIs that can be wrapped as Claude Code tools or MCP servers.

### OpenAI Deep Research API

- **Models:** `o3-deep-research`, `o4-mini-deep-research`
- **Docs:** https://developers.openai.com/api/docs/guides/deep-research
- **Cookbook:** https://cookbook.openai.com/examples/deep_research_api/introduction_to_deep_research_api
- **Sample MCP Server:** https://github.com/openai/sample-deep-research-mcp
- **Capabilities:** Finds, analyzes, and synthesizes hundreds of sources. Supports web search, remote MCP servers, and file search over internal vector stores.
- **MCP Integration:** OpenAI provides an official sample MCP server that wraps Deep Research for use with other MCP clients. The server implements `search` and `fetch` tools.
- **Best for:** Highest-quality autonomous research reports; enterprise use cases.

### Google Gemini Deep Research (Interactions API)

- **Docs:** https://ai.google.dev/gemini-api/docs/deep-research
- **API:** Interactions API (currently in beta)
- **Capabilities:** Iterative deep research agent accessible via API. Supports function calling, built-in tools, structured outputs, and MCP.
- **MCP Support:** Remote MCP integration available (experimental) in Python and JavaScript SDKs.
- **Best for:** Teams on Google Cloud / Vertex AI; leveraging Gemini's large context windows.

### Azure AI Foundry Deep Research

- **Docs:** https://learn.microsoft.com/en-us/azure/ai-foundry/agents/how-to/tools/deep-research
- **What it is:** Microsoft's API/SDK offering of OpenAI's Deep Research in Azure. Public preview as of Jan 2026.
- **Best for:** Enterprise Azure shops wanting managed deep research.

---

## 5. Open-Source Deep Research Agents

Standalone agents that can be integrated with Claude Code workflows or wrapped as MCP servers.

### LangChain Open Deep Research

- **GitHub:** https://github.com/langchain-ai/open_deep_research
- **What it is:** Fully open-source deep research agent built on LangGraph. Configurable with any model provider (OpenAI, Anthropic, Google), any search tool, and any MCP server via `langchain-mcp-adapters`.
- **Architecture:** Supervisor agent generates sub-topics -> sub-agents each conduct research via tool-calling loops -> sub-agents write cited answers -> supervisor synthesizes final report.
- **Benchmark:** #6 on Deep Research Bench Leaderboard (score 0.4344).
- **Best for:** Custom research pipelines; teams wanting full control over the research agent.

**Setup:**
```bash
git clone https://github.com/langchain-ai/open_deep_research.git
cd open_deep_research
uv venv
# configure API keys
# launch via LangGraph Studio or CLI
```

---

### LangChain Deep Agents

- **GitHub:** https://github.com/langchain-ai/deepagents
- **Docs:** https://docs.langchain.com/oss/python/deepagents/overview
- **What it is:** Agent harness with planning tool, filesystem backend, and sub-agent spawning. More general than Open Deep Research but can be configured for research tasks.
- **Released:** March 2026
- **Best for:** Multi-step agent orchestration beyond just research.

---

### Tongyi DeepResearch

- **Website:** https://tongyi-agent.github.io/blog/introducing-tongyi-deep-research/
- **What it is:** First fully open-source web agent matching OpenAI DeepResearch performance across benchmarks.
- **Benchmarks:** 32.9 on Humanity's Last Exam, 43.4 on BrowseComp, 46.7 on BrowseComp-ZH.
- **Best for:** State-of-the-art open-source deep research.

---

### MiroThinker

- **GitHub:** https://github.com/MiroMindAI/MiroThinker
- **What it is:** Deep research agent optimized for complex research and prediction tasks.
- **Benchmarks:** MiroThinker-H1 achieves 88.2 on BrowseComp (highest among open-source).
- **Best for:** Research tasks requiring prediction and complex reasoning.

---

### Jina AI DeepSearch (node-DeepResearch)

- **What it is:** Agentic search that replicates OpenAI's multi-step research workflow (search, read, reason). Iterates until it finds an answer or exhausts token budget.
- **Website:** https://jina.ai/deepsearch/
- **Best for:** Iterative, budget-aware research.

---

### Firecrawl Open Deep Research

- **GitHub:** https://github.com/nickscamara/open-deep-research
- **What it is:** Deep research clone using Firecrawl for web data extraction. Reasons over large amounts of extracted web data.
- **Best for:** Research pipelines already using Firecrawl.

---

## 6. Documentation / Knowledge MCP Servers

Useful for technical research that needs current library/framework docs.

### Context7 MCP

- **GitHub:** https://github.com/upstash/context7
- **npm:** `@upstash/context7-mcp@latest`
- **What it is:** Fetches current, version-specific documentation for any library. Solves the hallucinated-API problem.
- **Usage:** Add "use context7" to any prompt.
- **Best for:** Technical research on libraries/frameworks; avoiding outdated training data.

**Claude Code setup:**
```bash
claude mcp add context7 -- npx -y @upstash/context7-mcp@latest
```

---

### Google Researcher MCP

- **GitHub:** https://github.com/zoharbabin/google-researcher-mcp
- **What it is:** MCP server for Google search (general, images, news), full webpage reading (including JS-rendered), YouTube transcript extraction, and document parsing (PDF, DOCX, PPTX).
- **Best for:** Google-powered research with document parsing capabilities.

---

## 7. Comparison Matrix

### Search API Comparison

| Feature | Tavily | Exa | Brave Search | SerpAPI | Linkup |
|---|---|---|---|---|---|
| **Type** | AI-optimized search | Neural/semantic search | Independent index | Multi-engine wrapper | Factual AI search |
| **Latency** | ~2-3s | ~1-2s | ~669ms (fastest) | ~1-2s | ~1-3s |
| **Complex retrieval** | 71% | 81% (best) | High (14.89 benchmark) | Varies by engine | Highest on SimpleQA |
| **Free tier** | Yes | Yes | 2,000/month | 100/month | Yes |
| **Paid pricing** | ~$800/100K | $15-22/1K | $3-5/1K (cheapest) | $75/mo for 5K | Varies |
| **MCP server** | Official | Official | Official | Official | Official |
| **Unique strength** | Citation-ready results | Semantic intent matching | Independent index, privacy | Google Scholar/Patents | Factual accuracy |
| **npm package** | `tavily-mcp` | `exa-mcp-server` | `@modelcontextprotocol/server-brave-search` | N/A (hosted) | N/A |

### Deep Research Agent Comparison

| Feature | GPT Researcher MCP | LangChain Open Deep Research | OpenAI Deep Research API | Gemini Deep Research API | Tongyi DeepResearch |
|---|---|---|---|---|---|
| **Open source** | Yes | Yes | No (API only) | No (API only) | Yes |
| **MCP server** | Yes (Python) | Via langchain-mcp-adapters | Sample server available | Experimental | No native MCP |
| **Autonomous** | Full | Full | Full | Full | Full |
| **Model flexibility** | OpenAI required | Any provider | OpenAI only | Gemini only | Qwen-based |
| **BrowseComp score** | N/A | N/A | N/A | N/A | 43.4 |
| **Setup complexity** | Medium (Python + Docker) | Medium (LangGraph) | Low (API call) | Low (API call) | High |
| **Cost** | Your LLM costs + Tavily | Your LLM costs | Per-API-call | Per-API-call | Self-hosted |

### Web Scraping MCP Comparison

| Feature | Firecrawl | Bright Data | Apify |
|---|---|---|---|
| **Success rate** | 83% | 100% | Good |
| **Anti-bot bypass** | Basic | Best (Cloudflare, CAPTCHA) | Good |
| **Speed** | Fastest (avg 7s) | Good | Slower |
| **URL coverage** | 77.2% | Highest | Good |
| **GitHub stars** | High | 1.9k+ | 700+ |
| **Free tier** | Yes | Yes (no CC) | Yes |
| **Best for** | Speed + RAG pipelines | Anti-bot sites | Site-specific scrapers |

---

## 8. Recommended Stack

Based on this research, here is a practical stack for deep research with Claude Code:

### Minimum Viable Research Stack

1. **Tavily MCP** -- primary search (fast, citation-ready, AI-optimized)
2. **Firecrawl MCP** -- page content extraction when search snippets aren't enough

### Enhanced Research Stack

1. **Exa MCP** -- semantic search + built-in deep research agent
2. **Brave Search MCP** -- high-volume supplementary search (cheapest)
3. **Firecrawl MCP** -- content extraction and crawling
4. **Context7 MCP** -- technical documentation lookup

### Full Deep Research Stack

1. **GPT Researcher MCP** -- autonomous multi-step research reports
2. **Exa MCP** -- semantic search with deep research capability
3. **Brave Search MCP** -- budget search for breadth
4. **Firecrawl MCP** -- deep content extraction
5. **Bright Data MCP** -- fallback for anti-bot-protected sites
6. **Context7 MCP** -- documentation research

### Quick Setup Commands (for Claude Code)

```bash
# Tavily (AI-optimized search)
claude mcp add --transport http tavily https://mcp.tavily.com/mcp/?tavilyApiKey=YOUR_KEY

# Exa (semantic search + deep research)
claude mcp add exa -e EXA_API_KEY=YOUR_KEY -- npx -y exa-mcp-server

# Brave Search (budget-friendly, fast)
claude mcp add brave-search -e BRAVE_API_KEY=YOUR_KEY -- npx -y @modelcontextprotocol/server-brave-search

# Firecrawl (web scraping)
claude mcp add firecrawl -e FIRECRAWL_API_KEY=YOUR_KEY -- npx -y firecrawl-mcp

# Context7 (documentation)
claude mcp add context7 -- npx -y @upstash/context7-mcp@latest

# SerpAPI (Google-specific search features)
claude mcp add --transport http serpapi https://mcp.serpapi.com/YOUR_KEY/mcp
```

### Key Considerations

- **Context window consumption:** MCP tools consume context. Claude Code's Tool Search (Jan 2026) reduces this by up to 85% by loading tools on-demand. Still, keep MCP server count reasonable.
- **Perplexity is deprioritized:** Their CTO announced a shift away from MCP in March 2026. The MCP server works but is no longer their strategic focus.
- **Brave Search for volume:** At $3-5 per 1,000 requests with the lowest latency, Brave is the best value for high-volume search.
- **Exa for quality:** 81% complex retrieval accuracy and built-in deep research make it the best single tool for research quality.
- **GPT Researcher for autonomy:** If you want a "fire and forget" research agent that writes full reports, GPT Researcher MCP is the most mature option.

---

## Sources

- [Tavily MCP GitHub](https://github.com/tavily-ai/tavily-mcp)
- [Tavily MCP Docs](https://docs.tavily.com/documentation/mcp)
- [Exa MCP GitHub](https://github.com/exa-labs/exa-mcp-server)
- [Exa MCP Docs](https://exa.ai/docs/reference/exa-mcp)
- [Exa vs Tavily Comparison](https://exa.ai/versus/tavily)
- [Brave Search MCP GitHub](https://github.com/brave/brave-search-mcp-server)
- [Brave Search npm](https://www.npmjs.com/package/@modelcontextprotocol/server-brave-search)
- [SerpAPI MCP](https://serpapi.com/mcp)
- [SerpAPI MCP GitHub](https://github.com/serpapi/serpapi-mcp)
- [GPT Researcher MCP GitHub](https://github.com/assafelovic/gptr-mcp)
- [Jina AI MCP GitHub](https://github.com/jina-ai/MCP)
- [Jina DeepSearch](https://jina.ai/deepsearch/)
- [Gemini Deep Research MCP GitHub](https://github.com/ssdeanx/deep-research-mcp-server)
- [MCP-DEEPwebresearch GitHub](https://github.com/qpd-v/mcp-DEEPwebresearch)
- [Perplexity MCP GitHub](https://github.com/perplexityai/modelcontextprotocol)
- [Perplexity Deep Research MCP](https://www.pulsemcp.com/servers/arjunkmrm-perplexity-deep-research)
- [Firecrawl MCP GitHub](https://github.com/firecrawl/firecrawl-mcp-server)
- [Firecrawl MCP Docs](https://docs.firecrawl.dev/mcp-server)
- [Linkup Search](https://www.linkup.so/)
- [Context7 MCP GitHub](https://github.com/upstash/context7)
- [LangChain Open Deep Research GitHub](https://github.com/langchain-ai/open_deep_research)
- [LangChain Deep Agents GitHub](https://github.com/langchain-ai/deepagents)
- [Tongyi DeepResearch](https://tongyi-agent.github.io/blog/introducing-tongyi-deep-research/)
- [MiroThinker GitHub](https://github.com/MiroMindAI/MiroThinker)
- [OpenAI Deep Research API Docs](https://developers.openai.com/api/docs/guides/deep-research)
- [OpenAI Sample Deep Research MCP](https://github.com/openai/sample-deep-research-mcp)
- [OpenAI Deep Research MCP Cookbook](https://cookbook.openai.com/examples/deep_research_api/how_to_build_a_deep_research_mcp_server/readme)
- [Gemini Deep Research API](https://ai.google.dev/gemini-api/docs/deep-research)
- [Gemini Interactions API](https://ai.google.dev/gemini-api/docs/interactions)
- [Azure AI Foundry Deep Research](https://learn.microsoft.com/en-us/azure/ai-foundry/agents/how-to/tools/deep-research)
- [Google Researcher MCP GitHub](https://github.com/zoharbabin/google-researcher-mcp)
- [Firecrawl Open Deep Research GitHub](https://github.com/nickscamara/open-deep-research)
- [Best Deep Research APIs 2026 (Firecrawl blog)](https://www.firecrawl.dev/blog/best-deep-research-apis)
- [Agentic Search Benchmark 2026](https://aimultiple.com/agentic-search)
- [Best MCP Servers 2026 (Builder.io)](https://www.builder.io/blog/best-mcp-servers-2026)
- [Best MCP Servers (Desktop Commander)](https://desktopcommander.app/blog/2025/11/25/best-mcp-servers/)
- [Awesome MCP Servers GitHub](https://github.com/punkpeye/awesome-mcp-servers)
- [Perplexity CTO MCP shift](https://awesomeagents.ai/news/perplexity-agent-api-mcp-shift/)
- [Bright Data MCP](https://use-apify.com/blog/bright-data-mcp-server-ai-agents)
- [MCP Benchmark 2026](https://aimultiple.com/browser-mcp)
