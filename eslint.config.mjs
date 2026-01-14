import { recommended } from "@eslint-community/eslint-plugin-eslint-comments/configs"
import js from "@eslint/js"
import prettierConfig from "eslint-config-prettier/flat"
import eslintPlugin from "eslint-plugin-eslint-plugin"
import { defineConfig } from "eslint/config"
import { configs } from "typescript-eslint"

const eslintConfig = defineConfig([
    {
        files: ["**/*.?(c|m)[tj]s?(x)"],
        name: "all-files",
    },
    {
        ignores: ["dist/", "coverage/", "docs/.vitepress/cache"],
        name: "global-ignores",
    },
    {
        name: `${js.meta.name}/recommended`,
        ...js.configs.recommended,
    },
    eslintPlugin.configs.recommended,
    recommended,
    configs.base,
    {
        name: "overrides",
        rules: {
            "no-undef": [0],
            "no-unused-vars": [0],
        },
    },
    prettierConfig,
])

export default eslintConfig
