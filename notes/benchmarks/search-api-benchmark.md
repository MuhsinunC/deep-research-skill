# Search API Head-to-Head Benchmark

**Date:** 2026-03-25
**APIs Tested:** Claude Code WebSearch, Brave Search API, Tavily API, SerpAPI (Google)
**Methodology:** 5 identical queries across all 4 APIs, measuring wall-clock latency (ms), result count, and quality (1-5 scale)

## Test Queries
1. "What is the current population of Tokyo Japan 2026" (factual/current events)
2. "best practices for LLM evaluation and benchmarking" (technical/informational)
3. "rust programming language async runtime comparison tokio vs async-std" (niche technical)
4. "climate change impact on coral reefs latest research" (scientific/research)
5. "how does mRNA vaccine technology work mechanism of action" (scientific/educational)

---

## Summary Tables

### Latency (milliseconds, wall-clock)

| Query | WebSearch | Brave | Tavily | SerpAPI |
|-------|-----------|-------|--------|---------|
| Q1: Tokyo population | 11,495 | 498* | 1,083 | 1,072 |
| Q2: LLM evaluation | 19,126 | 748 | 1,456 | 8,502 |
| Q3: Rust async runtimes | 15,350 | 310 | 1,127 | 6,110 |
| Q4: Coral reef climate | 15,770 | 852 | 844 | 1,750 |
| Q5: mRNA vaccines | 15,152 | 1,267 | 828 | 2,053 |
| **Average** | **15,379** | **735** | **1,068** | **3,897** |

*Brave Q1 was re-run after fixing gzip encoding issue (original attempt returned binary garbage due to `Accept-Encoding: gzip` header).*

### Result Count

| Query | WebSearch | Brave | Tavily | SerpAPI |
|-------|-----------|-------|--------|---------|
| Q1: Tokyo population | 10 | 5 | 5 | 5 |
| Q2: LLM evaluation | 10 | 5 | 5 | 4 |
| Q3: Rust async runtimes | 10 | 5 | 5 | 4 |
| Q4: Coral reef climate | 10 | 5 | 5 | 5 |
| Q5: mRNA vaccines | 10 | 5 | 5 | 5 |
| **Average** | **10** | **5** | **5** | **4.6** |

*Note: WebSearch always returns 10 links. Brave/Tavily requested 5 (`count=5`/`max_results=5`). SerpAPI requested 5 (`num=5`) but sometimes returned 4.*

### Quality Rating (1-5 scale)

| Query | WebSearch | Brave | Tavily | SerpAPI |
|-------|-----------|-------|--------|---------|
| Q1: Tokyo population | 5 | 5 | 5 | 5 |
| Q2: LLM evaluation | 5 | 5 | 4 | 5 |
| Q3: Rust async runtimes | 5 | 4 | 5 | 4 |
| Q4: Coral reef climate | 5 | 5 | 5 | 4 |
| Q5: mRNA vaccines | 5 | 4 | 5 | 5 |
| **Average** | **5.0** | **4.6** | **4.8** | **4.6** |

### Quality Rating Criteria
- **5:** Top results directly and authoritatively answer the query; all results relevant; sources are credible
- **4:** Good results, mostly relevant, but minor gaps (e.g., one off-topic result, less authoritative sources, or missing key angle)
- **3:** Adequate but mixed; some relevant results alongside irrelevant ones
- **2:** Mostly irrelevant or low-quality sources
- **1:** Failed or completely off-topic

---

## Detailed Results by Query

### Query 1: "What is the current population of Tokyo Japan 2026"

**WebSearch** (11,495 ms, 10 results, Quality: 5)
- Top sources: worldpopulationreview.com, macrotrends.net, populationstat.com, worldometers.info, Wikipedia, nippon.com
- Provided AI-synthesized answer: "36,953,600" for metro area, with city-proper (14M) and 23-ward (9.2M) distinctions
- Returned both the answer AND the source links -- unique among the APIs

**Brave** (498 ms, 5 results, Quality: 5)
- Top sources: worldpopulationreview.com, macrotrends.net, worldometers.info, Wikipedia (Demographics of Tokyo), populationstat.com
- Rich metadata: page_age timestamps, profile images, deep_results with section links
- Fastest response across all queries

**Tavily** (1,083 ms, 5 results, Quality: 5)
- Top sources: worldpopulationreview.com (0.96), worldometers.info (0.93), worldpopulationreview/cities (0.90), nippon.com (0.46), Wikipedia (0.42)
- Includes per-result relevance scores -- useful for programmatic filtering
- Content snippets included inline

