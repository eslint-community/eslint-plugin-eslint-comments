"use strict"

const globals = require("globals")

/** @type {import('eslint').Linter.Config} */
module.exports = {
    root: true,
    extends: [
        "eslint:recommended",
        "plugin:eslint-plugin/recommended",
        "plugin:n/recommended",
        // "plugin:@eslint-community/eslint-comments/recommended",
        "plugin:prettier/recommended",
    ],
    env: {
        node: true,
    },
    globals: {},
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "script",
    },
    rules: {},
    overrides: [
        {
            files: ["**/*.mjs"],
            parserOptions: {
                sourceType: "module",
            },
        },
        {
            files: ["docs/.vuepress/components/*.vue"],
            parserOptions: {
                parser: "@babel/eslint-parser",
            },
        },
        {
            files: ["tests/**/*.js"],
            globals: {
                ...globals.mocha,
            },
        },
    ],
}
