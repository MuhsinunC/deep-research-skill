# Critique Report

## Critical Issues (Must Fix)

### CI-1: Confirmation bias numbers need domain qualification
The 97.2% → 3.6% detection drop is from security code review (arXiv 2603.18740), not fact-checking specifically. While the underlying phenomenon (confirmation bias in LLM evaluation) likely applies across domains, the specific magnitude may differ.
**Action**: Qualify in report that these specific numbers are from code review and may not directly transfer.

### CI-2: 64.5% blind spot average obscures variance
Individual model rates range from 2.3% (Mistral-Small-24B) to 60.6% (Llama-4-Maverick). The average is misleading without the range.
**Action**: Report both average and range, note model-specific variation is enormous.

### CI-3: "Better reasoning = more hallucination" domain specificity
The causal claim is from tool-calling tasks specifically (arXiv 2510.22977), not general reasoning. Overgeneralizing this is a G4 (deficient rigor) risk.
**Action**: Qualify the finding to tool-calling/agentic tasks.

## Moderate Issues (Should Fix)

### MI-1: Benchmark vs. real-world performance gap
Most accuracy numbers come from clean benchmarks (FEVER, AVeriTeC). FactAgent practitioner report shows 20% failure rate on controversial content — a very different picture.
**Action**: Include a subsection on benchmark-reality gap using FactAgent data.

### MI-2: No controlled adversarial-vs-confirmation experiment in fact-checking
We have strong indirect evidence (adversarial approaches work, confirmation bias is harmful) but no single study comparing them in the same fact-checking system.
**Action**: Document as research gap in Limitations.

### MI-3: Temporal decay section is thinnest (2 papers)
The evidence is clear but sparse compared to other sections.
**Action**: Acceptable — both papers are high-quality. Note limited evidence base.

## Minor Issues (Could Fix)

### mi-1: PNAS backfire study is from December 2024
Slightly outside the Jan-Apr 2026 scope but is foundational and directly relevant.
**Action**: Include but note the date; it's within the "foundational 2025 works still actively cited" scope extension.

### mi-2: CorrectBench shows mixed results
Self-correction helps on complex math (+5.2%) but hurts on commonsense reasoning (-11 to -19%). This nuance needs to be in the report.
**Action**: Present both sides — when self-correction helps vs. hurts.

## Persona Critiques (Deep Mode)

### Skeptical Practitioner
"Most of these papers test on curated benchmarks. In my production system, claims are ambiguous, multilingual, and come with missing context. Show me the 20% failure rate from the FactAgent Medium post — that's closer to reality."
→ Address in Section 9 (Practitioner Landscape)

### Adversarial Reviewer
"The 'Triple Verification Stack' is a novel synthesis but unvalidated. No system implements all three layers and measures the combined effect."
→ Label clearly as synthesis/recommendation, not empirical finding

### Implementation Engineer
"The minimum viable verification stack needs to include latency targets and compute requirements, not just accuracy numbers."
→ Include in Section 9 recommendations
