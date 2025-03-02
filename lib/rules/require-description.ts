/**
 * @author Yosuke Ota <https://github.com/ota-meshi>
 * See LICENSE file in root directory for full license.
 */
import type { Rule } from "eslint"
import { getAllDirectiveComments } from "../internal/get-all-directive-comments.ts"
import * as utils from "../internal/utils.ts"

export type RequireDescriptionOptions = {
    ignore?: (
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

const requireDescription: Rule.RuleModule = {
    // eslint-disable-next-line eslint-plugin/require-meta-default-options
    meta: {
        docs: {
            description:
                "require include descriptions in ESLint directive-comments",
            category: "Stylistic Issues",
            recommended: false,
            url: "https://eslint-community.github.io/eslint-plugin-eslint-comments/rules/require-description.html",
        },
        fixable: null as any,
        messages: {
            missingDescription:
                "Unexpected undescribed directive comment. Include descriptions to explain why the comment is necessary.",
        },
        schema: [
            {
                type: "object",
                properties: {
                    // eslint-disable-next-line eslint-plugin/require-meta-schema-description
                    ignore: {
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
        context: Omit<Rule.RuleContext, "options"> & {
            options: [RequireDescriptionOptions]
        }
    ): Rule.RuleListener {
        const ignores = new Set(
            (context.options[0] && context.options[0].ignore) || []
        )

        for (const directiveComment of getAllDirectiveComments(
            context as never
        )) {
            if (ignores.has(directiveComment.kind)) {
                continue
            }
            if (!directiveComment.description) {
                context.report({
                    loc: utils.toForceLocation(directiveComment.loc),
                    messageId: "missingDescription",
                })
            }
        }
        return {}
    },
}

export default requireDescription
