/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * See LICENSE file in root directory for full license.
 */
import type { Rule } from "eslint"
import { getDisabledArea } from "../internal/disabled-area.ts"
import * as utils from "../internal/utils.ts"

const noUnusedEnable: Rule.RuleModule = {
    meta: {
        docs: {
            description: "disallow unused `eslint-enable` comments",
            category: "Best Practices",
            recommended: true,
            url: "https://eslint-community.github.io/eslint-plugin-eslint-comments/rules/no-unused-enable.html",
        },
        fixable: null as any,
        messages: {
            unused: "ESLint rules are re-enabled but those have not been disabled.",
            unusedRule:
                "'{{ruleId}}' rule is re-enabled but it has not been disabled.",
        },
        schema: [],
        type: "problem",
    },

    create(context) {
        const disabledArea = getDisabledArea(context as never)

        for (const item of disabledArea.unusedEnableDirectives) {
            context.report({
                loc: utils.toRuleIdLocation(
                    context,
                    item.comment,
                    item.ruleId
                )!,
                messageId: item.ruleId ? "unusedRule" : "unused",
                data: item as never,
            })
        }
        return {}
    },
}

export default noUnusedEnable
