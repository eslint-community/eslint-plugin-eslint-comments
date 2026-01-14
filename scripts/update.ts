/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * See LICENSE file in root directory for full license.
 */
import * as fs from "node:fs"
import * as path from "node:path"
import { fileURLToPath } from "node:url"
import { createIndex } from "./lib/utils.ts"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// docs.
import "./update-docs-headers.ts"
import "./update-docs-index.ts"

// recommended rules.
import "./update-recommended-rules.ts"

// indices.
for (const dirPath of [
    path.resolve(__dirname, "../lib/configs"),
    path.resolve(__dirname, "../lib/rules"),
    path.resolve(__dirname, "../lib/utils"),
]) {
    createIndex(dirPath).then((content) => {
        fs.writeFileSync(`${dirPath}.ts`, content)
    })
}
