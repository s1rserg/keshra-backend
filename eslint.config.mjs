// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

const localFolderPattern = '^\.{1,2}\/{1}';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  // ts/js files js rules
  {
    rules: {
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          printWidth: 100,
          checkIgnorePragma: true,
        },
      ],
      'no-var': 'error',
      'no-console': 'warn',
      'default-case': 'error',
      'no-else-return': 'error',
      'no-multi-assign': 'error',
      'no-param-reassign': 'error',
      '@typescript-eslint/array-type': 'error',
      '@typescript-eslint/prefer-find': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-array-delete': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/promise-function-async': 'error',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-wrapper-object-types': 'error',
      '@typescript-eslint/prefer-reduce-type-parameter': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          minimumDescriptionLength: 5,
          'ts-check': false,
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': true,
          'ts-nocheck': true,
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  eslintPluginPrettierRecommended,

  // sort imports
  {
    files: ['**/*.ts'],
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      'simple-import-sort/exports': 'off',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            [
              // External packages
              'ambient.*',
              'express.*',
              '@nestjs.*',
              '@nestjs\/swagger',
              'cookie-parser',
              'redis',
              'socket.io',
              '@socket.io',
              'rxjs',
              'class-validator',
              'class-transformer',
              'joi',
              'typeorm',
              'bcrypt',
              'jsonwebtoken',
              'pg',
              'node:',
            ],
            [
              // modules
              '@app',
              '@infrastructure',
              '@modules',
            ],
            [
              // Common
              '^@common',
              '^@common/types',
              '^@common/utils',
              '^@common/dto',
              '^@common/decorators',
              '^@swagger-decorators',
            ],
            [
              // Local Handlers
              `${localFolderPattern}.*types`,
              `${localFolderPattern}.*types`,
              `${localFolderPattern}.*\.enum`,
              `${localFolderPattern}.*\.filter`,
              `${localFolderPattern}.*\.pipe`,
              `${localFolderPattern}.*exceptions`,
              `${localFolderPattern}.*\.handler`,
              `${localFolderPattern}.*\.dto`,
              `${localFolderPattern}.*\.config`,
              `${localFolderPattern}.*\.guard`,
              `${localFolderPattern}.*\.validator`,
              `${localFolderPattern}.*\.schema`,
              `${localFolderPattern}.*\.entity`,
              `${localFolderPattern}.*\.service`,
              `${localFolderPattern}.*\.repository`,
              `${localFolderPattern}.*\.decorator`,
              `${localFolderPattern}.*\.controller`,
              `${localFolderPattern}.*\.gateway`,
              `${localFolderPattern}.*\.mapper`,
              `${localFolderPattern}contracts`,
              `${localFolderPattern}.*events`,
              `${localFolderPattern}.*\.module`,
            ],
          ],
        },
      ],
    },
  },
);
