/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * See LICENSE file in root directory for full license.
 */
import * as fs from "node:fs"
import * as path from "node:path"
import { fileURLToPath } from "node:url"
import rules from "./lib/rules.ts"
import { format } from "./lib/utils.ts"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// recommended.js
format(`/** DON'T EDIT THIS FILE; was created by scripts. */
"use strict"

module.exports = {
    plugins: ["@eslint-community/eslint-comments"],
    rules: {
        ${rules
            .filter((rule) => rule.recommended)
            .map((rule) => `"${rule.id}": "error",`)
            .join("\n        ")}
    },
}
`).then((content) => {
    fs.writeFileSync(
        path.resolve(__dirname, "../lib/configs/recommended.ts"),
        content
    )
})
