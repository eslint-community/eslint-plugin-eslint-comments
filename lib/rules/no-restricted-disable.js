/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * See LICENSE file in root directory for full license.
 */
"use strict"

const ignore = require("ignore")
const { getDisabledArea } = require("../internal/disabled-area")
const utils = require("../internal/utils")

module.exports = {
    meta: {
        docs: {
            description:
                "disallow `eslint-disable` comments about specific rules",
            category: "Stylistic Issues",
            recommended: false,
            url: "https://eslint-community.github.io/eslint-plugin-eslint-comments/rules/no-restricted-disable.html",
        },
        fixable: null,
        messages: {
            disallow: "Disabling '{{ruleId}}' is not allowed.",
        },
        schema: {
            type: "array",
            items: { type: "string" },
            uniqueItems: true,
        },
        type: "suggestion",
    },

    create(context) {
        const disabledArea = getDisabledArea(context)

        if (context.options.length === 0) {
            return {}
        }

        const ig = ignore()
        for (const pattern of context.options) {
            ig.add(pattern)
        }

        for (const area of disabledArea.areas) {
            if (area.ruleId == null || ig.ignores(area.ruleId)) {
                context.report({
                    loc: utils.toRuleIdLocation(
                        context,
                        area.comment,
                        area.ruleId
                    ),
                    messageId: "disallow",
                    data: {
                        ruleId: area.ruleId || String(context.options),
                    },
                })
            }
        }
        return {}
    },
}