**SerpAPI** (1,072 ms, 5 results, Quality: 5)
- Top sources: worldpopulationreview.com, macrotrends.net, Wikipedia, worldometers.info, worldpopulationreview/cities
- Rich metadata: snippet_highlighted_words, related_searches, about_this_result, pagination
- Includes 8 related search suggestions

### Query 2: "best practices for LLM evaluation and benchmarking"

**WebSearch** (19,126 ms, 10 results, Quality: 5)
- Top sources: Databricks, Evidently AI, Turing, NVIDIA, Together AI, Codecademy, Confident AI, Langfuse, DeepEval, IBM
- Provided comprehensive synthesized answer covering dataset selection, evaluation approaches, LLM-as-a-judge, key metrics
- Excellent mix of practical guides and authoritative technical sources

**Brave** (748 ms, 5 results, Quality: 5)
- Top sources: Evidently AI, Databricks, Turing, Together AI, Codecademy
- Also returned 5 video results (YouTube) with duration and creator info -- unique feature
- All results highly relevant and from authoritative sources

**Tavily** (1,456 ms, 5 results, Quality: 4)
- Top sources: Together AI (0.86), Databricks (0.82), Datadog (0.80), Codecademy (0.80), Turing (0.74)
- Content snippets were very long and included a lot of boilerplate/navigation text from Together AI
- Quality ding: raw_content was null for all results; content field contained excessive site navigation markup

**SerpAPI** (8,502 ms, 4 results, Quality: 5)
- Top sources: Databricks, Codecademy, Datadog, Confident AI
- Only returned 4 organic results (not the requested 5)
- Bonus: Included scholarly_articles section with arxiv/NeurIPS papers -- unique and valuable
- Also included inline_videos section with YouTube results
- Slowest response (8.5s) -- significant outlier

### Query 3: "rust programming language async runtime comparison tokio vs async-std"

**WebSearch** (15,350 ms, 10 results, Quality: 5)
- Top sources: corrode.dev, Medium, rust-lang.github.io (async book), Rust forums, async-std GitHub issue, Sling Academy, Zenoh blog
- Synthesized answer covered design differences, ecosystem status, and use-case recommendations
- Best variety: official docs, community discussions, blog posts, performance evaluations

**Brave** (310 ms, 5 results, Quality: 4)
- Top sources: Reddit r/rust (x2), corrode.dev, rust-lang.github.io, Rust forum
- Two Reddit results out of 5 -- leans community/forum-heavy rather than authoritative
- Fastest query across the entire benchmark (310ms)

**Tavily** (1,127 ms, 5 results, Quality: 5)
- Top sources: Medium/AlexanderObregon (1.00), Rust Users Forum (1.00), corrode.dev (1.00), Rust Users Forum (1.00), WyeWorks (1.00)
- All results scored 1.000 -- suggests relevance scoring is capped/saturated for highly relevant queries
- Good mix of tutorial, forum discussion, and analysis content

**SerpAPI** (6,110 ms, 4 results, Quality: 4)
- Top sources: Reddit r/rust, corrode.dev, Medium, Rust Users Forum
- Only 4 results returned (requested 5)
- Similar to Brave: Reddit-heavy results for niche technical topics

### Query 4: "climate change impact on coral reefs latest research"

**WebSearch** (15,770 ms, 10 results, Quality: 5)
- Top sources: NOAA, PMC/PubMed, Nature Communications (x2), IUCN, coral.org, MBARI, University of Hawaii
- Synthesized answer covered thermal stress, bleaching thresholds (7.9%), 2035 timeline, ocean acidification
- Excellent mix of government agencies, peer-reviewed journals, and conservation organizations

**Brave** (852 ms, 5 results, Quality: 5)
- Top sources: NOAA, PMC, Nature Communications, IUCN, Center for Science Education (UCAR)
- All authoritative scientific/government sources
- Good overlap with WebSearch top results

**Tavily** (844 ms, 5 results, Quality: 5)
- Top sources: IUCN (0.999), coral.org PDF (0.999), Nature article (0.999), ICRS PDF (0.999), NOAA (0.998)
- Exceptionally high relevance scores across the board
- Good mix of policy briefs, research papers, and government sources

**SerpAPI** (1,750 ms, 5 results, Quality: 4)
- Top sources: NOAA (restoring reefs), EPA (climate change), Nature Communications, Nature article, WWF
- First two results were somewhat tangential: "Restoring Coral Reefs" and generic "Climate Change" page
- Still relevant but less precisely targeted than other APIs

