import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Framer Motion's lowercase namespace is used in JSX member expressions
      // (for example, <motion.div />), which ESLint does not recognise as a use.
      'no-unused-vars': ['error', { varsIgnorePattern: '^(motion|[A-Z_])' }],
    },
  },
  {
    files: ['server.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['src/context/**/*.jsx'],
    rules: {
      // Context providers intentionally export their companion hook.
      'react-refresh/only-export-components': 'off',
    },
  },
])
