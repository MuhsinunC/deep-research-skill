# Server-Side WebAssembly Adoption: Companies Using WASM in Production

**Date:** 2026-03-29 | **Mode:** Quick | **Scope:** Server-side WASM only

---

## Executive Summary

Server-side WebAssembly has moved from experimental to production-grade, with adoption concentrated in three tiers: (1) cloud/edge platform providers who run WASM as core infrastructure, (2) large enterprises embedding WASM for extensibility and plugin isolation, and (3) a growing tail of companies using WASM-based serverless platforms. The 2025 acquisition of Fermyon by Akamai signals that major CDN/cloud players view WASM as a strategic compute primitive.

---

## Companies Using WASM Server-Side in Production

### Tier 1: Platform Providers (WASM as core infrastructure)

| Company | Product / Use Case | Details |
|---|---|---|
| **Cloudflare** | Workers | Millions of WASM functions in production; sub-10ms cold starts; V8 isolates running WASM at edge globally [1][2] |
| **Fastly** | Compute (formerly Compute@Edge) | Edge CDN logic — custom request/response transformations, A/B testing, dynamic routing; 100,000+ WASM isolates per CPU core [2][3] |
| **Akamai / Fermyon** | Fermyon Cloud (Spin framework) | Thousands of user-built WASM apps in production; acquired by Akamai (Dec 2025) to power edge serverless [4][5] |
| **AWS** | Lambda WASM runtime | First-class WASM runtime support; 10-40x cold start improvements vs. container-based functions [1] |
| **Google Cloud** | Cloud Run (WASM modules) | WASM modules deployed as containerized services with auto-scaling [1] |
| **Microsoft Azure** | Azure Functions (WASI preview) | WASM support with emphasis on WASI AI package for inference at the edge [1] |

### Tier 2: Enterprises Embedding WASM

| Company | Use Case | Details |
|---|---|---|
| **Shopify** | Shopify Functions | Partner-supplied checkout logic (discounts, validation, payment routing) runs as WASM; sub-10ms cold starts inside checkout flow [2][3] |
| **American Express** | Internal FaaS platform | Described as potentially the largest commercial WasmGC application; internal function-as-a-service platform [1] |
| **Google** | Google Sheets calculation engine | Migrated to WasmGC; runs 2x faster than the previous JavaScript engine [1] |
| **Figma** | Graphics engine (C++ → WASM) | 3x load time improvement; while primarily browser-side, their compilation pipeline and rendering architecture informs server-side patterns [1] |

### Tier 3: Domain-Specific Production Use

| Domain | Use Case | Details |
|---|---|---|
| **E-commerce** | Checkout flow customization | Merchants compile custom logic to WASM for execution at Cloudflare/Fastly edge with <10ms latency [2] |
| **Media/Streaming** | Stream authentication & anti-piracy | WASM functions for token management and stream optimization at edge; prevents token-grabbing attacks [2] |
| **Kubernetes** | runwasi + SpinKube | WASM workloads running inside Kubernetes clusters via containerd shims [3] |

---

## Key Technical Advantages Driving Adoption

- **Density:** Hundreds to thousands of WASM instances per process vs. tens of containers on same hardware [2]
- **Cold starts:** Sub-millisecond to <10ms (vs. 100ms-seconds for containers) [1][2]
- **Sandboxing:** Capability-based security model (WASI) provides stronger isolation than containers [3]
- **Polyglot:** Rust, Go, C/C++, Python, JavaScript all compile to WASM [3]

---

## Notable Ecosystem Signal

**Akamai acquiring Fermyon (December 2025)** is the clearest market signal — the world's largest CDN company bought a WASM-native serverless startup to compete with Cloudflare Workers, validating WASM as a strategic server-side compute model [4][5].

---

## Limitations & Caveats

- Most production deployments are at the **edge** (CDN/serverless functions), not traditional backend services
- Adoption metrics for internal enterprise use (like American Express) are self-reported and hard to verify independently
- WASI 1.0 standardization is still in progress; component model adoption is early
- Figma's use case is primarily browser-side (included for context as their architecture influences server patterns)

---

## Sources

1. [WebAssembly Production 2025: WasmGC and Enterprise Adoption — ByteIota](https://byteiota.com/webassembly-production-2025-wasmgc-and-enterprise-adoption/)
2. [WebAssembly Beyond the Browser: Server-Side WASM in Production — Dev Note](https://devstarsj.github.io/2026/02/09/webassembly-server-side-production/)
3. [The Five-Millisecond Cloud: Rust + WebAssembly Will Replace Linux Containers — Gothar](https://gothartech.com/en/insights/rust-wasm-containers-2025)
4. [Akamai acquires Fermyon for edge computing — Network World](https://www.networkworld.com/article/4099424/akamai-acquires-fermyon-for-edge-computing-as-webassembly-comes-of-age.html)
5. [Akamai buys Fermyon for Wasm-based serverless functions — DevClass](https://devclass.com/2025/12/04/akamai-acquires-fermyon-for-wasm-based-serverless-functions-a-possible-answer-to-cloudflare-workers/)
6. [WASI 1.0: WebAssembly Is Everywhere in 2026 — The New Stack](https://thenewstack.io/wasi-1-0-you-wont-know-when-webassembly-is-everywhere-in-2026/)
7. [WebAssembly for Backend: Wasmtime and Spin Lead in 2025 — SupportDevs](https://supportdevs.com/en/webassembly-backend-en/)
