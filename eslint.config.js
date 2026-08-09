import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // .claude holds local agent state, including git worktrees that carry their own
  // tsconfig. Linting into them gives every file in the repo a "multiple candidate
  // TSConfigRootDirs" parse error, so the whole run fails.
  globalIgnores(['dist', 'worker-configuration.d.ts', '.claude']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // A post is a component plus its `meta` front matter, in one file by design.
    files: ['src/content/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': ['error', { allowExportNames: ['meta'] }],
    },
  },
])
