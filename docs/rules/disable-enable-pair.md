# @eslint-community/eslint-comments/disable-enable-pair

> require a `eslint-enable` comment for every `eslint-disable` comment

-   🌟 The `"extends": "plugin:@eslint-community/eslint-comments/recommended"` property in a configuration file enables this rule.

`eslint-disable` and `oxlint-disable` directive-comments disable ESLint/oxlint rules in all lines preceded by the comment.
If you forget the corresponding `eslint-enable` or `oxlint-enable` directive-comment, you may overlook warnings unintentionally.

This rule warns `eslint-disable` and `oxlint-disable` directive-comments if the corresponding enable directive-comment does not exist.

## Rule Details

Examples of :-1: **incorrect** code for this rule:

<eslint-playground type="bad" >

```js
/*eslint @eslint-community/eslint-comments/disable-enable-pair: error */

/*eslint-disable no-undef, no-unused-vars */
var foo = bar()
```

</eslint-playground>

<eslint-playground type="bad" >

```js
/*eslint @eslint-community/eslint-comments/disable-enable-pair: error */

/*eslint-disable no-undef, no-unused-vars */
var foo = bar()
/*eslint-enable no-unused-vars */
```

</eslint-playground>

Examples of :+1: **correct** code for this rule:

<eslint-playground type="good" >

```js
/*eslint @eslint-community/eslint-comments/disable-enable-pair: error */

/*eslint-disable no-undef, no-unused-vars */
var foo = bar()
/*eslint-enable no-undef, no-unused-vars */
```

</eslint-playground>

<eslint-playground type="good" >

```js
/*eslint @eslint-community/eslint-comments/disable-enable-pair: error */

/*eslint-disable no-undef, no-unused-vars */
var foo = bar()
/*eslint-enable*/
```

</eslint-playground>

## Options

The `allowWholeFile` option lets you allow disabling rules for the entire file while still catching "open" `eslint-disable` directives in the middle of a file.

```json
{
    "@eslint-community/eslint-comments/disable-enable-pair": [
        "error",
        { "allowWholeFile": true }
    ]
}
```

Examples of :-1: **incorrect** code for this rule:

<eslint-playground type="bad" >

```js
/*eslint @eslint-community/eslint-comments/disable-enable-pair: [error, {allowWholeFile: true}] */

/*eslint-disable no-undef */
var foo = bar()
/*eslint-disable no-unused-vars */
var fizz = buzz()
```

</eslint-playground>

Examples of :+1: **correct** code for this rule:

<eslint-playground type="good" >

```js
/*eslint @eslint-community/eslint-comments/disable-enable-pair: [error, {allowWholeFile: true}] */

/*eslint-disable no-undef */
var foo = bar()
/*eslint-disable no-unused-vars */
var fizz = buzz()
/*eslint-enable no-unused-vars */
```

</eslint-playground>
