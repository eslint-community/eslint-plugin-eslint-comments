import type { Linter } from "eslint"

export const plugins = [
    "@eslint-community/eslint-comments",
] as const satisfies Linter.LegacyConfig["plugins"]

export const rulesRecommended = {
    "@eslint-community/eslint-comments/disable-enable-pair": "error",
    "@eslint-community/eslint-comments/no-aggregating-enable": "error",
    "@eslint-community/eslint-comments/no-duplicate-disable": "error",
    "@eslint-community/eslint-comments/no-unlimited-disable": "error",
    "@eslint-community/eslint-comments/no-unused-enable": "error",
} satisfies Linter.Config["rules"]
