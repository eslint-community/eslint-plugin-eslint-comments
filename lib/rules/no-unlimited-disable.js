/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * See LICENSE file in root directory for full license.
 */
"use strict"

const LINE_COMMENT_PATTERN = /^eslint-disable-(next-)?line$/u

const {
    getAllDirectiveComments,
} = require("../internal/get-all-directive-comments")
const utils = require("../internal/utils")

module.exports = {
    meta: {
        docs: {
            description:
                "disallow `eslint-disable` comments without rule names",
            category: "Best Practices",
            recommended: true,
            url: "https://eslint-community.github.io/eslint-plugin-eslint-comments/rules/no-unlimited-disable.html",
        },
        fixable: null,
        messages: {
            unexpected:
                "Unexpected unlimited '{{kind}}' comment. Specify some rule names to disable.",
            missingArgument: "Missing argument from directive comment.",
        },
        schema: [
            {
                type: "object",
                properties: {
                    directives: {
                        type: "object",
                        patternProperties: {
                            ".*": {
                                type: "string",
                            },
                        },
                    },
                },
                additionalProperties: false,
            },
        ],
        type: "suggestion",
    },

    create(context) {
        const directives =
            (context.options[0] && context.options[0].directives) || {}

        const additionalDirectives = Object.keys(directives).filter(
            (directive) => !LINE_COMMENT_PATTERN.test(directive)
        )

        for (const directiveComment of getAllDirectiveComments(
            context,
            additionalDirectives
        )) {
            const kind = directiveComment.kind
            if (Object.prototype.hasOwnProperty.call(directives, kind)) {
                if (
                    !new RegExp(directives[kind], "u").test(
                        directiveComment.value
                    )
                ) {
                    context.report({
                        loc: utils.toForceLocation(directiveComment.loc),
                        messageId: "missingArgument",
                    })
                }
                continue
            }
            if (
                kind !== "eslint-disable" &&
                kind !== "eslint-disable-line" &&
                kind !== "eslint-disable-next-line"
            ) {
                continue
            }
            if (!directiveComment.value) {
                context.report({
                    loc: utils.toForceLocation(directiveComment.loc),
                    messageId: "unexpected",
                    data: { kind: directiveComment.kind },
                })
            }
        }
        return {}
    },
}
