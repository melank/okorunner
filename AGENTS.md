# Secret-handling rules

This repository is public. Treat every value that could authenticate, identify,
or grant access as a secret unless it is clearly documented as public.

## Rules for AI-assisted work

- Never add real credentials, tokens, private keys, connection strings, signing
  material, or personal data to source code, fixtures, documentation, patches,
  terminal output, or chat responses.
- Use environment-variable names and clearly synthetic placeholder values in
  examples and tests. Do not copy a value from a local environment into the
  repository, even temporarily.
- Keep local secrets in ignored files such as `.env.local`; commit only a safe
  `.env.example` when configuration needs to be documented.
- Before asking for a commit, run `gitleaks protect --staged --redact` and
  resolve every finding. Do not bypass the hook with `--no-verify`.
- If a secret may have been exposed, stop using it, rotate or revoke it, then
  remove it from the repository and its history as appropriate. Removing the
  line alone does not make a previously committed secret safe.

## Local commit protection

The repository's pre-commit hook runs Gitleaks against staged content. Enable
the versioned hooks once per clone:

```sh
git config core.hooksPath .githooks
```

Install Gitleaks on macOS with `brew install gitleaks`.
