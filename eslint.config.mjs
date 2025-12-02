import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import importPlugin from 'eslint-plugin-import';

const eslintConfig = [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      '*.config.{js,mjs,cjs,ts}',
      'playwright.config.ts',
      'vitest.config.ts',
      'coverage/**',
      'dist/**'
    ]
  },
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      import: importPlugin
    },
    rules: {
      'import/order': [
        'error',
        {
          alphabetize: { order: 'asc', caseInsensitive: true },
          groups: [
            ['builtin', 'external'],
            ['internal'],
            ['parent', 'sibling', 'index']
          ],
          'newlines-between': 'always'
        }
      ]
    }
  }
];

export default eslintConfig;
