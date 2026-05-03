# deep-research-cli usage reference

## Quick examples

```bash
# Default: deep mode, Claude provider
node ~/.claude/skills/deep-research-cli/scripts/cli.mjs \
  "How can the deep-research-cli project be improved?"

# Standard mode (cheaper, no VERIFY phase)
node ~/.claude/skills/deep-research-cli/scripts/cli.mjs \
  "Vector databases for RAG in 2026" --mode standard

# OpenRouter (DeepSeek, GPT-4o, etc. — requires opencode + OPENROUTER_API_KEY)
node ~/.claude/skills/deep-research-cli/scripts/cli.mjs \
  "AI agent observability tools" --provider opencode

# Resume after a kill
node ~/.claude/skills/deep-research-cli/scripts/cli.mjs \
  --resume --output-dir ~/Documents/Research/my-topic_20260503_abc12345

# Pause an in-flight dispatch (in another terminal)
touch ~/Documents/Research/my-topic_*/\_STOP_REQUESTED
```

## Mode reference

| Mode      | Phases                                               | Tokens (est.) | Cost (est.)   |
|-----------|------------------------------------------------------|---------------|---------------|
| quick     | 0, 1, 3, 8                                           | ~50K          | <$1           |
| standard  | 0, 1, 2, 3, 4, 4.5, 5, 8                             | ~250K         | $1-3          |
| deep      | 0, 1, 2, 3, 4, 4.5, 5, 6, 7, 7.5, 8                  | ~400-700K     | $3-7          |
| ultradeep | same as deep with 6-lens retrieval, 5+1 verifiers    | ~800K-1.4M    | $7-14         |

## OpenCode setup (for --provider opencode)

```bash
# Install opencode
brew install opencode-ai/tap/opencode
# (or follow https://opencode.ai/docs/install/ for other platforms)

# Set OpenRouter API key (or any OpenAI-compatible endpoint)
export OPENROUTER_API_KEY=sk-or-...

# Run with explicit model
node ~/.claude/skills/deep-research-cli/scripts/cli.mjs \
  "Topic" --provider opencode --mode standard
```

## Failure modes + recovery

| Symptom                                      | Cause                                                                       | Recovery                                                            |
|----------------------------------------------|-----------------------------------------------------------------------------|---------------------------------------------------------------------|
| `_DONE schema mismatch` exit code 3          | OUTPUT_DIR has a `_DONE` from another tool (e.g. old Python skill)          | Use a fresh OUTPUT_DIR or remove the existing one                   |
| Pause flag detected; exit code 0             | Operator created `_STOP_REQUESTED` or `_STOP_NOW`                           | `rm $OUTPUT_DIR/_STOP_REQUESTED`, then `--resume` to continue       |
| Phase fails with RecoverableError, retried   | Transient API / network issue                                                | Watch logs; if it fails twice, run `--resume`                       |
| HTML/PDF skipped with warning                | The `deep-research` skill's `md_to_html.py` is missing                       | Deploy the deep-research skill OR accept markdown-only output        |
| `opencode binary not found`                  | `--provider opencode` but the binary isn't in PATH                          | `brew install opencode-ai/tap/opencode` or fix PATH                 |
| `OPENROUTER_API_KEY missing`                 | opencode can't authenticate                                                  | Set the env var or configure `~/.config/opencode/config.json`       |

## Operator commands

```bash
# List in-flight dispatches:
jq -r '.tasks[] | select(.status == "in_progress") | "\(.uuid)\t\(.topic)"' \
  ~/.claude/research-tasks-cli.json

# Pause all dispatches:
for d in ~/Documents/Research/*; do touch "$d/_STOP_REQUESTED"; done

# Check a dispatch's progress:
cat ~/Documents/Research/my-topic_*/\_checkpoint.json | jq

# Verify a dispatch is complete:
[ -f ~/Documents/Research/my-topic_*/\_DONE ] && echo "Complete"
```
