/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * See LICENSE file in root directory for full license.
 */
import { ESLint } from "eslint"
import * as fs from "node:fs"
import * as path from "node:path"

const linter = new ESLint({ fix: true })

/**
 * Format a given text.
 * @param {string} text The text to format.
 * @returns {Promise<string>} The formatted text.
 */
function format(text: string): Promise<string> {
    return linter.lintText(text).then(([{ output }]) => output || text)
}

/**
 * Create the index file content of a given directory.
 * @param {string} dirPath The path to the directory to create index.
 * @returns {Promise<string>} The index file content.
 */
function createIndex(dirPath: string): Promise<string> {
    const dirName = path.basename(dirPath)
    return format(`/** DON'T EDIT THIS FILE; was created by scripts. */

    module.exports = {
        ${fs
            .readdirSync(dirPath)
            .map((file) => path.basename(file, ".js"))
            .map((id) => `"${id}": require("./${dirName}/${id}"),`)
            .join("\n    ")}
    }
    `)
}

export { createIndex, format }
