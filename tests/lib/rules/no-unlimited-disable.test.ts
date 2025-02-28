/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * See LICENSE file in root directory for full license.
 */
"use strict"

const semver = require("semver")
const { Linter, RuleTester } = require("eslint")
const rule = require("../../../lib/rules/no-unlimited-disable")
const tester = new RuleTester()

tester.run("no-unlimited-disable", rule, {
    valid: [
        "/*eslint-enable*/",
        "/*eslint-disable eqeqeq*/",
        "//eslint-disable-line eqeqeq",
        "//eslint-disable-next-line eqeqeq",
        "/*eslint-disable-line eqeqeq*/",
        "/*eslint-disable-next-line eqeqeq*/",
        "var foo;\n//eslint-disable-line eqeqeq",
        "var foo;\n/*eslint-disable-line eqeqeq*/",
        // Language plugin
        ...(semver.satisfies(Linter.version, ">=9.6.0")
            ? [
                  {
                      code: "/*eslint-disable-line eqeqeq*/ a {}",
                      plugins: {
                          css: require("@eslint/css").default,
                      },
                      language: "css/css",
                  },
              ]
            : []),
    ],
    invalid: [
        {
            code: "/*eslint-disable */",
            errors: [
                "Unexpected unlimited 'eslint-disable' comment. Specify some rule names to disable.",
            ],
        },
        {
            code: "/* eslint-disable */",
            errors: [
                "Unexpected unlimited 'eslint-disable' comment. Specify some rule names to disable.",
            ],
        },
        {
            code: "//eslint-disable-line",
            errors: [
                "Unexpected unlimited 'eslint-disable-line' comment. Specify some rule names to disable.",
            ],
        },
        {
            code: "/*eslint-disable-line*/",
            errors: [
                "Unexpected unlimited 'eslint-disable-line' comment. Specify some rule names to disable.",
            ],
        },
        {
            code: "// eslint-disable-line ",
            errors: [
                "Unexpected unlimited 'eslint-disable-line' comment. Specify some rule names to disable.",
            ],
        },
        {
            code: "/* eslint-disable-line */",
            errors: [
                "Unexpected unlimited 'eslint-disable-line' comment. Specify some rule names to disable.",
            ],
        },
        {
            code: "//eslint-disable-next-line",
            errors: [
                "Unexpected unlimited 'eslint-disable-next-line' comment. Specify some rule names to disable.",
            ],
        },
        {
            code: "/*eslint-disable-next-line*/",
            errors: [
                "Unexpected unlimited 'eslint-disable-next-line' comment. Specify some rule names to disable.",
            ],
        },
        {
            code: "// eslint-disable-next-line ",
            errors: [
                "Unexpected unlimited 'eslint-disable-next-line' comment. Specify some rule names to disable.",
            ],
        },
        {
            code: "/* eslint-disable-next-line */",
            errors: [
                "Unexpected unlimited 'eslint-disable-next-line' comment. Specify some rule names to disable.",
            ],
        },
        {
            code: "var foo;\n//eslint-disable-line",
            errors: [
                "Unexpected unlimited 'eslint-disable-line' comment. Specify some rule names to disable.",
            ],
        },
        {
            code: "var foo;\n/*eslint-disable-line*/",
            errors: [
                "Unexpected unlimited 'eslint-disable-line' comment. Specify some rule names to disable.",
            ],
        },
        // -- description
        ...(semver.satisfies(Linter.version, ">=7.0.0")
            ? [
                  {
                      code: "/*eslint-disable -- description */",
                      errors: [
                          "Unexpected unlimited 'eslint-disable' comment. Specify some rule names to disable.",
                      ],
                  },
              ]
            : []),
        // Language plugin
        ...(semver.satisfies(Linter.version, ">=9.6.0")
            ? [
                  {
                      code: "/* eslint-disable */ a {}",
                      plugins: {
                          css: require("@eslint/css").default,
                      },
                      language: "css/css",
                      errors: [
                          "Unexpected unlimited 'eslint-disable' comment. Specify some rule names to disable.",
                      ],
                  },
              ]
            : []),
    ],
})
