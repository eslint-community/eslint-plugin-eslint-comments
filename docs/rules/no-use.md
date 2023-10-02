# @eslint-community/eslint-comments/no-use

> disallow ESLint directive-comments

Abuse of directive-comments may cause to overlook bugs or upset of coding style.
This rule disallows a use of directive-comments.

## Rule Details

Examples of :-1: **incorrect** code for this rule:

<eslint-playground type="bad" >

```js
/*eslint @eslint-community/eslint-comments/no-use: error */

/* eslint no-undef: off */
/* eslint-env browser */
/* eslint-disable foo */
/* eslint-enable bar */
// eslint-disable-line
// eslint-disable-next-line
/* exported foo */
/* global $ */
/* globals a, b, c */
```

</eslint-playground>

## Options

You can specify allowed directive-comments.

```json
{
    "@eslint-community/eslint-comments/no-use": ["error", {"allow": []}]
}
```

- `allow` option is an array to allow specified directive-comments. The value of the array is some of the following strings:
    - `"eslint"`
    - `"eslint-disable"`
    - `"eslint-disable-line"`
    - `"eslint-disable-next-line"`
    - `"eslint-enable"`
    - `"eslint-env"`
    - `"exported"`
    - `"global"`
    - `"globals"`

## Known Limitations

This rule cannot prevent the following case:

```js
/* eslint @eslint-community/eslint-comments/no-use: off */
```

Because ESLint addresses the directive-comment before parsing.
