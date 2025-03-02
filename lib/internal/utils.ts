/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * See LICENSE file in root directory for full license.
 */
import escapeStringRegexp from "escape-string-regexp"
import type { AST, Rule } from "eslint"
import type {
    Comment,
    DirectiveComment,
    DirectiveKind,
    Position,
} from "./types.ts"

const LINE_PATTERN = /[^\r\n\u2028\u2029]*(?:\r\n|[\r\n\u2028\u2029]|$)/gu

const DIRECTIVE_PATTERN =
    /^(eslint(?:-env|-enable|-disable(?:(?:-next)?-line)?)?|exported|globals?)(?:\s|$)/u
const LINE_COMMENT_PATTERN = /^eslint-disable-(next-)?line$/u

/**
 * Make the location ignoring `eslint-disable` comments.
 *
 * @param {object} location - The location to convert.
 * @returns {object} Converted location.
 */
export function toForceLocation(
    location: AST.SourceLocation
): AST.SourceLocation {
    return {
        start: {
            line: location.start.line,
            column: -1,
        },
        end: location.end,
    }
}

/**
 * Calculate the location of the given rule in the given comment token.
 *
 * @param {Partial<import("@eslint/core").RuleContext>} context - The rule context code.
 * @param {Token} comment - The comment token to calculate.
 * @param {string|null} ruleId - The rule name to calculate.
 * @returns {object} The location of the given information.
 */
export function toRuleIdLocation(
    context: Partial<Rule.RuleContext>,
    comment: any,
    ruleId: string | null | undefined
): AST.SourceLocation | null | undefined {
    const commentLoc = getLoc(context, comment)
    if (ruleId == null) {
        return toForceLocation(commentLoc)
    }

    const lines = comment.value.match(LINE_PATTERN)!
    const ruleIdPattern = new RegExp(
        `([\\s,]|^)${escapeStringRegexp(ruleId)}(?:[\\s,]|$)`
    )

    {
        const m = ruleIdPattern.exec(lines[0])
        if (m != null) {
            const { start } = commentLoc
            return {
                start: {
                    line: start.line,
                    column: 2 + start.column + m.index + m[1].length,
                },
                end: {
                    line: start.line,
                    column:
                        2 +
                        start.column +
                        m.index +
                        m[1].length +
                        ruleId.length,
                },
            }
        }
    }

    for (let i = 1; i < lines.length; ++i) {
        const m = ruleIdPattern.exec(lines[i])
        if (m != null) {
            const { start } = commentLoc
            return {
                start: {
                    line: start.line + i,
                    column: m.index + m[1].length,
                },
                end: {
                    line: start.line + i,
                    column: m.index + m[1].length + ruleId.length,
                },
            }
        }
    }

    /*istanbul ignore next : foolproof */
    return commentLoc
}

/**
 * Checks `a` is less than `b` or `a` equals `b`.
 *
 * @param {{line: number, column: number}} a - A location to compare.
 * @param {{line: number, column: number}} b - Another location to compare.
 * @returns {boolean} `true` if `a` is less than `b` or `a` equals `b`.
 */
export function lte(a: Position, b: Position): boolean {
    return a.line < b.line || (a.line === b.line && a.column <= b.column)
}

/**
 * Parse the given comment token as a directive comment.
 *
 * @param {Token} comment - The comment token to parse.
 * @returns {{kind: string, value: string, description: string | null}|null} The parsed data of the given comment. If `null`, it is not a directive comment.
 */
export function parseDirectiveComment(
    comment: Comment
): Pick<DirectiveComment, "description" | "value" | "kind"> | null {
    const parsed = parseDirectiveText(comment.value)
    if (!parsed) {
        return null
    }

    const lineCommentSupported = LINE_COMMENT_PATTERN.test(parsed.kind)

    if (comment.type === "Line" && !lineCommentSupported) {
        return null
    }

    if (
        parsed.kind === "eslint-disable-line" &&
        comment.loc!.start.line !== comment.loc!.end.line
    ) {
        // disable-line comment should not span multiple lines.
        return null
    }

    return parsed
}

/**
 * Parse the given text as a directive comment.
 *
 * @param {string} textToParse - The text to parse.
 * @returns {{kind: string, value: string, description: string | null}|null} The parsed data of the given comment. If `null`, it is not a directive comment.
 */
export function parseDirectiveText(
    textToParse: string
): Pick<DirectiveComment, "description" | "kind" | "value"> | null {
    const { text, description } = divideDirectiveComment(textToParse)
    const match = DIRECTIVE_PATTERN.exec(text)

    if (!match) {
        return null
    }
    const directiveText = match[1] as DirectiveKind

    const directiveValue = text.slice(match.index + directiveText.length)

    return {
        kind: directiveText,
        value: directiveValue.trim(),
        description,
    }
}

/**
 * Divides and trims description text and directive comments.
 * @param {string} value The comment text to strip.
 * @returns {{text: string, description: string | null}} The stripped text.
 */
function divideDirectiveComment(
    value: string
): Pick<DirectiveComment, "description"> & { text: string } {
    const divided = value.split(/\s-{2,}\s/u)
    const text = divided[0].trim()
    return {
        text,
        description: divided.length > 1 ? divided[1].trim() : null,
    }
}

/**
 * Get source code location from the given node.
 *
 * @param {Partial<import("@eslint/core").RuleContext>} context - The rule context code.
 * @param {unknown} nodeOrToken - The node or token to get.
 * @returns {object} The source code location.
 */
export function getLoc(
    context: Partial<Rule.RuleContext>,
    nodeOrToken: { loc?: AST.SourceLocation | null | undefined }
): AST.SourceLocation {
    const sourceCode =
        context.sourceCode || (context.getSourceCode && context.getSourceCode())
    return sourceCode && typeof (sourceCode as any).getLoc === "function"
        ? (sourceCode as any).getLoc(nodeOrToken)
        : nodeOrToken.loc!
}
