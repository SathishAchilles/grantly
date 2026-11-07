import js from '@eslint/js'
import vitest from '@vitest/eslint-plugin'
import jestDom from 'eslint-plugin-jest-dom'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import playwright from 'eslint-plugin-playwright'
import reactHooks from 'eslint-plugin-react-hooks'
import testingLibrary from 'eslint-plugin-testing-library'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'playwright-report', 'test-results'] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  jsxA11y.flatConfigs.recommended,
  reactHooks.configs.flat.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['src/**/*.test.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
    ...testingLibrary.configs['flat/react'],
  },
  {
    files: ['src/**/*.test.{ts,tsx}'],
    ...jestDom.configs['flat/recommended'],
  },
  {
    files: ['src/**/*.test.{ts,tsx}'],
    ...vitest.configs.recommended,
  },
  {
    files: ['e2e/**/*.ts'],
    ...playwright.configs['flat/recommended'],
  },
)
