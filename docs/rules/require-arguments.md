# @eslint-community/eslint-comments/require-arguments

> require arguments after ESLint or other directive-comments

Abuse or misspellings of directive-comments may cause one to overlook bugs or violate the coding style.
This rule only allows specific directive-comments.

## Rule Details

Examples of :-1: **incorrect** code for this rule:

<eslint-playground type="bad" >

```js
/*eslint @eslint-community/eslint-comments/require-arguments: error, {"directives": {"eslint-disable": "no-undef"}} */

/* eslint-disable */
/* eslint-disable no-unused-vars */
```

</eslint-playground>

## Options

You can specify allowed arguments for directive-comments.

```json
{
    "@eslint-community/eslint-comments/no-use": [
        "error",
        {
            "directives": {
                "eslint-disable": "no-undef"
            }
        }
    ]
}
```

-   `directives` option is an object of keys to string regular expressions to specify required arguments for directive-comments.
