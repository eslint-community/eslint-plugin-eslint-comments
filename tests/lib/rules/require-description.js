/**
 * @author Yosuke Ota <https://github.com/ota-meshi>
 * See LICENSE file in root directory for full license.
 */
"use strict"

const semver = require("semver")
const { Linter, RuleTester } = require("eslint")
const rule = require("../../../lib/rules/require-description")
const tester = new RuleTester()

if (!semver.satisfies(Linter.version, ">=7.0.0")) {
    // This rule can only be used with ESLint v7.x or later.
    return
}

// Sibling rules used below to check that the per-source directive-comment
// cache (shared between all rules linting a file) is not corrupted when
// rules pass different `additionalDirectives`.
const noUnlimitedDisableRule = require("../../../lib/rules/no-unlimited-disable")
const noUseRule = require("../../../lib/rules/no-use")
const flatRuleTester = semver.satisfies(Linter.version, ">=9.0.0")
if (!flatRuleTester) {
    tester.defineRule(
        "eslint-comments/no-unlimited-disable",
        noUnlimitedDisableRule
    )
    tester.defineRule("eslint-comments/no-use", noUseRule)
}
// On the flat RuleTester the sibling rules are supplied per test case instead.
const siblingPlugins = flatRuleTester
    ? {
          plugins: {
              "eslint-comments": {
                  rules: {
                      "no-unlimited-disable": noUnlimitedDisableRule,
                      "no-use": noUseRule,
                  },
              },
          },
      }
    : {}

