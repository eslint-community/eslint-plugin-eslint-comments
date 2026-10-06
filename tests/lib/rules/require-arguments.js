/**
 * @author Brett Zamir <https://github.com/brettz9>
 * See LICENSE file in root directory for full license.
 */
"use strict"

const semver = require("semver")
const { Linter, RuleTester } = require("eslint")
const rule = require("../../../lib/rules/require-arguments")
const tester = new RuleTester()

const { missingArgument } = rule.meta.messages

tester.run("require-arguments", rule, {
    valid: [
        "// eslint foo",
        "// eslint-disable",
        "// eslint-enable",
        "// exported",
        "// global",
        "// globals",
        ...(semver.satisfies(Linter.version, "<=9.0.0")
            ? // eslint-env rule was removed in ESLint v10
              ["// eslint-env"]
            : []),
        "/* just eslint in a normal comment */",
        {
            code: "/* eslint */",
            options: [{ directives: { eslint: "^$" } }],
        },
        {
            code: '/* eslint eqeqeq: "off" */',
            options: [{ directives: { eslint: 'eqeqeq: "off"' } }],
        },
        ...(semver.satisfies(Linter.version, "<=9.0.0")
            ? // eslint-env rule was removed in ESLint v10
              [
                  {
                      code: "/* eslint-env */",
                      options: [{ directives: { "eslint-env": "^$" } }],
                  },
              ]
            : []),
        {
            code: "/* eslint-enable */",
            options: [{ directives: { "eslint-enable": "^$" } }],
        },
        {
            code: "/* eslint-enable no-undef */",
            options: [{ directives: { "eslint-enable": "no-undef" } }],
        },
        {
            code: "/* eslint-disable */",
            options: [{ directives: { "eslint-disable": "^$" } }],
        },
        {
            code: "/* eslint-disable no-undef */",
            options: [{ directives: { "eslint-disable": "no-undef" } }],
        },
        {
            code: "// eslint-disable-line",
            options: [{ directives: { "eslint-disable-line": "^$" } }],
        },
        {
            code: "// eslint-disable-line no-undef",
            options: [{ directives: { "eslint-disable-line": "no-undef" } }],
        },
        {
            code: "// eslint-disable-next-line",
            options: [{ directives: { "eslint-disable-next-line": "^$" } }],
        },
        {
            code: "// eslint-disable-next-line no-undef",
            options: [
                { directives: { "eslint-disable-next-line": "no-undef" } },
            ],
        },
        {
            code: "/* eslint-disable-line */",
            options: [{ directives: { "eslint-disable-line": "^$" } }],
        },
        {
            code: "/* eslint-disable-line no-undef */",
            options: [{ directives: { "eslint-disable-line": "no-undef" } }],
        },
        {
            code: "/* eslint-disable-next-line */",
            options: [{ directives: { "eslint-disable-next-line": "^$" } }],
        },
        {
            code: "/* eslint-disable-next-line no-undef */",
            options: [
                { directives: { "eslint-disable-next-line": "no-undef" } },
            ],
        },
        {
            code: "/* exported */",
            options: [{ directives: { exported: "^$" } }],
        },
        {
            code: "/* exported Abc */",
            options: [{ directives: { exported: "Abc" } }],
        },
        {
            code: "/* global */",
            options: [{ directives: { global: "^$" } }],
        },
        {
            code: "/* global Sth */",
            options: [{ directives: { global: "Sth" } }],
        },
        {
            code: "/* globals */",
            options: [{ directives: { globals: "^$" } }],
        },
        {
            code: "/* globals Sth */",
            options: [{ directives: { globals: "Sth" } }],
        },
        {
            code: "/* c8 ignore next */",
            options: [
                {
                    directives: { c8: "ignore (if|else|next)" },
                },
            ],
        },
        {
            code: "/* c8 ignore next */",
            options: [
                {
                    directives: { globals: "^$", c8: "ignore (if|else|next)" },
                },
            ],
        },
        {
            code: "/* c8 ignore next */",
            options: [
                {
                    directives: { sth: "sthelse" },
                },
            ],
        },
        {
            code: "/* c8 ignore next */",
            options: [
                {
                    directives: { globals: "sth" },
                },
            ],
        },
        // Language plugin
        ...(semver.satisfies(Linter.version, ">=9.6.0")
            ? [
                  {
                      code: "/* eslint-disable */ a {}",
                      options: [{ directives: { "eslint-disable": "^$" } }],
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
            errors: [missingArgument],
            options: [
                {
                    directives: {
                        eslint: 'eqeqeq: "off"',
                    },
                },
            ],
        },
        {
            code: '/* eslint curly: "error" */',
            errors: [missingArgument],
            options: [
                {
                    directives: {
                        eslint: 'eqeqeq: "off"',
                    },
                },
            ],
        },
        ...(semver.satisfies(Linter.version, "<=9.0.0")
            ? // eslint-env rule was removed in ESLint v10
              [
                  {
                      code: "/* eslint-env */",
                      errors: [missingArgument],
                      options: [
                          {
                              directives: {
                                  "eslint-env": "browser",
                              },
                          },
                      ],
                  },
                  {
                      code: "/* eslint-env node */",
                      errors: [missingArgument],
                      options: [
                          {
                              directives: {
                                  "eslint-env": "browser",
                              },
                          },
                      ],
                  },
              ]
            : []),
        {
            code: "/* eslint-enable */",
            errors: [missingArgument],
            options: [
                {
                    directives: {
                        "eslint-enable": "no-unused-vars",
                    },
                },
            ],
        },
        {
            code: "/* eslint-enable no-undef */",
            errors: [missingArgument],
            options: [
                {
                    directives: {
                        "eslint-enable": "no-unused-vars",
                    },
                },
            ],
        },
        {
            code: "/* eslint-disable */",
            errors: [missingArgument],
            options: [
                {
                    directives: {
                        "eslint-disable": "no-unused-vars",
                    },
                },
            ],
        },
        {
            code: "/* eslint-disable no-undef */",
            errors: [missingArgument],
            options: [
                {
                    directives: {
                        "eslint-disable": "no-unused-vars",
                    },
                },
            ],
        },
        {
            code: "// eslint-disable-line",
            errors: [missingArgument],
            options: [
                {
                    directives: {
                        "eslint-disable-line": "no-unused-vars",
                    },
                },
            ],
        },
        {
            code: "// eslint-disable-line no-undef",
            errors: [missingArgument],
            options: [
                {
                    directives: {
                        "eslint-disable-line": "no-unused-vars",
                    },
                },
            ],
        },
        {
            code: "// eslint-disable-next-line",
            errors: [missingArgument],
            options: [
                {
                    directives: {
                        "eslint-disable-next-line": "no-unused-vars",
                    },
                },
            ],
        },
        {
            code: "// eslint-disable-next-line no-undef",
            errors: [missingArgument],
            options: [
                {
                    directives: {
                        "eslint-disable-next-line": "no-unused-vars",
                    },
                },
            ],
        },
        {
            code: "/* eslint-disable-line */",
            errors: [missingArgument],
            options: [
                {
                    directives: {
                        "eslint-disable-line": "no-unused-vars",
                    },
                },
            ],
        },
        {
            code: "/* eslint-disable-line no-undef */",
            errors: [missingArgument],
            options: [
                {
                    directives: {
                        "eslint-disable-line": "no-unused-vars",
                    },
                },
            ],
        },
        {
            code: "/* eslint-disable-next-line */",
            errors: [missingArgument],
            options: [
                {
                    directives: {
                        "eslint-disable-next-line": "no-unused-vars",
                    },
                },
            ],
        },
        {
            code: "/* eslint-disable-next-line no-undef */",
            errors: [missingArgument],
            options: [
                {
                    directives: {
                        "eslint-disable-next-line": "no-unused-vars",
                    },
                },
            ],
        },
        {
            code: "/* exported */",
            errors: [missingArgument],
            options: [
                {
                    directives: {
                        exported: "Sth",
                    },
                },
            ],
        },
        {
            code: "/* exported Sthelse */",
            errors: [missingArgument],
            options: [
                {
                    directives: {
                        exported: "^Sth$",
                    },
                },
            ],
        },
        {
            code: "/* global */",
            errors: [missingArgument],
            options: [
                {
                    directives: {
                        global: "Sth",
                    },
                },
            ],
        },
        {
            code: "/* global Sthelse */",
            errors: [missingArgument],
            options: [
                {
                    directives: {
                        global: "^Sth$",
                    },
                },
            ],
        },
        {
            code: "/* globals */",
            errors: [missingArgument],
            options: [
                {
                    directives: {
                        globals: "Sth",
                    },
                },
            ],
        },
        {
            code: "/* globals Sthelse */",
            errors: [missingArgument],
            options: [
                {
                    directives: {
                        globals: "^Sth$",
                    },
                },
            ],
        },
        {
            code: "/* c8 ignore nxt */",
            options: [
                {
                    directives: {
                        c8: "ignore (if|else|next)",
                    },
                },
            ],
            errors: [missingArgument],
        },
        {
            code: "/* c8 ignor next */",
            options: [
                {
                    directives: {
                        globals: "^$",
                        c8: "ignore (if|else|next)",
                    },
                },
            ],
            errors: [missingArgument],
        },
        {
            code: "/* sthelse sth */",
            options: [
                {
                    directives: {
                        globals: "^$",
                        sthelse: "^$",
                    },
                },
            ],
            errors: [missingArgument],
        },
        // Language plugin
        ...(semver.satisfies(Linter.version, ">=9.6.0")
            ? [
                  {
                      code: "/* eslint-disable */ a {}",
                      options: [
                          { directives: { "eslint-disable": "no-undef" } },
                      ],
                      plugins: {
                          css: require("@eslint/css").default,
                      },
                      language: "css/css",
                      errors: [missingArgument],
                  },
                  {
                      code: "/* eslint-disable no-unused-vars */ a {}",
                      options: [
                          { directives: { "eslint-disable": "no-undef" } },
                      ],
                      plugins: {
                          css: require("@eslint/css").default,
                      },
                      language: "css/css",
                      errors: [missingArgument],
                  },
                  {
                      code: "/* c8 ignore next */ a {}",
                      plugins: {
                          css: require("@eslint/css").default,
                      },
                      options: [
                          {
                              directives: {
                                  c8: "ignore else",
                              },
                          },
                      ],
                      language: "css/css",
                      errors: [missingArgument],
                  },
                  {
                      code: "/* c8 */ a {}",
                      plugins: {
                          css: require("@eslint/css").default,
                      },
                      options: [
                          {
                              directives: {
                                  c8: "ignore next",
                              },
                          },
                      ],
                      language: "css/css",
                      errors: [missingArgument],
                  },
              ]
            : []),
    ],
})