### Query 5: "how does mRNA vaccine technology work mechanism of action"

**WebSearch** (15,152 ms, 10 results, Quality: 5)
- Top sources: MedlinePlus, Wikipedia, Nature Reviews Drug Discovery, CDC, Mayo Clinic, Cleveland Clinic, NIH Genome, PMC (x2)
- Synthesized answer covered delivery mechanism, protein production, immune recognition, safety
- Excellent authority: government health agencies, peer-reviewed journals, renowned hospitals

**Brave** (1,267 ms, 5 results, Quality: 4)
- Top sources: Immunology Frontiers/PMC, PubMed, Expert Review of Vaccines, BioRender, LAVYON
- More academic/research-focused but missing the accessible government sources (CDC, MedlinePlus)
- BioRender template is less authoritative; LAVYON is a lesser-known source

**Tavily** (828 ms, 5 results, Quality: 5)
- Top sources: IAVI (1.000), Research Outreach (1.000), YouTube (0.998), PMC (0.997), Cleveland Clinic (0.995)
- Good mix of accessible explanations and research papers
- YouTube result is unusual but potentially useful for the educational intent

**SerpAPI** (2,053 ms, 5 results, Quality: 5)
- Top sources: MedlinePlus, PMC, Nature Reviews Drug Discovery, CDC, YouTube (How mRNA COVID-19 vaccines work)
- Same top-quality sources as WebSearch (MedlinePlus, CDC, Nature)
- Rich snippet highlighting and related searches

---

## Overall Rankings

### 1. Best Overall Quality: WebSearch (Claude Code built-in)
- **Average Quality: 5.0/5** (perfect score across all queries)
- **Average Results: 10** (2x more than competitors)
- **Average Latency: 15,379 ms** (slowest by far -- 21x slower than Brave)
- **Strengths:** AI-synthesized answers, highest result count, consistently authoritative sources, mixed source types
- **Weaknesses:** Extremely slow (15s average), no programmatic metadata (scores, timestamps), requires Claude Code environment
- **Best for:** Quality-first research where latency is not a concern

### 2. Best Value / Best for Programmatic Use: Tavily
- **Average Quality: 4.8/5**
- **Average Results: 5**
- **Average Latency: 1,068 ms**
- **Strengths:** Per-result relevance scores (unique), consistent response times, good source diversity, simple POST API
- **Weaknesses:** Occasionally includes boilerplate site content in snippets, relevance scores can saturate at 1.0, content field sometimes noisy
- **Best for:** Programmatic integration, RAG pipelines, apps that need relevance scoring

### 3. Best Speed: Brave Search API
- **Average Quality: 4.6/5**
- **Average Results: 5**
- **Average Latency: 735 ms** (fastest)
- **Strengths:** Fastest by a wide margin, rich metadata (page_age, thumbnails, video results), generous free tier (2K/month)
- **Weaknesses:** Occasionally Reddit-heavy for niche queries, gzip encoding gotcha in default curl examples, slightly lower quality for academic/medical topics
- **Best for:** Speed-critical applications, real-time search, high-volume use cases

### 4. Best Metadata / Google-Quality Results: SerpAPI
- **Average Quality: 4.6/5**
- **Average Results: 4.6** (sometimes returns fewer than requested)
- **Average Latency: 3,897 ms** (highly variable: 1-8.5s)
- **Strengths:** Full Google results with rich metadata (sitelinks, scholarly articles, inline videos, related searches, snippet highlighting), only API with academic paper results
- **Weaknesses:** Most expensive free tier (100/month), highly variable latency (1-8.5s), sometimes returns fewer results than requested, slowest of the three REST APIs
- **Best for:** SEO research, when Google-specific features (sitelinks, scholarly articles) are needed

---

## Composite Score

| API | Speed (30%) | Quality (40%) | Features (15%) | Free Tier (15%) | **Weighted** |
|-----|-------------|---------------|-----------------|-----------------|--------------|
| WebSearch | 1.0 | 5.0 | 4.0 | 2.0* | **3.2** |
| Brave | 5.0 | 4.6 | 3.5 | 5.0 | **4.6** |
| Tavily | 4.0 | 4.8 | 4.5 | 4.0 | **4.4** |
| SerpAPI | 2.5 | 4.6 | 5.0 | 1.5 | **3.6** |

*WebSearch requires Claude Code environment, not a standalone API.*

**Speed scoring:** 5=<1s, 4=1-2s, 3=2-5s, 2=5-10s, 1=>10s
**Free Tier scoring:** 5=2000+/mo, 4=1000/mo, 3=500/mo, 2=200/mo, 1=100/mo
**Features scoring:** metadata richness, source diversity, unique capabilities

