# Getting Started

[![npm version](https://img.shields.io/npm/v/@eslint-community/eslint-plugin-eslint-comments.svg)](https://www.npmjs.com/package/@eslint-community/eslint-plugin-eslint-comments)
[![Downloads/month](https://img.shields.io/npm/dm/@eslint-community/eslint-plugin-eslint-comments.svg)](http://www.npmtrends.com/@eslint-community/eslint-plugin-eslint-comments)
[![Build Status](https://github.com/eslint-community/eslint-plugin-eslint-comments/workflows/CI/badge.svg)](https://github.com/eslint-community/eslint-plugin-eslint-comments/actions)
[![codecov](https://codecov.io/gh/eslint-community/eslint-plugin-eslint-comments/branch/main/graph/badge.svg)](https://codecov.io/gh/eslint-community/eslint-plugin-eslint-comments)

Additional ESLint rules for ESLint directive comments (e.g. `//eslint-disable-line`).

## 🏁 Goal

The purpose of this plugin is to apply best practices on directive comments such as `/* eslint-disable */`.

For example,

- to disallow unused disabling.
- to disallow non-effect enabling.
- to require rule IDs for disabling and enabling.

## 💿 Installation

Use [npm](https://www.npmjs.com/) or a compatible tool.

```console
npm install --save-dev eslint @eslint-community/eslint-plugin-eslint-comments
```

::: tip Requirements

- Node.js `^18.18.0 || ^20.9.0 || >=21.1.0`
- ESLint `^8.57.0 || ^9.0.0`
  :::

## 📖 Usage

Configure your [`eslint.config.*` file](https://eslint.org/docs/latest/use/configure/configuration-files-new).

For example:

```js
import js from "@eslint/js"
import comments from "@eslint-community/eslint-plugin-eslint-comments/configs"

export default [js.configs.recommended, comments.recommended]
```

If your project's ESLint config runs in CommonJS instead of ESM, use `require()`:

```js
const comments = require("@eslint-community/eslint-plugin-eslint-comments/configs")
```

Either way, you can optionally configure individual rules:

```js
// ...
export default [
    // ...
    comments.recommended,
    {
        rules: {
            "@eslint-community/eslint-comments/no-unused-disable": "error",
            // ...
        },
    },
]
```

::: tip
The [`@eslint-community/eslint-comments/no-unused-disable`](./rules/no-unused-disable.html) rule has the same effect as [--report-unused-disable-directives](https://eslint.org/docs/user-guide/command-line-interface#--report-unused-disable-directives) option.
However, the `@eslint-community/eslint-comments/no-unused-disable` rule is relatively useful since it can be configured in shareable configs.
:::

### 📜 Legacy ESLint Configs

Configure your [`.eslintrc.*` file](https://eslint.org/docs/latest/use/configure/configuration-files).

For example:

```jsonc
{
    "extends": [
        "eslint:recommended",
        "plugin:@eslint-community/eslint-comments/recommended",
    ],
    "rules": {
        // Optional.
        "@eslint-community/eslint-comments/no-unused-disable": "error",
    },
}
```
