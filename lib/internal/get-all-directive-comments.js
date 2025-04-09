"use strict"

const utils = require("./utils")

/**
 * @typedef {object} DirectiveComment
 * @property {string} kind The kind of directive comment.
 * @property {string} [value] The directive value if it is `eslint-` comment.
 * @property {string} description The description of the directive comment.
 * @property {object} node The node of the directive comment.
 * @property {import("@eslint/core").SourceRange} range The range of the directive comment.
 * @property {import("@eslint/core").SourceLocation} loc The location of the directive comment.
 */

const pool = new WeakMap()

/**
 * @param {import('eslint').SourceCode} sourceCode - The source code to scan.
 * @returns {DirectiveComment[]} The directive comments.
 */
function getAllDirectiveCommentsFromAllComments(sourceCode) {
    return sourceCode
        .getAllComments()
        .map((comment) => ({
            comment,
            directiveComment: utils.parseDirectiveComment(comment),
        }))
        .filter(({ directiveComment }) => Boolean(directiveComment))
        .map(
            ({ comment, directiveComment }) =>
                /** @type {DirectiveComment} */ ({
                    kind: directiveComment.kind,
                    value: directiveComment.value,
                    description: directiveComment.description,
                    node: comment,
                    range: comment.range,
                    loc: comment.loc,
                })
        )
}

/**
 * @param {import('@eslint/core').TextSourceCode} sourceCode - The source code to scan.
 * @returns {DirectiveComment[]} The directive comments.
 */
function getAllDirectiveCommentsFromInlineConfigNodes(sourceCode) {
    /** @type {DirectiveComment[]} */
    const result = []
    const disableDirectives = sourceCode.getDisableDirectives()
    for (const directive of disableDirectives.directives) {
        result.push({
            kind: `eslint-${directive.type}`,
            value: directive.value,
            description: directive.justification,
            node: directive.node,
            range: sourceCode.getRange(directive.node),
            get loc() {
                return sourceCode.getLoc(directive.node)
            },
        })
    }
    for (const node of sourceCode.getInlineConfigNodes()) {
        const range = sourceCode.getRange(node)
        // The node has intersection of the directive comment.
        // So, we need to skip it.
        if (
            result.some(
                (comment) =>
                    comment.range[0] <= range[1] && range[0] <= comment.range[1]
            )
        ) {
            continue
        }
        const nodeText = sourceCode.text.slice(range[0], range[1])
        const commentValue = extractCommentContent(nodeText)
        const directiveComment = utils.parseDirectiveText(commentValue)
        if (
            directiveComment != null &&
            ![
                "eslint-disable",
                "eslint-disable-line",
                "eslint-disable-next-line",
                "eslint-enable",
            ].includes(directiveComment.kind)
        ) {
            result.push({
                kind: directiveComment.kind,
                value: directiveComment.value,
                description: directiveComment.description,
                node,
                range,
                get loc() {
                    return sourceCode.getLoc(node)
                },
            })
        }
    }
    return result
}

function extractCommentContent(text) {
    // Extract comment content from the comment text.
    // The comment format was based on the language comment definition in vscode-eslint.
    // See https://github.com/microsoft/vscode-eslint/blob/c0e753713ea9935667e849d91e549adbff213e7e/server/src/languageDefaults.ts#L14
    return text.startsWith("/*") && text.endsWith("*/")
        ? text.slice(2, -2)
        : text.startsWith("//")
        ? text.slice(2)
        : text.startsWith("<!--") && text.endsWith("-->")
        ? text.slice(4, -3)
        : text.startsWith("###") && text.endsWith("###")
        ? text.slice(1)
        : text.startsWith("#")
        ? text.slice(1)
        : text
}

module.exports = {
    /**
     * Get all directive comments for the given rule context.
     *
     * @param {import("@eslint/core").RuleContext} context - The rule context to get.
     * @returns {DirectiveComment[]} The all directive comments object for the rule context.
     */
    getAllDirectiveComments(context) {
        const sourceCode = context.sourceCode || context.getSourceCode()
        let result = pool.get(sourceCode.ast)

        if (result == null) {
            result =
                typeof sourceCode.getInlineConfigNodes === "function" &&
                typeof sourceCode.getDisableDirectives === "function"
                    ? getAllDirectiveCommentsFromInlineConfigNodes(sourceCode)
                    : getAllDirectiveCommentsFromAllComments(sourceCode)
            pool.set(sourceCode.ast, result)
        }

        return result
    },
}
