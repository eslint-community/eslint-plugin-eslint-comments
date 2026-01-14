/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * See LICENSE file in root directory for full license.
 */
import type { Rule } from "eslint"
import { getAllDirectiveComments } from "../internal/get-all-directive-comments.ts"
import * as utils from "../internal/utils.ts"

export type NoUseOptions = {
    allow?: (
        | "eslint"
        | "eslint-disable"
        | "eslint-disable-line"
        | "eslint-disable-next-line"
        | "eslint-enable"
        | "eslint-env"
        | "exported"
        | "global"
        | "globals"
    )[]
}

const noUse: Rule.RuleModule = {
    // eslint-disable-next-line eslint-plugin/require-meta-default-options
    meta: {
        docs: {
            description: "disallow ESLint directive-comments",
            category: "Stylistic Issues",
            recommended: false,
            url: "https://eslint-community.github.io/eslint-plugin-eslint-comments/rules/no-use.html",
        },
        fixable: null as any,
        messages: {
            disallow: "Unexpected ESLint directive comment.",
        },
        schema: [
            {
                type: "object",
                properties: {
                    // eslint-disable-next-line eslint-plugin/require-meta-schema-description
                    allow: {
                        type: "array",
                        items: {
                            enum: [
                                "eslint",
                                "eslint-disable",
                                "eslint-disable-line",
                                "eslint-disable-next-line",
                                "eslint-enable",
                                "eslint-env",
                                "exported",
                                "global",
                                "globals",
                            ],
                        },
                        additionalItems: false,
                        uniqueItems: true,
                    },
                },
                additionalProperties: false,
            },
        ],
        type: "suggestion",
    },

    create(
        context: Omit<Rule.RuleContext, "options"> & { options: [NoUseOptions] }
    ): Rule.RuleListener {
        const allowed = new Set(
            (context.options[0] && context.options[0].allow) || []
        )

        for (const directiveComment of getAllDirectiveComments(
            context as never
        )) {
            if (!allowed.has(directiveComment.kind)) {
                context.report({
                    loc: utils.toForceLocation(directiveComment.loc),
                    messageId: "disallow",
                })
            }
        }
        return {}
    },
}

export default noUse
