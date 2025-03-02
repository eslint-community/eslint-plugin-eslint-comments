import type { ESLint, Linter } from "eslint"
import { rulesRecommended } from "./lib/configs/recommended.ts"
import { rules } from "./lib/rules.ts"
import packageJson from "./package.json" with { type: "json" }

const plugin = {
    meta: {
        name: packageJson.name,
        version: packageJson.version,
    },
    rules,
} satisfies ESLint.Plugin

export const recommended = {
    name: "@eslint-community/eslint-comments/recommended",
    plugins: {
        "@eslint-community/eslint-comments": plugin,
    },
    rules: rulesRecommended,
} satisfies Linter.Config
