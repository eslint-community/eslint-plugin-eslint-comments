/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * See LICENSE file in root directory for full license.
 */
import type { Rule } from "eslint"
import { getDisabledArea } from "../internal/disabled-area.ts"
import * as utils from "../internal/utils.ts"

const noAggregatingEnable: Rule.RuleModule = {
    meta: {
        docs: {
            description:
                "disallow a `eslint-enable` comment for multiple `eslint-disable` comments",
            category: "Best Practices",
            recommended: true,
            url: "https://eslint-community.github.io/eslint-plugin-eslint-comments/rules/no-aggregating-enable.html",
        },
        fixable: null as any,
        messages: {
            aggregatingEnable:
                "This `eslint-enable` comment affects {{count}} `eslint-disable` comments. An `eslint-enable` comment should be for an `eslint-disable` comment.",
        },
        schema: [],
        type: "suggestion",
    },

    create(context) {
        const disabledArea = getDisabledArea(context as never)

        for (const entry of disabledArea.numberOfRelatedDisableDirectives) {
            const comment = entry[0]
            const count = entry[1]

            if (count >= 2) {
                context.report({
                    loc: utils.toForceLocation(comment.loc!),
                    messageId: "aggregatingEnable",
                    data: { count } as never,
                })
            }
        }
        return {}
    },
}

export default noAggregatingEnable
