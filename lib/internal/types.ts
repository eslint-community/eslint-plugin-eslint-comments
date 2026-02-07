import type { AST, Linter, SourceCode } from "eslint"

export type Comment = AST.Program["comments"][number]

export type Position = AST.SourceLocation["start"]

export type DirectiveKind =
    | "eslint-disable-line"
    | "eslint-disable-next-line"
    | "eslint-disable"
    | "eslint-enable"

export type DirectiveComment = {
    /**
     * The kind of directive comment.
     */
    kind: DirectiveKind
    /**
     * The directive value if it is `eslint-` comment.
     */
    value: string
    /**
     * The description of the directive comment.
     */
    description?: string | undefined | null
    /**
     * The node of the directive comment.
     */
    node: unknown
    /**
     * The range of the directive comment.
     */
    range: AST.Range
    /**
     * The location of the directive comment.
     */
    loc: AST.SourceLocation
}

export type VerifyWithoutProcessors = (
    this: Linter,
    code: string | SourceCode,
    config: Linter.LegacyConfig | Linter.Config,
    filenameOrOptions?: string | Linter.LintOptions
) => (Linter.LintMessage | Linter.SuppressedLintMessage)[]
