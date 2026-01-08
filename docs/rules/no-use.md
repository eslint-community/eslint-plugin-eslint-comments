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
    "@eslint-community/eslint-comments/no-use": ["error", { "allow": [] }]
}
```

-   `allow` option is an array to allow specified directive-comments. The value of the array is some of the following strings
    or one of the strings in `additionalDirectives`:

    -   `"eslint"`
    -   `"eslint-disable"`
    -   `"eslint-disable-line"`
    -   `"eslint-disable-next-line"`
    -   `"eslint-enable"`
    -   `"eslint-env"`
    -   `"exported"`
    -   `"global"`
    -   `"globals"`

-   `additionalDirectives` - By default, only the above-mentioned
    ESLint-based comments are prohibited when not in the `allow` array.
    If you wish to prohibit other comments, e.g., `istanbul` or `c8` for
    coverage, you can add them to this string array. Note that it is possible
    we may not be able to detect comments for some non-JavaScript languages.

## Known Limitations

This rule cannot prevent the following case:

```js
/* eslint @eslint-community/eslint-comments/no-use: off */
```

Because ESLint addresses the directive-comment before parsing.
