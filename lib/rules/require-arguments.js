/**
 * @author Brett Zamir <https://github.com/brettz9>
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
                "require arguments after ESLint or other directive-comments",
            category: "Stylistic Issues",
            recommended: false,
            url: "https://eslint-community.github.io/eslint-plugin-eslint-comments/rules/require-arguments.html",
        },
        fixable: null,
        messages: {
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
            (directive) => {
                return !LINE_COMMENT_PATTERN.test(directive)
            }
        )

        for (const directiveComment of getAllDirectiveComments(
            context,
            additionalDirectives
        )) {
            const dirRegex = new RegExp(directives[directiveComment.kind], "u")

            if (!dirRegex.test(directiveComment.value)) {
                context.report({
                    loc: utils.toForceLocation(directiveComment.loc),
                    messageId: "missingArgument",
                })
            }
        }
        return {}
    },
}
