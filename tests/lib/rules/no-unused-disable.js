/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * See LICENSE file in root directory for full license.
 *
 * This rule is special.
 * This rule patches `Linter#verify` method and:
 *
 * 1. enables `reportUnusedDisableDirectives` option.
 * 2. verifies the code.
 * 3. converts `reportUnusedDisableDirectives` errors to `no-unused-disable` errors.
 *
 * So it cannot test with `eslint.RuleTester`.
 * This test confirmes that this rule works file in eslint CLI command.
 */
"use strict"

const assert = require("assert")
const fs = require("fs")
const path = require("path")
const spawn = require("cross-spawn")
const rimraf = require("rimraf")
const semver = require("semver")
const { Linter } = require("eslint")

/**
 * Run eslint CLI command with a given source code.
 * @param {string} code The source code to lint.
 * @param {boolean|string} [reportUnusedDisableDirectives] The flag to enable `--report-unused-disable-directives` option, or severity string.
 * @returns {Promise<Message[]>} The result message.
 */
function runESLint(code, reportUnusedDisableDirectives = false) {
    return new Promise((resolve, reject) => {
        const args = [
            "--stdin",
            "--stdin-filename",
            "test.js",
            "--no-eslintrc",
            "--plugin",
            "@eslint-community/eslint-comments",
            "--rule",
            "@eslint-community/eslint-comments/no-unused-disable:error",
            "--format",
            "json",
        ]

        if (reportUnusedDisableDirectives) {
            if (typeof reportUnusedDisableDirectives === "string") {
                // Use --report-unused-disable-directives-severity for ESLint 8.56.0+
                args.push(
                    "--report-unused-disable-directives-severity",
                    reportUnusedDisableDirectives
                )
            } else {
                args.push("--report-unused-disable-directives")
            }
        }

        const cp = spawn("eslint", args, {
            stdio: ["pipe", "pipe", "inherit"],
            // eslint-disable-next-line no-process-env
            env: { ...process.env, ESLINT_USE_FLAT_CONFIG: "false" },
        })
        const chunks = []
        let totalLength = 0

        cp.stdout.on("data", (chunk) => {
            chunks.push(chunk)
            totalLength += chunk.length
        })
        cp.stdout.on("end", () => {
            try {
                const resultsStr = String(Buffer.concat(chunks, totalLength))
                const results = JSON.parse(resultsStr)
                resolve(results[0].messages)
            } catch (error) {
                reject(error)
            }
        })
        cp.on("error", reject)

        cp.stdin.end(code)
    })
}

