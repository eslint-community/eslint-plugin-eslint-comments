/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * See LICENSE file in root directory for full license.
 */
import * as fs from "node:fs"
import * as path from "node:path"

/**
 * @type {{id:string,name:string,category:string,description:string,recommended:boolean,fixable:boolean,deprecated:boolean,replacedBy:(string[]|null)}[]}
 */
const rules: {
    id: string
    name: string
    category: string
    description: string
    recommended: boolean
    fixable: boolean
    deprecated: boolean
    replacedBy: string[] | null
}[] = fs
    .readdirSync(path.resolve(__dirname, "../../lib/rules"))
    .map((fileName) => path.basename(fileName, ".ts"))
    .map((name) => {
        const meta = require(`../../lib/rules/${name}`).meta
        return {
            id: `@eslint-community/eslint-comments/${name}`,
            name,
            category: String(meta.docs.category),
            description: String(meta.docs.description),
            recommended: Boolean(meta.docs.recommended),
            fixable: Boolean(meta.fixable),
            deprecated: Boolean(meta.deprecated),
            replacedBy: meta.docs.replacedBy || null,
        }
    })

export default rules
export const withCategories = ["Best Practices", "Stylistic Issues"].map(
    (category) => ({
        category,
        rules: rules.filter(
            (rule) => rule.category === category && !rule.deprecated
        ),
    })
)
