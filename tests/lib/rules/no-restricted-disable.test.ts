/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * See LICENSE file in root directory for full license.
 */
import cssPlugin from "@eslint/css"
import { Linter, RuleTester } from "eslint"
import * as semver from "semver"
import rule from "../../../lib/rules/no-restricted-disable.ts"

const coreRules = new Linter({ configType: "eslintrc" }).getRules()
let tester = null

// @ts-expect-error
if (typeof RuleTester.prototype.defineRule === "function") {
    // ESLint < 9
    tester = new RuleTester()
    // @ts-expect-error
    tester.defineRule("foo/no-undef", coreRules.get("no-undef"))
    // @ts-expect-error
    tester.defineRule("foo/no-redeclare", coreRules.get("no-redeclare"))
} else {
    // ESLint 9
    tester = new RuleTester({
        plugins: {
            foo: {
                rules: {
                    "no-undef": coreRules.get("no-undef")!,
                    "no-redeclare": coreRules.get("no-redeclare")!,
                },
            },
        },
    })
}

tester.run("no-restricted-disable", rule, {
    valid: [
        "/*eslint-disable*/",
        "//eslint-disable-line",
        "//eslint-disable-next-line",
        "/*eslint-disable-line*/",
        "/*eslint-disable-next-line*/",
        {
            code: "/*eslint-disable eqeqeq*/",
            options: ["no-unused-vars"],
        },
        {
            code: "/*eslint-enable eqeqeq*/",
            options: ["eqeqeq"],
        },
        {
            code: "/*eslint-disable eqeqeq*/",
            options: ["*", "!eqeqeq"],
        },
        // Language plugin
        ...(semver.satisfies(Linter.version, ">=9.6.0")
            ? [
                  {
                      code: "/*eslint-disable eqeqeq*/ a {}",
                      options: ["*", "!eqeqeq"],
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
            code: "/*eslint-disable eqeqeq*/",
            options: ["eqeqeq"],
            errors: ["Disabling 'eqeqeq' is not allowed."],
        },
        {
            code: "/*eslint-disable*/",
            options: ["eqeqeq"],
            errors: ["Disabling 'eqeqeq' is not allowed."],
        },
        {
            code: "//eslint-disable-line eqeqeq",
            options: ["eqeqeq"],
            errors: ["Disabling 'eqeqeq' is not allowed."],
        },
        {
            code: "/*eslint-disable-line eqeqeq*/",
            options: ["eqeqeq"],
            errors: ["Disabling 'eqeqeq' is not allowed."],
        },
        {
            code: "//eslint-disable-line",
            options: ["eqeqeq"],
            errors: ["Disabling 'eqeqeq' is not allowed."],
        },
        {
            code: "/*eslint-disable-line*/",
            options: ["eqeqeq"],
            errors: ["Disabling 'eqeqeq' is not allowed."],
        },
        {
            code: "//eslint-disable-next-line eqeqeq",
            options: ["eqeqeq"],
            errors: ["Disabling 'eqeqeq' is not allowed."],
        },
        {
            code: "/*eslint-disable-next-line eqeqeq*/",
            options: ["eqeqeq"],
            errors: ["Disabling 'eqeqeq' is not allowed."],
        },
        {
            code: "//eslint-disable-next-line",
            options: ["eqeqeq"],
            errors: ["Disabling 'eqeqeq' is not allowed."],
        },
        {
            code: "/*eslint-disable-next-line*/",
            options: ["eqeqeq"],
            errors: ["Disabling 'eqeqeq' is not allowed."],
        },

        {
            code: "/*eslint-disable eqeqeq, no-undef, no-redeclare*/",
            options: ["*", "!no-undef", "!no-redeclare"],
            errors: ["Disabling 'eqeqeq' is not allowed."],
        },
        {
            code: "/*eslint-disable*/",
            options: ["*", "!no-undef", "!no-redeclare"],
            errors: ["Disabling '*,!no-undef,!no-redeclare' is not allowed."],
        },
        {
            code: "//eslint-disable-line eqeqeq, no-undef, no-redeclare",
            options: ["*", "!no-undef", "!no-redeclare"],
            errors: ["Disabling 'eqeqeq' is not allowed."],
        },
        {
            code: "/*eslint-disable-line eqeqeq, no-undef, no-redeclare*/",
            options: ["*", "!no-undef", "!no-redeclare"],
            errors: ["Disabling 'eqeqeq' is not allowed."],
        },
        {
            code: "//eslint-disable-line",
            options: ["*", "!no-undef", "!no-redeclare"],
            errors: ["Disabling '*,!no-undef,!no-redeclare' is not allowed."],
        },
        {
            code: "/*eslint-disable-line*/",
            options: ["*", "!no-undef", "!no-redeclare"],
            errors: ["Disabling '*,!no-undef,!no-redeclare' is not allowed."],
        },
        {
            code: "//eslint-disable-next-line eqeqeq, no-undef, no-redeclare",
            options: ["*", "!no-undef", "!no-redeclare"],
            errors: ["Disabling 'eqeqeq' is not allowed."],
        },
        {
            code: "/*eslint-disable-next-line eqeqeq, no-undef, no-redeclare*/",
            options: ["*", "!no-undef", "!no-redeclare"],
            errors: ["Disabling 'eqeqeq' is not allowed."],
        },
        {
            code: "//eslint-disable-next-line",
            options: ["*", "!no-undef", "!no-redeclare"],
            errors: ["Disabling '*,!no-undef,!no-redeclare' is not allowed."],
        },
        {
            code: "/*eslint-disable-next-line*/",
            options: ["*", "!no-undef", "!no-redeclare"],
            errors: ["Disabling '*,!no-undef,!no-redeclare' is not allowed."],
        },

        {
            code: "/*eslint-disable semi, no-extra-semi, semi-style, comma-style*/",
            options: ["*semi*"],
            errors: [
                "Disabling 'semi' is not allowed.",
                "Disabling 'no-extra-semi' is not allowed.",
                "Disabling 'semi-style' is not allowed.",
            ],
        },
        {
            code: "/*eslint-disable no-undef, no-redeclare, foo/no-undef, foo/no-redeclare*/",
            options: ["foo/*"],
            errors: [
                "Disabling 'foo/no-undef' is not allowed.",
                "Disabling 'foo/no-redeclare' is not allowed.",
            ],
        },
        // -- description
        {
            code: "/*eslint-disable -- description*/",
            options: ["eqeqeq"],
            errors: ["Disabling 'eqeqeq' is not allowed."],
        },
        // Language plugin
        ...(semver.satisfies(Linter.version, ">=9.6.0")
            ? [
                  {
                      code: "/*eslint-disable eqeqeq*/ a {}",
                      options: ["eqeqeq"],
                      plugins: {
                          css: cssPlugin,
                      },
                      language: "css/css",
                      errors: ["Disabling 'eqeqeq' is not allowed."],
                  } as any,
              ]
            : []),
    ],
})
