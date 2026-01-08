/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * See LICENSE file in root directory for full license.
 */
"use strict"

const {
    getAllDirectiveComments,
} = require("../internal/get-all-directive-comments")
const utils = require("../internal/utils")

module.exports = {
    meta: {
        docs: {
            description: "disallow ESLint directive-comments",
            category: "Stylistic Issues",
            recommended: false,
            url: "https://eslint-community.github.io/eslint-plugin-eslint-comments/rules/no-use.html",
        },
        fixable: null,
        messages: {
            disallowEslint: "Unexpected ESLint directive comment.",
            disallow: "Unexpected directive comment.",
        },
        schema: [
            {
                type: "object",
                properties: {
                    additionalDirectives: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                    },
                    uniqueItems: true,
                    allow: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                        uniqueItems: true,
                    },
                },
                additionalProperties: false,
            },
        ],
        type: "suggestion",
    },

    create(context) {
        const allowed = new Set(
            (context.options[0] && context.options[0].allow) || []
        )
        const additionalDirectives =
            (context.options[0] && context.options[0].additionalDirectives) ||
            []

        for (const directiveComment of getAllDirectiveComments(
            context,
            additionalDirectives
        )) {
            if (!allowed.has(directiveComment.kind)) {
                if (!directiveComment.eslint) {
                    context.report({
                        loc: utils.toForceLocation(directiveComment.loc),
                        messageId: "disallow",
                    })
                } else {
                    context.report({
                        loc: utils.toForceLocation(directiveComment.loc),
                        messageId: "disallowEslint",
                    })
                }
            }
        }
        return {}
    },
}
