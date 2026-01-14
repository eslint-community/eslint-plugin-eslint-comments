import type { TextSourceCode } from "@eslint/core"
import type { AST, Rule, SourceCode } from "eslint"
import type { Comment, DirectiveComment } from "./types.ts"
import * as utils from "./utils.ts"

const pool = new WeakMap<AST.Program, DirectiveComment[]>()

/**
 * @param {import('eslint').SourceCode} sourceCode - The source code to scan.
 * @returns {DirectiveComment[]} The directive comments.
 */
function getAllDirectiveCommentsFromAllComments(
    sourceCode: SourceCode
): DirectiveComment[] {
    return sourceCode
        .getAllComments()
        .map((comment) => ({
            comment,
            directiveComment: utils.parseDirectiveComment(comment),
        }))
        .filter(
            (
                infoObject
            ): infoObject is {
                comment: Comment & Required<Pick<Comment, "range">>
                directiveComment: NonNullable<
                    ReturnType<typeof utils.parseDirectiveComment>
                >
            } => Boolean(infoObject.directiveComment)
        )
        .map(
            ({ comment, directiveComment }) =>
                ({
                    kind: directiveComment.kind,
                    value: directiveComment.value,
                    description: directiveComment.description,
                    node: comment,
                    range: comment.range,
                    loc: comment.loc!,
                }) satisfies DirectiveComment
        )
}

/**
 * @param {import('@eslint/core').TextSourceCode} sourceCode - The source code to scan.
 * @returns {DirectiveComment[]} The directive comments.
 */
function getAllDirectiveCommentsFromInlineConfigNodes(
    sourceCode: TextSourceCode &
        Required<
            Pick<
                TextSourceCode,
                "getInlineConfigNodes" | "getDisableDirectives"
            >
        >
): DirectiveComment[] {
    const result = sourceCode.getDisableDirectives().directives.map(
        (directive) =>
            ({
                kind: `eslint-${directive.type}`,
                value: directive.value,
                description: directive.justification,
                node: directive.node,
                range: sourceCode.getRange(directive.node),
                get loc() {
                    return sourceCode.getLoc(directive.node)
                },
            }) satisfies DirectiveComment
    )

    return result.concat(
        sourceCode
            .getInlineConfigNodes()
            .map((node) => ({
                node,
                range: sourceCode.getRange(node),
            }))
            .filter(
                ({ range }) =>
                    // The node has intersection of the directive comment.
                    // So, we need to skip it.
                    !result.some(
                        (comment) =>
                            comment.range[0] <= range[1] &&
                            range[0] <= comment.range[1]
                    )
            )
            .map(({ node, range }) => {
                const nodeText = sourceCode.text.slice(range[0], range[1])
                const commentValue = extractCommentContent(nodeText)
                const directiveComment = utils.parseDirectiveText(commentValue)

                return {
                    directiveComment,
                    node,
                    range,
                }
            })
            .filter(
                (
                    infoObject
                ): infoObject is Pick<DirectiveComment, "node" | "range"> & {
                    directiveComment: DirectiveComment
                } =>
                    infoObject.directiveComment != null &&
                    ![
                        "eslint-disable",
                        "eslint-disable-line",
                        "eslint-disable-next-line",
                        "eslint-enable",
                    ].includes(infoObject.directiveComment.kind)
            )
            .map(
                ({ directiveComment, node, range }) =>
                    ({
                        kind: directiveComment.kind,
                        value: directiveComment.value,
                        description: directiveComment.description!,
                        node,
                        range,
                        get loc() {
                            return sourceCode.getLoc(node)
                        },
                    }) satisfies DirectiveComment
            )
    )
}

function extractCommentContent(text: string): string {
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
              ? text.slice(3, -3)
              : text.startsWith("#")
                ? text.slice(1)
                : text
}

/**
 * Get all directive comments for the given rule context.
 *
 * @param {import("@eslint/core").RuleContext} context - The rule context to get.
 * @returns {DirectiveComment[]} The all directive comments object for the rule context.
 */
export function getAllDirectiveComments(
    context: Parameters<Rule.RuleModule["create"]>[0] & {
        sourceCode: TextSourceCode &
            (
                | Required<
                      Pick<
                          TextSourceCode,
                          "getInlineConfigNodes" | "getDisableDirectives"
                      >
                  >
                | {
                      getInlineConfigNodes?: never
                      getDisableDirectives?: never
                  }
            )
    }
): DirectiveComment[] {
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
}
