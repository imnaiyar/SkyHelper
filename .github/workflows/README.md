# GitHub Actions OpenAPI Workflow

This repository includes a GitHub Action that automatically updates the OpenAPI specification when changes are made to the API code.

## Workflow: Update OpenAPI Specification

**File:** `.github/workflows/update-openapi-spec.yml`

### Triggers

The workflow automatically runs when:

- Changes are pushed to the `main` branch in the `packages/skyhelper/src/api/` directory
- Pull requests targeting `main` with changes to `packages/skyhelper/src/api/` are merged

### What it does

1. **Installs dependencies** using pnpm
2. **Builds workspace packages** required for OpenAPI generation
3. **Generates OpenAPI specification** using the existing `pnpm run generate:openapi` script
4. **Clones the target repository** `imnaiyar/skyhelper-openapi-spec`
5. **Updates the OpenAPI spec** by copying the generated `openapi.json` file
6. **Commits and pushes** the updated specification to the target repository

### Required Secrets

To enable this workflow, you need to set up the following GitHub secret in your repository settings:

- `OPENAPI_REPO_TOKEN`: A Personal Access Token (PAT) with write access to the `imnaiyar/skyhelper-openapi-spec` repository

### Setting up the PAT

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with the following permissions:
   - `repo` (Full control of private repositories) - or `public_repo` if the target repo is public
3. Add the token as a secret named `OPENAPI_REPO_TOKEN` in your repository settings

### Output

When the workflow runs successfully, it will:

- Generate a fresh OpenAPI specification from your current API code
- Push the updated `openapi.json` file to the `imnaiyar/skyhelper-openapi-spec` repository
- Include a commit message referencing the source commit SHA for traceability

### Manual Triggering

The workflow only runs automatically on the specified triggers. If you need to manually update the OpenAPI spec, you can:

1. Run the generation locally: `cd packages/skyhelper && pnpm run generate:openapi`
2. Manually copy the generated file to the target repository
3. Or trigger the workflow by making a small change to any file in `packages/skyhelper/src/api/`

### Troubleshooting

If the workflow fails:

1. Check that all workspace dependencies are properly built
2. Verify the `OPENAPI_REPO_TOKEN` secret is correctly configured
3. Ensure the target repository `imnaiyar/skyhelper-openapi-spec` exists and is accessible
4. Check the workflow logs for specific error messages