### Recommendation

**For deep research agents (like this project):** Use **Tavily** as primary API. It offers the best balance of quality, speed, and programmatic features (relevance scores). Supplement with **WebSearch** for queries where synthesized answers save follow-up work.

**For high-volume/real-time use:** Use **Brave** -- fastest and most generous free tier.

**For one-off research needing Google results:** Use **SerpAPI** sparingly given the 100/month limit.

---

## Technical Notes

### API Gotchas Discovered
1. **Brave:** The `Accept-Encoding: gzip` header causes binary garbage responses. Must omit it or pipe through `gunzip`.
2. **SerpAPI:** Latency is highly variable (1s to 8.5s) -- likely depends on Google's caching and query complexity.
3. **SerpAPI:** Sometimes returns fewer organic results than `num` requests (4 instead of 5).
4. **Tavily:** Relevance scores saturate at 1.000 for highly relevant queries (Q3 had all 5 at 1.000), reducing their discriminative value.
5. **WebSearch:** Not a standalone REST API -- requires Claude Code runtime. Cannot be called from arbitrary code.

### Curl Commands Used

**Brave (working):**
```bash
curl -s -H "Accept: application/json" \
  -H "X-Subscription-Token: $BRAVE_API_KEY" \
  "https://api.search.brave.com/res/v1/web/search?q=QUERY&count=5"
```

**Tavily:**
```bash
curl -s -X POST "https://api.tavily.com/search" \
  -H "Content-Type: application/json" \
  -d '{"api_key":"$TAVILY_API_KEY","query":"QUERY","max_results":5}'
```

**SerpAPI:**
```bash
curl -s "https://serpapi.com/search.json?q=QUERY&api_key=$SERPAPI_API_KEY&num=5"
```

### Raw Curl Latency Data (seconds, curl time_total)

| Query | Brave | Tavily | SerpAPI |
|-------|-------|--------|---------|
| Q1 | 0.461 | 1.047 | 1.016 |
| Q2 | 0.696 | 1.418 | 8.456 |
| Q3 | 0.274 | 1.092 | 6.058 |
| Q4 | 0.817 | 0.795 | 1.714 |
| Q5 | 1.213 | 0.777 | 2.002 |
| **Avg** | **0.692** | **1.026** | **3.849** |

### Sample Raw Output: Tavily Q1 Response Structure
```json
{
  "query": "What is the current population of Tokyo Japan 2026",
  "results": [
    {
      "url": "https://worldpopulationreview.com/cities/japan/tokyo",
      "title": "Tokyo Population 2026",
      "content": "Tokyo's 2026 population is now estimated at 36,953,600...",
      "score": 0.95763195,
      "raw_content": null
    }
  ],
  "response_time": 0.77
}
```

### Sample Raw Output: Brave Q3 Response Structure
```json
{
  "type": "search",
  "query": {"original": "rust programming...", "is_navigational": false},
  "web": {
    "type": "search",
    "results": [
      {
        "title": "r/rust on Reddit: What is the difference...",
        "url": "https://www.reddit.com/...",
        "description": "...",
        "profile": {"name": "Reddit", "long_name": "reddit.com"},
        "language": "en",
        "family_friendly": true,
        "type": "search_result"
      }
    ]
  }
}
```

### Sample Raw Output: SerpAPI Q2 Response Structure
```json
{
  "search_metadata": {"status": "Success", "total_time_taken": 8.29},
  "search_information": {"total_results": 166, "time_taken_displayed": 0.76},
  "organic_results": [
    {
      "position": 1,
      "title": "Best Practices and Methods for LLM Evaluation",
      "link": "https://www.databricks.com/...",
      "snippet": "The first step in evaluating an LLM is to use a dataset...",
      "snippet_highlighted_words": ["use a dataset that is diverse"],
      "sitelinks": {"inline": [...]},
      "source": "Databricks"
    }
  ],
  "scholarly_articles": {
    "articles": [
      {"title": "... llm benchmarks agree?", "link": "https://arxiv.org/..."}
    ]
  },
  "inline_videos": [...]
}
```

---

## API Quota Usage for This Benchmark
- **Brave:** 6 queries used (5 queries + 1 retry for Q1 gzip fix) out of 2,000/month
- **Tavily:** 5 queries used out of 1,000/month
- **SerpAPI:** 5 queries used out of 100/month (5% of monthly allocation)
- **WebSearch:** No external quota (built into Claude Code)
