/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * See LICENSE file in root directory for full license.
 */
import cssPlugin from "@eslint/css"
import { Linter, RuleTester } from "eslint"
import * as semver from "semver"
import rule from "../../../lib/rules/no-unlimited-disable.ts"

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
                          css: cssPlugin,
                      },
                      language: "css/css",
                  } as any,
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
        {
            code: "/*eslint-disable -- description */",
            errors: [
                "Unexpected unlimited 'eslint-disable' comment. Specify some rule names to disable.",
            ],
        },
        // Language plugin
        ...(semver.satisfies(Linter.version, ">=9.6.0")
            ? [
                  {
                      code: "/* eslint-disable */ a {}",
                      plugins: {
                          css: cssPlugin,
                      },
                      language: "css/css",
                      errors: [
                          "Unexpected unlimited 'eslint-disable' comment. Specify some rule names to disable.",
                      ],
                  } as any,
              ]
            : []),
    ],
})
