# @eslint-community/eslint-comments/no-unused-enable

> disallow unused `eslint-enable` comments

- 🌟 The `"extends": "plugin:@eslint-community/eslint-comments/recommended"` property in a configuration file enables this rule.

This rule warns `eslint-enable` directive-comments which have no effect.

## Rule Details

Examples of :-1: **incorrect** code for this rule:

<eslint-playground type="bad" code="/*eslint @eslint-community/eslint-comments/no-unused-enable: error */

/*eslint-disable no-undef */
doSomething()
/*eslint-enable no-undef-init */
" />

<eslint-playground type="bad" code="/*eslint @eslint-community/eslint-comments/no-unused-enable: error */

doSomething()
/*eslint-enable */
" />

Examples of :+1: **correct** code for this rule:

<eslint-playground type="good" code="/*eslint @eslint-community/eslint-comments/no-unused-enable: error */

/*eslint-disable no-undef */
doSomething()
/*eslint-enable no-undef */
" />

<eslint-playground type="good" code="/*eslint @eslint-community/eslint-comments/no-unused-enable: error */

doSomething()
" />
