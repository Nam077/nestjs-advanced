module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
      project: 'tsconfig.json',
      tsconfigRootDir: __dirname,
      sourceType: 'module',
      extraFileExtensions: ['.json'],
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'import', 'unused-imports', 'sonarjs', 'security', 'jsdoc'],
  extends: [
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended',
      'plugin:import/errors',
      'plugin:import/warnings',
      'plugin:import/typescript',
      'plugin:sonarjs/recommended-legacy',
      'plugin:security/recommended-legacy',
      'plugin:jsdoc/recommended',
  ],
  root: true,
  env: {
      node: true,
      jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
      // TypeScript rules
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/method-signature-style': ['error', 'property'],
      '@typescript-eslint/member-delimiter-style': [
          'error',
          {
              multiline: {
                  delimiter: 'semi',
                  requireLast: true,
              },
              singleline: {
                  delimiter: 'semi',
                  requireLast: false,
              },
          },
      ],

      // Import rules
      'import/order': [
          'error',
          {
              groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
              pathGroups: [
                  {
                      pattern: '@nestjs/**',
                      group: 'external',
                      position: 'before',
                  },
              ],
              pathGroupsExcludedImportTypes: ['builtin'],
              'newlines-between': 'always',
              alphabetize: {
                  order: 'asc',
                  caseInsensitive: true,
              },
          },
      ],
      'import/newline-after-import': 'error',
      'import/no-unresolved': 'error',
      'import/no-duplicates': 'error',

      // Padding and newlines rules
      'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
      'padding-line-between-statements': [
          'error',
          {
              blankLine: 'any',
              prev: 'export',
              next: 'export',
          },
          {
              blankLine: 'always',
              prev: ['const', 'let', 'var'],
              next: '*',
          },
          {
              blankLine: 'any',
              prev: ['const', 'let', 'var'],
              next: ['const', 'let', 'var'],
          },
          {
              blankLine: 'always',
              prev: '*',
              next: ['function', 'multiline-const', 'multiline-block-like'],
          },
          {
              blankLine: 'always',
              prev: ['function', 'multiline-const', 'multiline-block-like'],
              next: '*',
          },
          {
              blankLine: 'always',
              prev: '*',
              next: 'function',
          },
          {
              blankLine: 'always',
              prev: 'function',
              next: '*',
          },
          {
              blankLine: 'always',
              prev: '*',
              next: 'class',
          },
          {
              blankLine: 'always',
              prev: 'block',
              next: '*',
          },
      ],
      'newline-before-return': 'error',

      // Unused imports rules
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
          'warn',
          {
              vars: 'all',
              varsIgnorePattern: '^_',
              args: 'after-used',
              argsIgnorePattern: '^_',
          },
      ],

      // SonarJS rules
      'sonarjs/no-duplicate-string': 'error',
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/cognitive-complexity': ['error', 15],

      // Security rules
      'security/detect-object-injection': 'error',

      // JSDoc rules
      'jsdoc/check-alignment': 'warn', // Recommended
      'jsdoc/check-param-names': 'warn', // Recommended
      'jsdoc/check-property-names': 'warn', // Recommended
      'jsdoc/check-tag-names': 'warn', // Recommended
      'jsdoc/check-types': 'warn', // Recommended
      'jsdoc/check-values': 'warn', // Recommended
      'jsdoc/empty-tags': 'warn', // Recommended
      'jsdoc/implements-on-classes': 'warn', // Recommended
      'jsdoc/multiline-blocks': 'warn', // Recommended
      'jsdoc/no-multi-asterisks': 'warn', // Recommended
      'jsdoc/no-undefined-types': 'warn', // Recommended
      'jsdoc/require-jsdoc': [
          'error',
          {
              require: {
                  FunctionDeclaration: true,
                  MethodDefinition: true,
                  ClassDeclaration: true,
                  ArrowFunctionExpression: true,
                  FunctionExpression: true,
              },
          },
      ],
      'jsdoc/require-param': 'error', // Recommended
      'jsdoc/require-param-description': 'warn', // Recommended
      'jsdoc/require-param-name': 'error', // Recommended
      'jsdoc/require-param-type': 'error', // Recommended
      'jsdoc/require-property': 'warn', // Recommended
      'jsdoc/require-property-description': 'warn', // Recommended
      'jsdoc/require-property-name': 'warn', // Recommended
      'jsdoc/require-property-type': 'warn', // Recommended
      'jsdoc/require-returns': 'warn', // Recommended
      'jsdoc/require-returns-check': 'warn', // Recommended
      'jsdoc/require-returns-description': 'warn', // Recommended
      'jsdoc/require-returns-type': 'warn', // Recommended
      'jsdoc/require-yields': 'warn', // Recommended
      'jsdoc/require-yields-check': 'warn', // Recommended
      'jsdoc/tag-lines': 'warn', // Recommended
  },
};