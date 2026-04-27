/**
 * @fileoverview lint-staged — runs linters on staged files only
 * @see https://github.com/lint-staged/lint-staged
 */

export default {
  '*.{js,jsx,ts,tsx}': ['eslint --fix --no-error-on-unmatched-pattern', 'prettier --write'],
  '*.{json,md,mdx,css,html,yml,yaml,scss}': ['prettier --write'],
};