tester.run("require-description", rule, {
    valid: [
        '/* eslint eqeqeq: "off", curly: "error" -- Here\'s a description about why this configuration is necessary. */',
        "/* eslint-disable -- description */",
        "/* eslint-enable -- description */",
        "/* exported -- description */",
        "/* global -- description */",
        "/* globals -- description */",
        ...(semver.satisfies(Linter.version, "<=9.0.0")
            ? // eslint-env rule was removed in ESLint v10
              ["/* eslint-env -- description */"]
            : []),
        "/* just eslint in a normal comment */",
        "/* c8 without options */",
        "// eslint-disable-line -- description",
        "// eslint-disable-next-line -- description",
        "/* eslint-disable-line -- description */",
        "/* eslint-disable-next-line -- description */",
        "// eslint-disable-line eqeqeq -- description",
        "// eslint-disable-next-line eqeqeq -- description",
        {
            code: "/* eslint */",
            options: [{ ignore: ["eslint"] }],
        },
        ...(semver.satisfies(Linter.version, "<=9.0.0")
            ? // eslint-env rule was removed in ESLint v10
              [
                  {
                      code: "/* eslint-env */",
                      options: [{ ignore: ["eslint-env"] }],
                  },
              ]
            : []),
        {
            code: "/* eslint-enable */",
            options: [{ ignore: ["eslint-enable"] }],
        },
        {
            code: "/* eslint-disable */",
            options: [{ ignore: ["eslint-disable"] }],
        },
        {
            code: "// eslint-disable-line",
            options: [{ ignore: ["eslint-disable-line"] }],
        },
        {
            code: "// eslint-disable-next-line",
            options: [{ ignore: ["eslint-disable-next-line"] }],
        },
        {
            code: "/* eslint-disable-line */",
            options: [{ ignore: ["eslint-disable-line"] }],
        },
        {
            code: "/* eslint-disable-next-line */",
            options: [{ ignore: ["eslint-disable-next-line"] }],
        },
        {
            code: "/* exported */",
            options: [{ ignore: ["exported"] }],
        },
        {
            code: "/* global */",
            options: [{ ignore: ["global"] }],
        },
        {
            code: "/* globals */",
            options: [{ ignore: ["globals"] }],
        },
        {
            code: "/* c8 ignore next -- description */",
            options: [{ additionalDirectives: ["c8"] }],
        },
        // A sibling rule that reads directive comments with its own
        // `additionalDirectives` must not leak them into this rule (which
        // opted into none) through the shared directive-comment cache. Here
        // `no-use` treats `c8` as a directive (but allows it, so it stays
        // silent); `require-description` still must not flag it.
        ...(semver.satisfies(Linter.version, ">=8.0.0")
            ? [
                  {
                      code: "/* c8 ignore next */",
                      ...siblingPlugins,
                      rules: {
                          "eslint-comments/no-use": [
                              "error",
                              {
                                  additionalDirectives: ["c8"],
                                  allow: ["c8"],
                              },
                          ],
                      },
                  },
                  // Two rules that pass the same `additionalDirectives` share
                  // one cache entry: the second call is served from the cache.
                  {
                      code: "/* c8 ignore next -- description */",
                      options: [{ additionalDirectives: ["c8"] }],
                      ...siblingPlugins,
                      rules: {
                          "eslint-comments/no-use": [
                              "error",
                              {
                                  additionalDirectives: ["c8"],
                                  allow: ["c8"],
                              },
                          ],
                      },
                  },
              ]
            : []),
        // Language plugin
        ...(semver.satisfies(Linter.version, ">=9.6.0")
            ? [
                  {
                      code: "/* eslint-disable */ a {}",
                      options: [{ ignore: ["eslint-disable"] }],
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
            code: "/* eslint */",
            errors: [
                "Unexpected undescribed directive comment. Include descriptions to explain why the comment is necessary.",
            ],
        },
        {
            code: '/* eslint eqeqeq: "off", curly: "error" */',
            errors: [
                "Unexpected undescribed directive comment. Include descriptions to explain why the comment is necessary.",
            ],
        },
        ...(semver.satisfies(Linter.version, "<=9.0.0")
            ? // eslint-env rule was removed in ESLint v10
              [
                  {
                      code: "/* eslint-env */",
                      errors: [
                          "Unexpected undescribed directive comment. Include descriptions to explain why the comment is necessary.",
                      ],
                  },
                  {
                      code: "/* eslint-env node */",
                      errors: [
                          "Unexpected undescribed directive comment. Include descriptions to explain why the comment is necessary.",
                      ],
                  },
              ]
            : []),
        {
            code: "/* eslint-enable */",
            errors: [
                "Unexpected undescribed directive comment. Include descriptions to explain why the comment is necessary.",
            ],
        },
        {
            code: "/* eslint-enable eqeqeq */",
            errors: [
                "Unexpected undescribed directive comment. Include descriptions to explain why the comment is necessary.",
            ],
        },
        {
            code: "/* eslint-disable */",
            errors: [
                "Unexpected undescribed directive comment. Include descriptions to explain why the comment is necessary.",
            ],
        },
        {
            code: "/* eslint-disable eqeqeq */",
            errors: [
                "Unexpected undescribed directive comment. Include descriptions to explain why the comment is necessary.",
            ],
        },
        {
            code: "// eslint-disable-line",
            errors: [
                "Unexpected undescribed directive comment. Include descriptions to explain why the comment is necessary.",
            ],
        },
        {
            code: "// eslint-disable-line eqeqeq",
            errors: [
                "Unexpected undescribed directive comment. Include descriptions to explain why the comment is necessary.",
            ],
        },
        {
            code: "// eslint-disable-next-line",
            errors: [
                "Unexpected undescribed directive comment. Include descriptions to explain why the comment is necessary.",
            ],
        },
        {
            code: "// eslint-disable-next-line eqeqeq",
            errors: [
                "Unexpected undescribed directive comment. Include descriptions to explain why the comment is necessary.",
            ],
        },
        {
            code: "/* eslint-disable-line */",
            errors: [
                "Unexpected undescribed directive comment. Include descriptions to explain why the comment is necessary.",
            ],
        },
        {
            code: "/* eslint-disable-line eqeqeq */",
            errors: [
                "Unexpected undescribed directive comment. Include descriptions to explain why the comment is necessary.",
            ],
        },
        {
            code: "/* eslint-disable-next-line */",
            errors: [
                "Unexpected undescribed directive comment. Include descriptions to explain why the comment is necessary.",
            ],
        },
        {
            code: "/* eslint-disable-next-line eqeqeq */",
            errors: [
                "Unexpected undescribed directive comment. Include descriptions to explain why the comment is necessary.",
            ],
        },
        {
            code: "/* exported */",
            errors: [
                "Unexpected undescribed directive comment. Include descriptions to explain why the comment is necessary.",
            ],
        },
        {
            code: "/* global */",
            errors: [
                "Unexpected undescribed directive comment. Include descriptions to explain why the comment is necessary.",
            ],
        },
        {
            code: "/* global _ */",
            errors: [
                "Unexpected undescribed directive comment. Include descriptions to explain why the comment is necessary.",
            ],
        },
        {
            code: "/* globals */",
            errors: [
                "Unexpected undescribed directive comment. Include descriptions to explain why the comment is necessary.",
            ],
        },
        {
            code: "/* globals _ */",
            errors: [
                "Unexpected undescribed directive comment. Include descriptions to explain why the comment is necessary.",
            ],
        },
        // empty description
        {
            code: "/* eslint-disable-next-line eqeqeq -- */",
            errors: [
                "Unexpected undescribed directive comment. Include descriptions to explain why the comment is necessary.",
            ],
        },
        {
            code: "/* c8 ignore next */",
            options: [{ additionalDirectives: ["c8"] }],
            errors: [
                "Unexpected undescribed directive comment. Include descriptions to explain why the comment is necessary.",
            ],
        },
        // A sibling rule that reads directive comments without
        // `additionalDirectives` (here `no-unlimited-disable`) runs first and
        // must not hide this rule's custom `c8` directive via the shared
        // directive-comment cache.
        ...(semver.satisfies(Linter.version, ">=8.0.0")
            ? [
                  {
                      code: "/* c8 ignore next */",
                      options: [{ additionalDirectives: ["c8"] }],
                      ...siblingPlugins,
                      rules: {
                          "eslint-comments/no-unlimited-disable": "error",
                      },
                      errors: [
                          "Unexpected undescribed directive comment. Include descriptions to explain why the comment is necessary.",
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
                          "Unexpected undescribed directive comment. Include descriptions to explain why the comment is necessary.",
                      ],
                  },
              ]
            : []),
    ],
})
