# Citation Verification Report - Batch 1

Verified: 2026-04-01

---

## Claim 1

Claim: "Tool-MAD achieves 71.0% average accuracy across four benchmarks with GPT-4o-mini"
Citation: arXiv 2601.04742
Source: https://arxiv.org/abs/2601.04742
Status: VERIFIED
Evidence: From Table III of the paper (accessed via HTML version at arxiv.org/html/2601.04742), GPT-4o-mini + Tool-MAD scores on four fact-verification benchmarks are: FEVER 73.0%, FEVEROUS 71.5%, FaVIQ 77.5%, AVeriTeC 62.0%. Average = (73.0 + 71.5 + 77.5 + 62.0) / 4 = 71.0%. The paper also states: "Tool-MAD, using the lightweight GPT-4o-mini as its backbone, outperforms the more powerful GPT-4o across all evaluated benchmark datasets."
DRA Flags: NONE -- G4 (deficient rigor): Numbers are accurate; the 71.0% average is correctly computed from the four benchmark scores. G5 (strategic fabrication): The claim faithfully represents what the source reports.

---

## Claim 2

Claim: "Heterogeneous tools (RAG+Search) outperform homogeneous configurations by 5.5-11%"
Citation: arXiv 2601.04742
Source: https://arxiv.org/abs/2601.04742
Status: VERIFIED
Evidence: From Table VI of the paper (accessed via HTML version), RAG+Search (heterogeneous) vs. RAG+RAG (homogeneous) per-benchmark differences are: FEVER: 73.0-67.5 = 5.5%, FEVEROUS: 71.5-60.5 = 11.0%, FaVIQ: 77.5-68.5 = 9.0%, AVeriTeC: 62.0-56.5 = 5.5%. The range of per-benchmark improvements is exactly 5.5% to 11.0%, matching the claimed "5.5-11%". Compared to Search+Search, differences are similar: FEVER 6.0%, FEVEROUS 11.0%, FaVIQ 9.0%, AVeriTeC 6.5%.
DRA Flags: NONE -- G4 (deficient rigor): The 5.5-11% range accurately represents the per-benchmark improvement range against RAG+RAG homogeneous configuration. T2 (misaligned evidence): The source directly addresses heterogeneous vs. homogeneous tool configurations in the same experimental context.

---

## Claim 3

Claim: "PROClaim achieves 81.7% accuracy on Check-COVID, +10.0pp over standard MAD"
Citation: arXiv 2603.28488
Source: https://arxiv.org/html/2603.28488
Status: VERIFIED
Evidence: The paper states: "This framework achieves a aggregate majority-vote accuracy of 81.7% across three independent runs." Table 3 shows PROClaim accuracy of 0.817 (81.7%) via majority vote. The paper explicitly states: "Against Standard MAD (71.7%)--a two-agent, single-judge RAG-based debate without our enhancements--our full pipeline achieves a +10.0 pp improvement." Table 4 confirms Standard MAD baseline at 71.67% accuracy.
DRA Flags: NONE -- G4 (deficient rigor): 81.7% accuracy and +10.0pp improvement are exactly as stated in the paper. G5 (strategic fabrication): No fabrication; the claim matches the source precisely.

---

## Claim 4

Claim: "CRITIC framework yields +7.7 F1 improvement on QA tasks"
Citation: Gou et al. 2023
Source: https://arxiv.org/abs/2305.11738
Status: VERIFIED
Evidence: The paper (published as a conference paper at ICLR 2024) explicitly states on page 2: "when applied to ChatGPT, CRITIC attains 7.7 F1 enhancements across three QA tasks." On page 7, it reiterates: "CRITIC and CRITIC* improve F1 for 5.6 and 10.3 respectively upon text-davinci-003, and 7.7 and 12.4 upon ChatGPT." From Table 1, ChatGPT CRITIC F1 scores are: AmbigNQ 74.9, TriviaQA 81.7, HotpotQA 52.9. CoT baseline F1: AmbigNQ 64.3, TriviaQA 79.2, HotpotQA 42.8. Per-dataset improvements: +10.6, +2.5, +10.1. Average = 23.2/3 = 7.73, which rounds to 7.7.
DRA Flags: NONE -- G4 (deficient rigor): The +7.7 F1 figure is explicitly stated in the paper and verified by computing from Table 1 data. G5 (strategic fabrication): No fabrication; the number is directly from the source.

---

## Claim 5

Claim: "FIRE achieves True F1=0.87 at $0.63 total cost, 766x cheaper than o1-preview"
Citation: NAACL 2025
Source: https://aclanthology.org/2025.findings-naacl.158.pdf
Status: QUESTIONABLE
Evidence: From Table 3 of the paper (page 2906), FIRE with GPT-4o-mini on Factcheck-Bench shows: LLM+Search Cost = $0.19+$0.44 = $0.63 total, and True F1 = 0.87. These two figures are confirmed. However, the "766x cheaper" comparison is misleading as stated. The paper says (page 2906): "it offers a cost savings of 766 times" but this refers specifically to LLM cost only ($145.66 / $0.19 = 766x), NOT total cost. The total cost comparison (including search) would be $146.46 / $0.63 = 232x. Furthermore, the 766x comparison is between GPT-4o-mini and o1-preview as backbone models within the same FIRE framework -- it is not comparing FIRE to a non-FIRE baseline. The claim conflates "766x cheaper" with "$0.63 total cost," implying the 766x ratio applies to total cost, which it does not.
DRA Flags: G4 (deficient rigor) -- The 766x figure applies to LLM cost alone ($0.19 vs $145.66), not to the $0.63 total cost cited in the same sentence. Combining these figures in one sentence creates a misleading impression that the total cost ratio is 766x when it is actually ~232x for total cost. G5 is not triggered -- the 766x number does exist in the source, but its scope is narrower than the claim implies.

---

## Claim 6

Claim: "Self-correction blind spot rate averages 64.5% across 14 models"
Citation: arXiv 2507.02778
Source: https://arxiv.org/html/2507.02778v1
Status: VERIFIED
Evidence: The paper's abstract states: "Testing 14 models, we find an average 64.5% blind spot rate." The paper tests 14 non-reasoning models (shown in Table 4) and reports blind spot rates across three datasets (SCLI5, GSM8K-SC, PRM800K-SC). The 64.5% average is presented as the headline finding across the 14 tested models.
DRA Flags: NONE -- G4 (deficient rigor): The 64.5% average and 14-model count are explicitly stated in the abstract. G5 (strategic fabrication): No fabrication; the claim directly matches the paper's stated finding.

---

## Summary

| # | Claim (abbreviated) | Status | DRA Flags |
|---|---|---|---|
| 1 | Tool-MAD 71.0% avg accuracy, GPT-4o-mini | VERIFIED | NONE |
| 2 | Heterogeneous tools outperform by 5.5-11% | VERIFIED | NONE |
| 3 | PROClaim 81.7% on Check-COVID, +10.0pp | VERIFIED | NONE |
| 4 | CRITIC +7.7 F1 on QA tasks | VERIFIED | NONE |
| 5 | FIRE True F1=0.87 at $0.63, 766x cheaper | QUESTIONABLE | G4 |
| 6 | Self-correction blind spot 64.5% across 14 models | VERIFIED | NONE |

**Overall: 5 of 6 claims VERIFIED, 1 QUESTIONABLE (Claim 5 -- cost multiplier scope mismatch)**
