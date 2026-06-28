/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * See LICENSE file in root directory for full license.
 */
"use strict"

const semver = require("semver")
const { Linter, RuleTester } = require("eslint")
const rule = require("../../../lib/rules/no-aggregating-enable")
const tester = new RuleTester()

tester.run("no-aggregating-enable", rule, {
    valid: [
        `
            /*eslint-disable no-redeclare*/
            /*eslint-enable no-redeclare*/
        `,
        `
            /*eslint-disable no-redeclare*/
            /*eslint-enable no-shadow*/
        `,
        `
            /*eslint-disable no-redeclare, no-shadow*/
            /*eslint-enable*/
        `,
        `
            /*eslint-disable no-redeclare, no-shadow*/
            /*eslint-enable no-redeclare, no-shadow*/
        `,
        `
            /*eslint-disable no-redeclare, no-shadow*/
            /*eslint-enable no-redeclare*/
            /*eslint-enable no-shadow*/
        `,
        // Language plugin
        ...(semver.satisfies(Linter.version, ">=9.6.0")
            ? [
                  {
                      code: `
            /*eslint-disable no-redeclare, no-shadow*/
            /*eslint-enable no-redeclare*/
            /*eslint-enable no-shadow*/
            a {}`,
                      plugins: {
                          css: require("@eslint/css").default,
                      },
                      language: "css/css",
                  },
              ]
            : []),
        // oxlint directives
        `
            /*oxlint-disable no-redeclare*/
            /*oxlint-enable no-redeclare*/
        `,
        `
            /*oxlint-disable no-redeclare, no-shadow*/
            /*oxlint-enable no-redeclare*/
            /*oxlint-enable no-shadow*/
        `,
    ],
    invalid: [
        {
            code: `
                /*eslint-disable no-redeclare*/
                /*eslint-disable no-shadow*/
                /*eslint-enable*/
            `,
            errors: [
                "This `eslint-enable` comment affects 2 `eslint-disable` comments. An `eslint-enable` comment should be for an `eslint-disable` comment.",
            ],
        },
        {
            code: `
                /*eslint-disable no-redeclare*/
                /*eslint-disable no-shadow*/
                /*eslint-disable no-undef*/
                /*eslint-enable*/
            `,
            errors: [
                "This `eslint-enable` comment affects 3 `eslint-disable` comments. An `eslint-enable` comment should be for an `eslint-disable` comment.",
            ],
        },
        {
            code: `
                /*eslint-disable no-redeclare*/
                /*eslint-disable no-shadow*/
                /*eslint-enable no-redeclare, no-shadow*/
            `,
            errors: [
                "This `eslint-enable` comment affects 2 `eslint-disable` comments. An `eslint-enable` comment should be for an `eslint-disable` comment.",
            ],
        },
        // -- description
        ...(semver.satisfies(Linter.version, ">=7.0.0")
            ? [
                  {
                      code: `
                /*eslint-disable no-redeclare*/
                /*eslint-disable no-shadow*/
                /*eslint-enable -- description*/
            `,
                      errors: [
                          "This `eslint-enable` comment affects 2 `eslint-disable` comments. An `eslint-enable` comment should be for an `eslint-disable` comment.",
                      ],
                  },
              ]
            : []),
        // Language plugin
        ...(semver.satisfies(Linter.version, ">=9.6.0")
            ? [
                  {
                      code: `
                /*eslint-disable no-redeclare*/
                /*eslint-disable no-shadow*/
                /*eslint-enable*/
            a {}`,
                      plugins: {
                          css: require("@eslint/css").default,
                      },
                      language: "css/css",
                      errors: [
                          "This `eslint-enable` comment affects 2 `eslint-disable` comments. An `eslint-enable` comment should be for an `eslint-disable` comment.",
                      ],
                  },
              ]
            : []),
        // oxlint directives
        {
            code: `
                /*oxlint-disable no-redeclare*/
                /*oxlint-disable no-shadow*/
                /*oxlint-enable*/
            `,
            errors: [
                "This `eslint-enable` comment affects 2 `eslint-disable` comments. An `eslint-enable` comment should be for an `eslint-disable` comment.",
            ],
        },
        {
            code: `
                /*oxlint-disable no-redeclare*/
                /*oxlint-disable no-shadow*/
                /*oxlint-enable no-redeclare, no-shadow*/
            `,
            errors: [
                "This `eslint-enable` comment affects 2 `eslint-disable` comments. An `eslint-enable` comment should be for an `eslint-disable` comment.",
            ],
        },
    ],
})
