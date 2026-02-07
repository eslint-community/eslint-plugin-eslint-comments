/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * See LICENSE file in root directory for full license.
 */
import type { Rule } from "eslint"
import { getDisabledArea } from "../internal/disabled-area.ts"
import * as utils from "../internal/utils.ts"

const noDuplicateDisable: Rule.RuleModule = {
    meta: {
        docs: {
            description: "disallow duplicate `eslint-disable` comments",
            category: "Best Practices",
            recommended: true,
            url: "https://eslint-community.github.io/eslint-plugin-eslint-comments/rules/no-duplicate-disable.html",
        },
        fixable: null as any,
        messages: {
            duplicate: "ESLint rules have been disabled already.",
            duplicateRule: "'{{ruleId}}' rule has been disabled already.",
        },
        schema: [],
        type: "problem",
    },

    create(context) {
        const disabledArea = getDisabledArea(context as never)

        for (const item of disabledArea.duplicateDisableDirectives) {
            context.report({
                loc: utils.toRuleIdLocation(
                    context,
                    item.comment,
                    item.ruleId
                )!,
                messageId: item.ruleId ? "duplicateRule" : "duplicate",
                data: item as never,
            })
        }
        return {}
    },
}

export default noDuplicateDisable
