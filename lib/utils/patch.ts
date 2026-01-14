/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * See LICENSE file in root directory for full license.
 */
import type { Linter, SourceCode } from "eslint"
import getLinters from "../internal/get-linters.ts"
import type { Comment, VerifyWithoutProcessors } from "../internal/types.ts"
import { toRuleIdLocation } from "../internal/utils.ts"
const quotedName = /'(.+?)'/u

/**
 * Get the severity of a given rule.
 * @param {object} config The config object to check.
 * @param {string} ruleId The rule ID to check.
 * @returns {number} The severity of the rule.
 */
function getSeverity(config: Linter.Config, ruleId: string): Linter.Severity {
    const rules = config && config.rules
    const ruleOptions = rules && rules[ruleId]
    const severity = Array.isArray(ruleOptions) ? ruleOptions[0] : ruleOptions

    switch (severity) {
        case 2:
        case "error":
            return 2

        case 1:
        case "warn":
            return 1

        default:
            return 0
    }
}

/**
 * Get the comment which is at a given message location.
 * @param {Message} message The message to get.
 * @param {SourceCode|undefined} sourceCode The source code object to get.
 * @returns {Comment|undefined} The gotten comment.
 */
function getCommentAt(
    message: Linter.LintMessage,
    sourceCode: SourceCode | undefined
): Comment | undefined {
    if (sourceCode != null) {
        const loc = { line: message.line, column: message.column - 1 }
        const index = sourceCode.getIndexFromLoc(loc)
        const options = { includeComments: true }
        const comment = sourceCode.getTokenByRangeStart(index, options)
        if (
            comment != null &&
            (comment.type === "Line" || comment.type === "Block")
        ) {
            return comment
        }
    }
    return undefined
}

/**
 * Check whether a given message is a `reportUnusedDisableDirectives` error.
 * @param {Message} message The message.
 * @returns {boolean} `true` if the message is a `reportUnusedDisableDirectives` error.
 */
function isUnusedDisableDirectiveError(message: Linter.LintMessage): boolean {
    return (
        !message.fatal &&
        !message.ruleId &&
        message.message.includes("eslint-disable")
    )
}

/**
 * Create `@eslint-community/eslint-comments/no-unused-disable` error.
 * @param {string} ruleId The ruleId.
 * @param {number} severity The severity of the rule.
 * @param {Message} message The original message.
 * @param {Comment|undefined} comment The directive comment.
 * @returns {Message} The created error.
 */
function createNoUnusedDisableError(
    ruleId: string,
    severity: Linter.LintMessage["severity"],
    message: Linter.LintMessage,
    comment: Comment | undefined
): Linter.LintMessage {
    const clone = Object.assign({}, message)
    const match = quotedName.exec(message.message)
    const targetRuleId = match && match[1]

    clone.ruleId = ruleId
    clone.severity = severity
    clone.message = targetRuleId
        ? `'${targetRuleId}' rule is disabled but never reported.`
        : "ESLint rules are disabled but never reported."
    clone.suggestions = []

    if (comment != null) {
        if (targetRuleId) {
            const loc = toRuleIdLocation({}, comment as any, targetRuleId)
            clone.line = loc?.start.line!
            clone.column = loc?.start.column! + 1
            clone.endLine = loc?.end.line
            clone.endColumn = loc?.end.column! + 1
        } else {
            clone.endLine = comment.loc?.end.line
            clone.endColumn = comment.loc?.end.column! + 1
        }
        // Remove the whole node if it is the only rule, otherwise
        // don't try to fix because it is quite complicated.
        if (!comment.value.includes(",") && !comment.value.includes("--")) {
            // We can't use the typical `fixer` helper because we are injecting
            // this message after the fixes are resolved.
            clone.suggestions = [
                {
                    desc: "Remove `eslint-disable` comment.",
                    fix: {
                        range: comment.range!,
                        text: comment.value.includes("\n") ? "\n" : "",
                    },
                },
            ]
        }
    }

    return clone
}

/**
 * Convert `reportUnusedDisableDirectives` errors to `@eslint-community/eslint-comments/no-unused-disable` errors.
 * @param {Message[]} messages The original messages.
 * @param {SourceCode|undefined} sourceCode The source code object.
 * @param {string} ruleId The rule ID to convert.
 * @param {number} severity The severity of the rule.
 * @param {boolean} keepAsIs The flag to keep original errors as is.
 * @returns {Message[]} The converted messages.
 */
function convert(
    messages: Linter.LintMessage[],
    sourceCode: SourceCode | undefined,
    ruleId: string,
    severity: Linter.LintMessage["severity"],
    keepAsIs: boolean
): Linter.LintMessage[] {
    for (let i = messages.length - 1; i >= 0; --i) {
        const message = messages[i]
        if (!isUnusedDisableDirectiveError(message)) {
            continue
        }

        const newMessage = createNoUnusedDisableError(
            ruleId,
            severity,
            message,
            getCommentAt(message, sourceCode)
        )

        if (keepAsIs) {
            messages.splice(i + 1, 0, newMessage)
        } else {
            messages.splice(i, 1, newMessage)
        }
    }

    return messages
}

const patch = (
    ruleId = "@eslint-community/eslint-comments/no-unused-disable"
): void => {
    for (const Linter of getLinters()) {
        const verify0: VerifyWithoutProcessors =
            // @ts-expect-error
            Linter.prototype._verifyWithoutProcessors
        Object.defineProperty(Linter.prototype, "_verifyWithoutProcessors", {
            value: function _verifyWithoutProcessors(
                this: Linter,
                textOrSourceCode: SourceCode | string,
                config: Linter.Config,
                filenameOrOptions?: string | Linter.LintOptions
            ): (Linter.LintMessage | Linter.SuppressedLintMessage)[] {
                const severity = getSeverity(config, ruleId)
                if (severity === 0) {
                    return verify0.call(
                        this,
                        textOrSourceCode,
                        config,
                        filenameOrOptions
                    )
                }

                const options =
                    typeof filenameOrOptions === "string"
                        ? { filename: filenameOrOptions }
                        : filenameOrOptions || {}
                const reportUnusedDisableDirectives = Boolean(
                    options.reportUnusedDisableDirectives
                )
                const messages = verify0.call(
                    this,
                    textOrSourceCode,
                    config,
                    Object.assign({}, options, {
                        reportUnusedDisableDirectives: true,
                    })
                )
                return convert(
                    messages,
                    this.getSourceCode(),
                    ruleId,
                    severity,
                    reportUnusedDisableDirectives
                )
            },
            configurable: true,
            writable: true,
        })
    }
}

export default patch