describe("no-unused-disable", () => {
    before(() => {
        // Register this plugin.
        const selfPath = path.resolve(__dirname, "../../../")
        const pluginPath = path.resolve(
            __dirname,
            "../../../node_modules/@eslint-community/eslint-plugin-eslint-comments"
        )

        fs.mkdirSync(path.dirname(pluginPath), { recursive: true })
        if (fs.existsSync(pluginPath)) {
            rimraf.sync(pluginPath)
        }

        fs.symlinkSync(selfPath, pluginPath, "junction")
    })

    describe("valid", () => {
        for (const code of [
            `/*eslint no-undef:error*/
var a = b //eslint-disable-line`,
            `/*eslint no-undef:error*/
var a = b /*eslint-disable-line*/`,
            `/*eslint no-undef:error*/
var a = b //eslint-disable-line no-undef`,
            `/*eslint no-undef:error*/
var a = b /*eslint-disable-line no-undef*/`,
            `/*eslint no-undef:error, no-unused-vars:error*/
var a = b //eslint-disable-line no-undef,no-unused-vars`,
            `/*eslint no-undef:error, no-unused-vars:error*/
var a = b /*eslint-disable-line no-undef,no-unused-vars*/`,
            `/*eslint no-undef:error*/
//eslint-disable-next-line
var a = b`,
            `/*eslint no-undef:error*/
/*eslint-disable-next-line*/
var a = b`,
            `/*eslint no-undef:error*/
//eslint-disable-next-line no-undef
var a = b`,
            `/*eslint no-undef:error*/
/*eslint-disable-next-line no-undef*/
var a = b`,
            `/*eslint no-undef:error, no-unused-vars:error*/
//eslint-disable-next-line no-undef,no-unused-vars
var a = b`,
            `/*eslint no-undef:error, no-unused-vars:error*/
/*eslint-disable-next-line no-undef,no-unused-vars*/
var a = b`,
            `/*eslint no-undef:error*/
/*eslint-disable*/
var a = b`,
            `/*eslint no-undef:error*/
/*eslint-disable no-undef*/
var a = b`,
            `/*eslint no-undef:error, no-unused-vars:error*/
/*eslint-disable no-undef,no-unused-vars*/
var a = b`,
            `/*eslint no-undef:error*/
/*eslint-disable*/
var a = b
/*eslint-enable*/`,
            `/*eslint no-undef:error*/
/*eslint-disable no-undef*/
var a = b
/*eslint-enable no-undef*/`,
            `/*eslint no-undef:error, no-unused-vars:error*/
/*eslint-disable no-undef,no-unused-vars*/
var a = b
/*eslint-enable no-undef*/`,

            `
/*eslint no-shadow:error */
var foo = 1
function bar() {
    var foo = 2  //eslint-disable-line no-shadow
}
function baz() {
    var foo = 3  //eslint-disable-line no-shadow
}
`,
            `
/*eslint no-shadow:error */
var foo = 1
function bar() {
var foo = 2  /*eslint-disable-line no-shadow*/
}
function baz() {
var foo = 3  /*eslint-disable-line no-shadow*/
}
`,
            // -- description
            ...(semver.satisfies(Linter.version, ">=7.0.0")
                ? [
                      `/*eslint no-undef:error*/
var a = b //eslint-disable-line -- description`,
                  ]
                : []),
        ]) {
            it(code, () =>
                runESLint(code).then((messages) => {
                    assert.strictEqual(messages.length, 0)
                })
            )
        }
    })

    describe("invalid", () => {
        for (const { code, errors, reportUnusedDisableDirectives } of [
            {
                code: `/*eslint no-undef:off*/
var a = b //eslint-disable-line`,
                errors: [
                    {
                        message:
                            "ESLint rules are disabled but never reported.",
                        line: 2,
                        column: 11,
                        endLine: 2,
                        endColumn: 32,
                        suggestions: [
                            {
                                desc: "Remove `eslint-disable` comment.",
                                fix: {
                                    range: [34, 55],
                                    text: "",
                                },
                            },
                        ],
                    },
                ],
            },
            {
                code: `/*eslint no-undef:off*/
var a = b /*eslint-disable-line*/`,
                errors: [
                    {
                        message:
                            "ESLint rules are disabled but never reported.",
                        line: 2,
                        column: 11,
                        endLine: 2,
                        endColumn: 34,
                    },
                ],
            },
            {
                code: `/*eslint no-undef:off*/
var a = b //eslint-disable-line no-undef`,
                errors: [
                    {
                        message:
                            "'no-undef' rule is disabled but never reported.",
                        line: 2,
                        column: 33,
                        endLine: 2,
                        endColumn: 41,
                        suggestions: [
                            {
                                desc: "Remove `eslint-disable` comment.",
                                fix: {
                                    range: [34, 64],
                                    text: "",
                                },
                            },
                        ],
                    },
                ],
            },
            {
                code: `/*eslint no-undef:off*/
var a = b /*eslint-disable-line no-undef*/`,
                errors: [
                    {
                        message:
                            "'no-undef' rule is disabled but never reported.",
                        line: 2,
                        column: 33,
                        endLine: 2,
                        endColumn: 41,
                    },
                ],
            },
            {
                code: `/*eslint no-undef:off, no-unused-vars:off*/
var a = b //eslint-disable-line no-undef,no-unused-vars`,
                errors: semver.satisfies(Linter.version, ">=8.0.0")
                    ? [
                          {
                              message:
                                  "'no-undef' rule is disabled but never reported.",
                              line: 2,
                              column: 33,
                              endLine: 2,
                              endColumn: 41,
                              suggestions: [],
                          },
                      ]
                    : [
                          {
                              message:
                                  "'no-undef' rule is disabled but never reported.",
                              line: 2,
                              column: 33,
                              endLine: 2,
                              endColumn: 41,
                              suggestions: [],
                          },
                          {
                              message:
                                  "'no-unused-vars' rule is disabled but never reported.",
                              line: 2,
                              column: 42,
                              endLine: 2,
                              endColumn: 56,
                              suggestions: [],
                          },
                      ],
            },
            {
                code: `/*eslint no-undef:off, no-unused-vars:off*/
var a = b /*eslint-disable-line no-undef,no-unused-vars*/`,
                errors: semver.satisfies(Linter.version, ">=8.0.0")
                    ? [
                          {
                              message:
                                  "'no-undef' rule is disabled but never reported.",
                              line: 2,
                              column: 33,
                              endLine: 2,
                              endColumn: 41,
                          },
                      ]
                    : [
                          {
                              message:
                                  "'no-undef' rule is disabled but never reported.",
                              line: 2,
                              column: 33,
                              endLine: 2,
                              endColumn: 41,
                          },
                          {
                              message:
                                  "'no-unused-vars' rule is disabled but never reported.",
                              line: 2,
                              column: 42,
                              endLine: 2,
                              endColumn: 56,
                          },
                      ],
            },
            {
                code: `/*eslint no-undef:off*/
//eslint-disable-next-line
var a = b`,
                errors: [
                    {
                        message:
                            "ESLint rules are disabled but never reported.",
                        line: 2,
                        column: 1,
                        endLine: 2,
                        endColumn: 27,
                        suggestions: [
                            {
                                desc: "Remove `eslint-disable` comment.",
                                fix: {
                                    range: [24, 50],
                                    text: "",
                                },
                            },
                        ],
                    },
                ],
            },
            {
                code: `/*eslint no-undef:off*/
/*eslint-disable-next-line*/
var a = b`,
                errors: [
                    {
                        message:
                            "ESLint rules are disabled but never reported.",
                        line: 2,
                        column: 1,
                        endLine: 2,
                        endColumn: 29,
                    },
                ],
            },
            {
                code: `/*eslint no-undef:off*/
//eslint-disable-next-line no-undef
var a = b`,
                errors: [
                    {
                        message:
                            "'no-undef' rule is disabled but never reported.",
                        line: 2,
                        column: 28,
                        endLine: 2,
                        endColumn: 36,
                        suggestions: [
                            {
                                desc: "Remove `eslint-disable` comment.",
                                fix: {
                                    range: [24, 59],
                                    text: "",
                                },
                            },
                        ],
                    },
                ],
            },
            {
                code: `/*eslint no-undef:off*/
/*eslint-disable-next-line no-undef*/
var a = b`,
                errors: [
                    {
                        message:
                            "'no-undef' rule is disabled but never reported.",
                        line: 2,
                        column: 28,
                        endLine: 2,
                        endColumn: 36,
                    },
                ],
            },
            {
                code: `/*eslint no-undef:off, no-unused-vars:off*/
//eslint-disable-next-line no-undef,no-unused-vars
var a = b`,
                errors: semver.satisfies(Linter.version, ">=8.0.0")
                    ? [
                          {
                              message:
                                  "'no-undef' rule is disabled but never reported.",
                              line: 2,
                              column: 28,
                              endLine: 2,
                              endColumn: 36,
                              suggestions: [],
                          },
                      ]
                    : [
                          {
                              message:
                                  "'no-undef' rule is disabled but never reported.",
                              line: 2,
                              column: 28,
                              endLine: 2,
                              endColumn: 36,
                              suggestions: [],
                          },
                          {
                              message:
                                  "'no-unused-vars' rule is disabled but never reported.",
                              line: 2,
                              column: 37,
                              endLine: 2,
                              endColumn: 51,
                              suggestions: [],
                          },
                      ],
            },
            {
                code: `/*eslint no-undef:off, no-unused-vars:off*/
/*eslint-disable-next-line no-undef,no-unused-vars*/
var a = b`,
                errors: semver.satisfies(Linter.version, ">=8.0.0")
                    ? [
                          {
                              message:
                                  "'no-undef' rule is disabled but never reported.",
                              line: 2,
                              column: 28,
                              endLine: 2,
                              endColumn: 36,
                          },
                      ]
                    : [
                          {
                              message:
                                  "'no-undef' rule is disabled but never reported.",
                              line: 2,
                              column: 28,
                              endLine: 2,
                              endColumn: 36,
                          },
                          {
                              message:
                                  "'no-unused-vars' rule is disabled but never reported.",
                              line: 2,
                              column: 37,
                              endLine: 2,
                              endColumn: 51,
                          },
                      ],
            },
            {
                code: `/*eslint no-undef:off*/
/*eslint-disable*/
var a = b`,
                errors: [
                    {
                        message:
                            "ESLint rules are disabled but never reported.",
                        line: 2,
                        column: 1,
                        endLine: 2,
                        endColumn: 19,
                        suggestions: [
                            {
                                desc: "Remove `eslint-disable` comment.",
                                fix: {
                                    range: [24, 42],
                                    text: "",
                                },
                            },
                        ],
                    },
                ],
            },
            {
                code: `/*eslint no-undef:off*/
/*eslint-disable no-undef*/
var a = b`,
                errors: [
                    {
                        message:
                            "'no-undef' rule is disabled but never reported.",
                        line: 2,
                        column: 18,
                        endLine: 2,
                        endColumn: 26,
                        suggestions: [
                            {
                                desc: "Remove `eslint-disable` comment.",
                                fix: {
                                    range: [24, 51],
                                    text: "",
                                },
                            },
                        ],
                    },
                ],
            },
            {
                code: `/*eslint no-undef:off, no-unused-vars:off*/
/*eslint-disable no-undef,no-unused-vars*/
var a = b`,
                errors: semver.satisfies(Linter.version, ">=8.0.0")
                    ? [
                          {
                              message:
                                  "'no-undef' rule is disabled but never reported.",
                              line: 2,
                              column: 18,
                              endLine: 2,
                              endColumn: 26,
                              suggestions: [],
                          },
                      ]
                    : [
                          {
                              message:
                                  "'no-undef' rule is disabled but never reported.",
                              line: 2,
                              column: 18,
                              endLine: 2,
                              endColumn: 26,
                              suggestions: [],
                          },
                          {
                              message:
                                  "'no-unused-vars' rule is disabled but never reported.",
                              line: 2,
                              column: 27,
                              endLine: 2,
                              endColumn: 41,
                              suggestions: [],
                          },
                      ],
            },
            {
                code: `/*eslint no-undef:off*/
/*eslint-disable*/
var a = b
/*eslint-enable*/`,
                errors: [
                    {
                        message:
                            "ESLint rules are disabled but never reported.",
                        line: 2,
                        column: 1,
                        endLine: 2,
                        endColumn: 19,
                        suggestions: [
                            {
                                desc: "Remove `eslint-disable` comment.",
                                fix: {
                                    range: [24, 42],
                                    text: "",
                                },
                            },
                        ],
                    },
                ],
            },
            {
                code: `/*eslint no-undef:off*/
/*eslint-disable no-undef*/
var a = b
/*eslint-enable*/`,
                errors: [
                    {
                        message:
                            "'no-undef' rule is disabled but never reported.",
                        line: 2,
                        column: 18,
                        endLine: 2,
                        endColumn: 26,
                        suggestions: [
                            {
                                desc: "Remove `eslint-disable` comment.",
                                fix: {
                                    range: [24, 51],
                                    text: "",
                                },
                            },
                        ],
                    },
                ],
            },
            {
                code: `/*eslint no-undef:off, no-unused-vars:off*/
/*eslint-disable no-undef,no-unused-vars*/
var a = b
/*eslint-enable*/`,
                errors: semver.satisfies(Linter.version, ">=8.0.0")
                    ? [
                          {
                              message:
                                  "'no-undef' rule is disabled but never reported.",
                              line: 2,
                              column: 18,
                              endLine: 2,
                              endColumn: 26,
                              suggestions: [],
                          },
                      ]
                    : [
                          {
                              message:
                                  "'no-undef' rule is disabled but never reported.",
                              line: 2,
                              column: 18,
                              endLine: 2,
                              endColumn: 26,
                              suggestions: [],
                          },
                          {
                              message:
                                  "'no-unused-vars' rule is disabled but never reported.",
                              line: 2,
                              column: 27,
                              endLine: 2,
                              endColumn: 41,
                              suggestions: [],
                          },
                      ],
            },
            {
                code: `/*eslint no-undef:error*/
/*eslint-disable*/
/*eslint-enable*/
var a = b//eslint-disable-line no-undef`,
                errors: [
                    {
                        message:
                            "ESLint rules are disabled but never reported.",
                        line: 2,
                        column: 1,
                        endLine: 2,
                        endColumn: 19,
                        suggestions: [
                            {
                                desc: "Remove `eslint-disable` comment.",
                                fix: {
                                    range: [26, 44],
                                    text: "",
                                },
                            },
                        ],
                    },
                ],
            },
            {
                code: `/*eslint no-undef:error*/
/*eslint-disable*/
/*eslint-enable*/
var a = b/*eslint-disable-line no-undef*/`,
                errors: [
                    {
                        message:
                            "ESLint rules are disabled but never reported.",
                        line: 2,
                        column: 1,
                        endLine: 2,
                        endColumn: 19,
                    },
                ],
            },
            {
                code: `/*eslint no-undef:error*/
/*eslint-disable no-undef*/
/*eslint-enable no-undef*/
var a = b//eslint-disable-line no-undef`,
                errors: [
                    {
                        message:
                            "'no-undef' rule is disabled but never reported.",
                        line: 2,
                        column: 18,
                        endLine: 2,
                        endColumn: 26,
                        suggestions: [
                            {
                                desc: "Remove `eslint-disable` comment.",
                                fix: {
                                    range: [26, 53],
                                    text: "",
                                },
                            },
                        ],
                    },
                ],
            },
            {
                code: `/*eslint no-undef:error*/
/*eslint-disable no-undef*/
/*eslint-enable no-undef*/
var a = b/*eslint-disable-line no-undef*/`,
                errors: [
                    {
                        message:
                            "'no-undef' rule is disabled but never reported.",
                        line: 2,
                        column: 18,
                        endLine: 2,
                        endColumn: 26,
                    },
                ],
            },
            {
                code: `/*eslint no-undef:error, no-unused-vars:error*/
/*eslint-disable no-undef,no-unused-vars*/
/*eslint-enable no-undef*/
var a = b//eslint-disable-line no-undef`,
                errors: [
                    {
                        message:
                            "'no-undef' rule is disabled but never reported.",
                        line: 2,
                        column: 18,
                        endLine: 2,
                        endColumn: 26,
                        suggestions: [],
                    },
                ],
            },
            {
                code: `/*eslint no-undef:error, no-unused-vars:error*/
/*eslint-disable no-undef,no-unused-vars*/
/*eslint-enable no-undef*/
var a = b/*eslint-disable-line no-undef*/`,
                errors: [
                    {
                        message:
                            "'no-undef' rule is disabled but never reported.",
                        line: 2,
                        column: 18,
                        endLine: 2,
                        endColumn: 26,
                    },
                ],
            },
            {
                code: `/*eslint no-undef:error, no-unused-vars:error*/
/*eslint-disable
    no-undef,
    no-unused-vars,
    eqeqeq
*/
var a = b
/*eslint-enable*/`,
                errors: [
                    {
                        message:
                            "'eqeqeq' rule is disabled but never reported.",
                        line: 5,
                        column: 5,
                        endLine: 5,
                        endColumn: 11,
                        suggestions: [],
                    },
                ],
            },
            {
                code: "/* eslint new-parens:error*/ /*eslint-disable new-parens*/",
                errors: [
                    {
                        message:
                            "'new-parens' rule is disabled but never reported.",
                        line: 1,
                        column: 47,
                        endLine: 1,
                        endColumn: 57,
                        suggestions: [
                            {
                                desc: "Remove `eslint-disable` comment.",
                                fix: {
                                    range: [29, 58],
                                    text: "",
                                },
                            },
                        ],
                    },
                ],
            },
            {
                code: `/*eslint no-undef:off*/
var a = b //eslint-disable-line`,
                errors: [
                    {
                        message:
                            "Unused eslint-disable directive (no problems were reported).",
                    },
                    {
                        message:
                            "ESLint rules are disabled but never reported.",
                        line: 2,
                        column: 11,
                        endLine: 2,
                        endColumn: 32,
                        suggestions: [
                            {
                                desc: "Remove `eslint-disable` comment.",
                                fix: {
                                    range: [34, 55],
                                    text: "",
                                },
                            },
                        ],
                    },
                ],
                reportUnusedDisableDirectives: true,
            },
            {
                code: `/*eslint no-undef:off*/
var a = b /*eslint-disable-line*/`,
                errors: [
                    {
                        message:
                            "Unused eslint-disable directive (no problems were reported).",
                    },
                    {
                        message:
                            "ESLint rules are disabled but never reported.",
                        line: 2,
                        column: 11,
                        endLine: 2,
                        endColumn: 34,
                    },
                ],
                reportUnusedDisableDirectives: true,
            },
            {
                code: `/*eslint no-undef:off*/
var a = b //eslint-disable-line no-undef`,
                errors: [
                    {
                        message:
                            "Unused eslint-disable directive (no problems were reported from 'no-undef').",
                    },
                    {
                        message:
                            "'no-undef' rule is disabled but never reported.",
                        line: 2,
                        column: 33,
                        endLine: 2,
                        endColumn: 41,
                        suggestions: [
                            {
                                desc: "Remove `eslint-disable` comment.",
                                fix: {
                                    range: [34, 64],
                                    text: "",
                                },
                            },
                        ],
                    },
                ],
                reportUnusedDisableDirectives: true,
            },
            {
                code: `/*eslint no-undef:off*/
var a = b /*eslint-disable-line no-undef*/`,
                errors: [
                    {
                        message:
                            "Unused eslint-disable directive (no problems were reported from 'no-undef').",
                    },
                    {
                        message:
                            "'no-undef' rule is disabled but never reported.",
                        line: 2,
                        column: 33,
                        endLine: 2,
                        endColumn: 41,
                    },
                ],
                reportUnusedDisableDirectives: true,
            },
            // -- description
            ...(semver.satisfies(Linter.version, ">=7.0.0")
                ? [
                      {
                          code: `/*eslint no-undef:off*/
var a = b //eslint-disable-line -- description`,
                          errors: [
                              {
                                  message:
                                      "ESLint rules are disabled but never reported.",
                                  line: 2,
                                  column: 11,
                                  endLine: 2,
                                  endColumn: 47,
                              },
                          ],
                      },
                  ]
                : []),

            // Don't crash even if the source code has a parse error.
            {
                code: "/*eslint no-undef:error*/\nvar a = b c //eslint-disable-line no-undef",
                errors: [
                    {
                        message: "Parsing error: Unexpected token c",
                    },
                ],
            },
        ]) {
            it(code, () =>
                runESLint(code, reportUnusedDisableDirectives).then(
                    (actualMessages) => {
                        assert.strictEqual(actualMessages.length, errors.length)
                        for (let i = 0; i < errors.length; ++i) {
                            const actual = actualMessages[i]
                            const expected = errors[i]

                            for (const key of Object.keys(expected)) {
                                assert.deepStrictEqual(
                                    actual[key],
                                    expected[key],
                                    `'${key}' is not expected.`
                                )
                            }
                        }
                    }
                )
            )
        }
    })

    // Test --report-unused-disable-directives-severity flag for ESLint 8.56.0+
    if (semver.satisfies(Linter.version, ">= 8.56.0")) {
        describe("CLI with --report-unused-disable-directives-severity", () => {
            it("should report both native and plugin messages with severity 'error'", () => {
                const code = `/*eslint no-undef:off*/
var a = b //eslint-disable-line`

                return runESLint(code, "error").then((messages) => {
                    // Should get both native and plugin messages
                    assert.strictEqual(messages.length, 2)
                    assert(
                        messages.some((m) =>
                            m.message.includes(
                                "Unused eslint-disable directive"
                            )
                        )
                    )
                    assert(
                        messages.some((m) =>
                            m.message.includes(
                                "ESLint rules are disabled but never reported"
                            )
                        )
                    )
                })
            })

            it("should report both native and plugin messages with severity 'warn'", () => {
                const code = `/*eslint no-undef:off*/
var a = b //eslint-disable-line`

                return runESLint(code, "warn").then((messages) => {
                    // Should get both native and plugin messages
                    assert.strictEqual(messages.length, 2)
                    assert(
                        messages.some((m) =>
                            m.message.includes(
                                "Unused eslint-disable directive"
                            )
                        )
                    )
                    assert(
                        messages.some((m) =>
                            m.message.includes(
                                "ESLint rules are disabled but never reported"
                            )
                        )
                    )
                })
            })
        })
    }

    if (semver.satisfies(Linter.version, "< 8.57.0")) {
        // Legacy config tests (to hit _verifyWithoutProcessors branches)
        // Note: These tests only work in ESLint < 8.57.0 because in 8.57.0+,
        // the plugin loading mechanism changed
        describe("programmatic API with legacy config (eslintrc style)", () => {
            const plugin = require("../../../")

            it("should handle filenameOrOptions as string", () => {
                const linter = new Linter()
                const code = `//eslint-disable-line no-undef
    var a = b`

                const messages = linter.verify(
                    code,
                    {
                        plugins: {
                            "@eslint-community/eslint-comments": plugin,
                        },
                        rules: {
                            "@eslint-community/eslint-comments/no-unused-disable":
                                "error",
                        },
                    },
                    "test.js"
                ) // Pass filename as string

                // Should process unused directives with string filename
                assert.strictEqual(messages.length, 1)
                assert(
                    messages[0].message.includes(
                        "ESLint rules are disabled but never reported"
                    )
                )
            })

            it("should handle filenameOrOptions as undefined/falsy", () => {
                const linter = new Linter()
                const code = `//eslint-disable-line no-undef
    var a = b`

                const messages = linter.verify(code, {
                    plugins: {
                        "@eslint-community/eslint-comments": plugin,
                    },
                    rules: {
                        "@eslint-community/eslint-comments/no-unused-disable":
                            "error",
                    },
                }) // No third parameter (undefined)

                // Should process unused directives with undefined options
                assert.strictEqual(messages.length, 1)
                assert(
                    messages[0].message.includes(
                        "ESLint rules are disabled but never reported"
                    )
                )
            })
        })
    }

    // Programmatic API tests for ESLint 8.57.0+ with flat config
    if (
        semver.satisfies(Linter.version, ">= 8.57.0") &&
        semver.satisfies(Linter.version, "< 9.0.0")
    ) {
        describe("programmatic API with flat config (ESLint 8.57.0)", () => {
            const plugin = require("../../../")

            it("should get native message only when rule is disabled", () => {
                const linter = new Linter({ configType: "flat" })
                const code = `/*eslint no-undef:off*/
var a = b //eslint-disable-line`

                const messages = linter.verify(
                    code,
                    {
                        plugins: {
                            "@eslint-community/eslint-comments": plugin,
                        },
                        rules: {
                            "@eslint-community/eslint-comments/no-unused-disable":
                                "off",
                        },
                    },
                    {
                        reportUnusedDisableDirectives: true,
                    }
                )

                // Should get native message only
                assert.strictEqual(messages.length, 1)
                assert(
                    messages.some((m) =>
                        m.message.includes("Unused eslint-disable directive")
                    )
                )
            })

            it("should report both native and plugin messages when options.reportUnusedDisableDirectives is set", () => {
                const linter = new Linter({ configType: "flat" })
                const code = `/*eslint no-undef:off*/
var a = b //eslint-disable-line`

                const messages = linter.verify(
                    code,
                    {
                        plugins: {
                            "@eslint-community/eslint-comments": plugin,
                        },
                        rules: {
                            "@eslint-community/eslint-comments/no-unused-disable":
                                "error",
                        },
                    },
                    {
                        reportUnusedDisableDirectives: true,
                    }
                )

                // Should get both native and plugin messages
                assert.strictEqual(messages.length, 2)
                assert(
                    messages.some((m) =>
                        m.message.includes("Unused eslint-disable directive")
                    )
                )
                assert(
                    messages.some((m) =>
                        m.message.includes(
                            "ESLint rules are disabled but never reported"
                        )
                    )
                )
            })

            it("should report both native and plugin messages when options.reportUnusedDisableDirectives is set (warn severity)", () => {
                const linter = new Linter({ configType: "flat" })
                const code = `/*eslint no-undef:off*/
var a = b //eslint-disable-line`

                const messages = linter.verify(
                    code,
                    {
                        plugins: {
                            "@eslint-community/eslint-comments": plugin,
                        },
                        rules: {
                            "@eslint-community/eslint-comments/no-unused-disable":
                                "warn",
                        },
                    },
                    {
                        reportUnusedDisableDirectives: true,
                    }
                )

                // Should get both native and plugin messages
                assert.strictEqual(messages.length, 2)
                assert(
                    messages.some((m) =>
                        m.message.includes("Unused eslint-disable directive")
                    )
                )
                assert(
                    messages.some((m) =>
                        m.message.includes(
                            "ESLint rules are disabled but never reported"
                        )
                    )
                )
            })

            it("should report only plugin messages when options.reportUnusedDisableDirectives is not set", () => {
                const linter = new Linter({ configType: "flat" })
                const code = `/*eslint no-undef:off*/
var a = b //eslint-disable-line`

                const messages = linter.verify(code, {
                    plugins: {
                        "@eslint-community/eslint-comments": plugin,
                    },
                    rules: {
                        "@eslint-community/eslint-comments/no-unused-disable":
                            "error",
                    },
                })

                // Should get only plugin message (not native)
                assert.strictEqual(messages.length, 1)
                assert(
                    messages[0].message.includes(
                        "ESLint rules are disabled but never reported"
                    )
                )
                assert.strictEqual(
                    messages[0].ruleId,
                    "@eslint-community/eslint-comments/no-unused-disable"
                )
            })

            it("should handle config with linterOptions.reportUnusedDisableDirectives set", () => {
                const linter = new Linter({ configType: "flat" })
                const code = `/*eslint no-undef:off*/
var a = b //eslint-disable-line`

                const messages = linter.verify(code, {
                    linterOptions: {
                        reportUnusedDisableDirectives: "warn",
                    },
                    plugins: {
                        "@eslint-community/eslint-comments": plugin,
                    },
                    rules: {
                        "@eslint-community/eslint-comments/no-unused-disable":
                            "error",
                    },
                })

                // Should get only plugin message (linterOptions should be temporarily disabled then restored)
                assert.strictEqual(messages.length, 1)
                assert(
                    messages[0].message.includes(
                        "ESLint rules are disabled but never reported"
                    )
                )
                assert.strictEqual(
                    messages[0].ruleId,
                    "@eslint-community/eslint-comments/no-unused-disable"
                )
            })

            it("should handle when rule is disabled (severity 0)", () => {
                const linter = new Linter({ configType: "flat" })
                const code = `//eslint-disable-line no-undef
var a = b`

                const messages = linter.verify(code, {
                    plugins: {
                        "@eslint-community/eslint-comments": plugin,
                    },
                    rules: {
                        "@eslint-community/eslint-comments/no-unused-disable":
                            "off",
                        "no-undef": "error",
                    },
                })

                // Should get the no-undef error, but no unused directive warnings
                // since the no-unused-disable rule is off
                assert.strictEqual(messages.length, 1)
                assert.strictEqual(messages[0].ruleId, "no-undef")
            })

            it("should handle comment without specific rule name", () => {
                const linter = new Linter({ configType: "flat" })
                const code = `/*eslint-disable*/
var a = 1`

                const messages = linter.verify(code, {
                    plugins: {
                        "@eslint-community/eslint-comments": plugin,
                    },
                    rules: {
                        "@eslint-community/eslint-comments/no-unused-disable":
                            "error",
                    },
                })

                // Should get message about all ESLint rules being disabled
                assert.strictEqual(messages.length, 1)
                assert.strictEqual(
                    messages[0].message,
                    "ESLint rules are disabled but never reported."
                )
            })

            it("should handle multiline comment", () => {
                const linter = new Linter({ configType: "flat" })
                const code = `/*
eslint-disable
no-undef
*/
var a = 1`

                const messages = linter.verify(code, {
                    plugins: {
                        "@eslint-community/eslint-comments": plugin,
                    },
                    rules: {
                        "@eslint-community/eslint-comments/no-unused-disable":
                            "error",
                    },
                })

                // Should handle multiline comment with newline in suggestion fix
                assert.strictEqual(messages.length, 1)
                assert(
                    messages[0].message.includes(
                        "'no-undef' rule is disabled but never reported"
                    )
                )
                assert.strictEqual(messages[0].suggestions.length, 1)
                assert.strictEqual(messages[0].suggestions[0].fix.text, "\n")
            })
        })
    }

    // Programmatic API tests for ESLint 9+ to test _verifyWithFlatConfigArrayAndWithoutProcessors
    if (semver.satisfies(Linter.version, ">= 9.0.0")) {
        describe("programmatic API with reportUnusedDisableDirectives option", () => {
            const plugin = require("../../../")

            it("should report both native and plugin messages when options.reportUnusedDisableDirectives is set", () => {
                const linter = new Linter()
                const code = `/*eslint no-undef:off*/
var a = b //eslint-disable-line`

                const messages = linter.verify(
                    code,
                    {
                        plugins: {
                            "@eslint-community/eslint-comments": plugin,
                        },
                        rules: {
                            "@eslint-community/eslint-comments/no-unused-disable":
                                "error",
                        },
                    },
                    {
                        reportUnusedDisableDirectives: "error",
                    }
                )

                // Should get both native and plugin messages
                assert.strictEqual(messages.length, 2)
                assert(
                    messages.some((m) =>
                        m.message.includes("Unused eslint-disable directive")
                    )
                )
                assert(
                    messages.some((m) =>
                        m.message.includes(
                            "ESLint rules are disabled but never reported"
                        )
                    )
                )
            })

            it("should report only plugin messages when options.reportUnusedDisableDirectives is not set", () => {
                const linter = new Linter()
                const code = `/*eslint no-undef:off*/
var a = b //eslint-disable-line`

                const messages = linter.verify(code, {
                    plugins: {
                        "@eslint-community/eslint-comments": plugin,
                    },
                    rules: {
                        "@eslint-community/eslint-comments/no-unused-disable":
                            "error",
                    },
                })

                // Should get only plugin message (not native)
                assert.strictEqual(messages.length, 1)
                assert(
                    messages[0].message.includes(
                        "ESLint rules are disabled but never reported"
                    )
                )
                assert.strictEqual(
                    messages[0].ruleId,
                    "@eslint-community/eslint-comments/no-unused-disable"
                )
            })

            it("should handle config with linterOptions.reportUnusedDisableDirectives set", () => {
                const linter = new Linter()
                const code = `/*eslint no-undef:off*/
var a = b //eslint-disable-line`

                const messages = linter.verify(code, {
                    linterOptions: {
                        reportUnusedDisableDirectives: "warn",
                    },
                    plugins: {
                        "@eslint-community/eslint-comments": plugin,
                    },
                    rules: {
                        "@eslint-community/eslint-comments/no-unused-disable":
                            "error",
                    },
                })

                // Should get only plugin message (linterOptions should be temporarily disabled then restored)
                assert.strictEqual(messages.length, 1)
                assert(
                    messages[0].message.includes(
                        "ESLint rules are disabled but never reported"
                    )
                )
                assert.strictEqual(
                    messages[0].ruleId,
                    "@eslint-community/eslint-comments/no-unused-disable"
                )
            })

            it("should handle when rule is disabled (severity 0)", () => {
                const linter = new Linter()
                const code = `//eslint-disable-line no-undef
var a = b`

                const messages = linter.verify(code, {
                    plugins: {
                        "@eslint-community/eslint-comments": plugin,
                    },
                    rules: {
                        "@eslint-community/eslint-comments/no-unused-disable":
                            "off",
                        "no-undef": "error",
                    },
                })

                // Should get the no-undef error, but no unused directive warnings
                // since the no-unused-disable rule is off
                assert.strictEqual(messages.length, 1)
                assert.strictEqual(messages[0].ruleId, "no-undef")
            })

            it("should handle comment without specific rule name", () => {
                const linter = new Linter()
                const code = `/*eslint-disable*/
var a = 1`

                const messages = linter.verify(code, {
                    plugins: {
                        "@eslint-community/eslint-comments": plugin,
                    },
                    rules: {
                        "@eslint-community/eslint-comments/no-unused-disable":
                            "error",
                    },
                })

                // Should get message about all ESLint rules being disabled
                assert.strictEqual(messages.length, 1)
                assert.strictEqual(
                    messages[0].message,
                    "ESLint rules are disabled but never reported."
                )
            })

            it("should handle filenameOrOptions as string", () => {
                const linter = new Linter()
                const code = `//eslint-disable-line no-undef
var a = b`

                const messages = linter.verify(
                    code,
                    {
                        plugins: {
                            "@eslint-community/eslint-comments": plugin,
                        },
                        rules: {
                            "@eslint-community/eslint-comments/no-unused-disable":
                                "error",
                        },
                    },
                    "test.js"
                ) // Pass filename as string

                // Should process unused directives with string filename
                assert.strictEqual(messages.length, 1)
                assert(
                    messages[0].message.includes(
                        "ESLint rules are disabled but never reported"
                    )
                )
            })

            it("should handle filenameOrOptions as undefined", () => {
                const linter = new Linter()
                const code = `//eslint-disable-line no-undef
var a = b`

                const messages = linter.verify(
                    code,
                    {
                        plugins: {
                            "@eslint-community/eslint-comments": plugin,
                        },
                        rules: {
                            "@eslint-community/eslint-comments/no-unused-disable":
                                "error",
                        },
                    },
                    undefined
                ) // Pass undefined

                // Should process unused directives with undefined options
                assert.strictEqual(messages.length, 1)
                assert(
                    messages[0].message.includes(
                        "ESLint rules are disabled but never reported"
                    )
                )
            })
        })
    }
})
