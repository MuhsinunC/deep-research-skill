// Robust JSON extraction from LLM output.
//
// LLMs (especially Claude) routinely wrap structured JSON in markdown code
// fences despite explicit "Output ONLY valid JSON" instructions. JSON.parse
// fails on the wrapped form. This helper strips common preambles so we can
// honor the responseSchema contract without burning a retry on every call.
//
// Per I-2 in the M19 cross-cutting review: this was the single most likely
// cause of E2E failures at Phase 1 SCOPE.

/** Try several extraction strategies, in order of decreasing strictness:
 *  1. Raw JSON.parse (the strict case — works when the model complied)
 *  2. Strip leading/trailing whitespace, then ```json ... ``` or ``` ... ```
 *     fences if present, then JSON.parse
 *  3. Locate the first balanced { ... } block and JSON.parse that
 *  Returns the original text string if all strategies fail (lets the caller
 *  feed it to a non-object responseSchema, e.g. a plain string schema). */
export function extractJsonOrText(text: string): unknown {
  const trimmed = text.trim();
  // Strategy 1: raw parse.
  try {
    return JSON.parse(trimmed);
  } catch {
    // Fall through.
  }
  // Strategy 2: strip code fences. Match ```json...``` or ```...``` (optional
  // language tag, on its own line or inline).
  const fenceMatch = trimmed.match(/^```(?:json|javascript|js)?\s*\n?([\s\S]*?)\n?```$/);
  if (fenceMatch !== null && fenceMatch[1] !== undefined) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch {
      // Fall through to balanced-brace extraction.
    }
  }
  // Strategy 3: find the first balanced { ... } block. Useful when the
  // model prepends or appends commentary despite instructions.
  const braceJson = extractFirstBalancedBraceBlock(trimmed);
  if (braceJson !== null) {
    try {
      return JSON.parse(braceJson);
    } catch {
      // Fall through.
    }
  }
  // Strategy 4: same for [ ... ] arrays.
  const bracketJson = extractFirstBalancedBracketBlock(trimmed);
  if (bracketJson !== null) {
    try {
      return JSON.parse(bracketJson);
    } catch {
      // Fall through.
    }
  }
  // Last resort: return the raw text. responseSchema validation will fail
  // for object/array schemas (triggering the provider's retry-once); for
  // plain string schemas it succeeds.
  return text;
}

function extractFirstBalancedBraceBlock(text: string): string | null {
  return extractFirstBalanced(text, "{", "}");
}

function extractFirstBalancedBracketBlock(text: string): string | null {
  return extractFirstBalanced(text, "[", "]");
}

function extractFirstBalanced(text: string, open: string, close: string): string | null {
  const start = text.indexOf(open);
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (inString) {
      if (ch === "\\") {
        escape = true;
        continue;
      }
      if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }
  return null;
}
