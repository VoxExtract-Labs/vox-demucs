# Publishing an NPM Package: A Comprehensive Guide

This guide provides a structured approach for publishing high-quality npm packages under an organization scope (e.g., `@voxextractlabs`). It can be reused across projects to ensure consistency, reliability, and maintainability.

---

## 1. Project Initialization

- **Create a new Git repository** with a clear folder structure.
- **Initialize Bun project**: `bun init`
- **Add `.gitignore`** file with appropriate exclusions (e.g., `node_modules`, `dist`, `.env`, etc).
- **Setup Bun config with dual ESM/CJS compatibility if possible**:
    - In `package.json`, configure:
      ```json
      {
        "main": "./dist/index.cjs",
        "module": "./dist/index.js",
        "types": "./dist/index.d.ts",
        "exports": {
          ".": {
            "import": "./dist/index.js",
            "require": "./dist/index.cjs"
          }
        },
        "repository": {
          "type": "git",
          "url": "https://github.com/voxextractlabs/your-package.git"
        },
        "bugs": {
          "url": "https://github.com/voxextractlabs/your-package/issues"
        },
        "homepage": "https://github.com/voxextractlabs/your-package#readme"
      }
      ```

---

## 2. Metadata & Licensing

- **Name** your package properly (e.g., `@voxextractlabs/vox-demucs`).
- **Update `package.json`**:
    - `name`, `version`, `description`
    - `license`: `MIT`
    - `main`, `types`, `exports` for compatibility
    - `repository`, `bugs`, `homepage`
    - `engines`:
      ```json
      "engines": {
        "node": ">=18",
        "bun": ">=1.0"
      }
      ```
- **Create a `LICENSE` file** with MIT license text.
- **Reference the license** in both `README.md` and `package.json`.

---

## 3. Documentation

- **Create a detailed `README.md`**:
    - Project summary and key features
    - Installation instructions
    - Usage examples
    - Configuration details (e.g., CLI options, API)
    - Contribution guidelines
    - License and acknowledgments
- **Add badges**:
    - NPM version
    - License
    - Build status (GitHub Actions)
    - Code coverage (CodeCov)
    - Bundle size (bundlephobia)
- **Auto-documentation tools (optional)**:
    - [TypeDoc](https://typedoc.org/)
    - [Docusaurus](https://docusaurus.io/) for full documentation sites
    - [tsdoc](https://tsdoc.org/) for documenting TypeScript code inline
    - [jsdoc](https://jsdoc.app/) for JS/TS compatibility

---

## 4. Testing and Coverage

- **Write unit and integration tests** using your preferred test runner (e.g., Bun, Vitest, Jest)
- **Ensure test coverage** is high (>90%)
- **Upload reports to coverage tools** like [CodeCov](https://about.codecov.io/) during CI

---

## 5. Development Tools

- **Dependabot setup**:
    - Monitor dependency updates and submit PRs automatically
    - [Quickstart guide](https://docs.github.com/en/code-security/getting-started/dependabot-quickstart-guide)
- **Code formatting/linting**:
    - Use `biome` or `eslint` with appropriate configs
    - Add `.biome.json` or `.eslintrc.json`
    - Optional: Add pre-commit hooks via [Lefthook](https://github.com/evilmartians/lefthook)

---

## 6. Release Automation

- **Install `release-please` GitHub App**:
    - Automatically bump version based on conventional commits
    - Create `CHANGELOG.md` and git tags
- **Create GitHub workflows**:
    - `test.yml`: Run all tests on pull requests and pushes
    - `release.yml`: Publish to npm on new git tags
    - `codecov.yml`: Upload test coverage
    - `dependabot.yml`: Schedule and manage dependency updates

---

## 7. Publishing / Package Quality

- **Perform a dry run before publishing**: `bun publish --dry-run`
- **Publish with**: `bun publish`
- **Add appropriate `keywords`** to `package.json`
- **Verify proper `exports` structure** for maximum compatibility
- **Include `.npmignore`** or use `files` field to control published content
- **Check bundle size** via [bundlephobia](https://bundlephobia.com/)
- **Verify your package on [npmjs.com](https://www.npmjs.com/)**
- **Keep README and metadata up to date**

---

## 8. Optional Enhancements

- **Publish documentation** via GitHub Pages, Docusaurus, or Typedoc
- **Add CLI autocompletion (if applicable)**
- **Support external config loading** via `.env`, YAML, etc.
- **Bundle dependencies** when targeting global install use cases

---
