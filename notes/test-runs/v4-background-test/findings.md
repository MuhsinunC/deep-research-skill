# Prompt Caching for LLMs — Latest Advances

**Research date:** 2026-03-29
**Mode:** Quick validation (SCOPE → RETRIEVE → PACKAGE)

---

## 1. Provider-Level Prompt Caching

Major LLM providers now offer prompt caching that reuses previously computed KV tensors from attention layers, avoiding redundant computation on repeated prompt prefixes.

| Provider | Mechanism | Savings | Notes |
|----------|-----------|---------|-------|
| Anthropic | Prefix caching | 90% cost, 85% latency | TTL configurable (5min or 1hr on Claude 4.5/Haiku 4.5) |
| OpenAI | Automatic caching (on by default) | 50% cost | No developer action needed |
| Google | Implicit + explicit context caching | Varies (explicit = guaranteed discount) | Explicit caching lets you create/reference named caches |
| Amazon Bedrock | Prompt caching API | Up to 90% latency reduction | Supports Claude and other models |

**Key development (Jan 2026):** Anthropic extended TTL options — Claude Haiku 4.5, Sonnet 4.5, and Opus 4.5 now support 5-minute and 1-hour TTLs for prompt caching.

## 2. KV Cache Optimization Techniques

Beyond provider-level caching, significant research has advanced KV cache compression and management at the model level:

### Token-Level Optimization
- **Dynamic KV cache selection** — continuously updates cache during decoding; unselected tokens are evicted or offloaded
- **Budget allocation** — distributes memory based on each component's importance to prediction accuracy
- **KV-AdaQuant** — allocates more bits to key matrices, fewer to value matrices for optimal accuracy/memory tradeoff

### Semantic-Aware Compression
- **ChunkKV** — compresses KV cache at the semantic chunk level rather than individual tokens, preserving linguistic structure and contextual integrity
- **Entropy-guided caching** — allocates larger KV cache budgets to high-entropy attention layers and smaller budgets to low-entropy layers

### System-Level Optimization
- **Multi-tier dynamic storage** — offloads KV caches from GPU VRAM to hierarchical storage (CPU RAM, SSD) with selective reuse
- **LMCache tiered storage** — extends KV cache from GPU HBM (Tier 1) to CPU RAM and local SSDs, dramatically increasing hit ratio on GKE/Kubernetes clusters
- **KV-cache-aware routing (llm-d)** — routes inference requests to instances that already have relevant KV cache loaded, reducing redundant computation
- **vLLM Automatic Prefix Caching** — hash-based block matching identifies shared token prefixes across requests and reuses memory pages directly
- **GQA/MQA architectures** — Grouped-Query and Multi-Query Attention reduce KV cache size at the architecture level

## 3. Practical Impact

- Companies report **up to 80% cost reduction** and **sub-millisecond response times** for cached queries
- Cached token costs are **10x lower** than uncached ($0.30 vs $3.00/M tokens in typical scenarios)
- KV cache cuts attention-related FLOPs by **30–50%** per generation step; average response times drop from **800ms → 350ms** in benchmarked chat scenarios
- Semantic caching (matching similar-but-not-identical prompts) achieves **80%+ cache hit rates**
- A January 2026 audit across **17 providers** confirmed measurable TTFT reductions from cache hits, but also identified **timing side-channel security vulnerabilities**

## 4. Agentic Use Cases

Recent research ("Don't Break the Cache," arXiv 2601.06007) evaluates prompt caching specifically for **long-horizon agentic tasks**, where maintaining cache coherence across multi-step tool-calling workflows is critical for cost and latency.

---

## Sources

- [Don't Break the Cache: Evaluation for Agentic Tasks](https://arxiv.org/html/2601.06007v2)
- [Prompt Caching Infrastructure Guide (Introl)](https://introl.com/blog/prompt-caching-infrastructure-llm-cost-latency-reduction-guide-2025)
- [Prompt Caching: 10x Cheaper LLM Tokens (ngrok)](https://ngrok.com/blog/prompt-caching)
- [When to Use Prompt Caching (Lilian Li)](https://medium.com/@lilianli1922/when-to-use-prompt-caching-from-cost-economics-to-architectural-practice-8b829f995269)
- [ChunkKV: Semantic-Preserving KV Cache Compression](https://openreview.net/forum?id=20JDhbJqn3)
- [Entropy-Guided KV Caching](https://www.mdpi.com/2227-7390/13/15/2366)
- [Survey on LLM Acceleration via KV Cache Management](https://arxiv.org/html/2412.19442v3)
- [KV Cache Aware Routing with llm-d (Red Hat)](https://developers.redhat.com/articles/2025/10/07/master-kv-cache-aware-routing-llm-d-efficient-ai-inference)
- [Caching Strategies for LLM Responses (2026)](https://dasroot.net/posts/2026/02/caching-strategies-for-llm-responses/)
- [KV Cache Internals: LLMs to Distributed Systems (2026)](https://dasroot.net/posts/2026/03/kv-cache-llm-inference-distributed-storage/)
- [Boosting LLM Performance with Tiered KV Cache on GKE (Google Cloud)](https://cloud.google.com/blog/topics/developers-practitioners/boosting-llm-performance-with-tiered-kv-cache-on-google-kubernetes-engine)
- [KV-Cache Wins: Prefix Caching in vLLM to llm-d](https://llm-d.ai/blog/kvcache-wins-you-can-see)
- [Prompt Caching: Zero to Production-Ready (2026)](https://atalupadhyay.wordpress.com/2026/02/10/prompt-caching-from-zero-to-production-ready-llm-optimization/)

## Platforms Checked

Web search (2 queries), arXiv, OpenReview, Medium, vendor blogs
