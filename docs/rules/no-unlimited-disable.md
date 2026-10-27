# @eslint-community/eslint-comments/no-unlimited-disable

> disallow `eslint-disable` comments without rule names

-   🌟 The `"extends": "plugin:@eslint-community/eslint-comments/recommended"` property in a configuration file enables this rule.

`eslint-disable` directive-comments disable all rules by default. This may cause to overlook some ESLint warnings unintentionally.
So you should specify the rules to disable accurately.

## Rule Details

Examples of :-1: **incorrect** code for this rule:

<eslint-playground type="bad" >

```js
/*eslint @eslint-community/eslint-comments/no-unlimited-disable: error */

var foo //eslint-disable-line
```

</eslint-playground>

Examples of :+1: **correct** code for this rule:

<eslint-playground type="good" >

```js
/*eslint @eslint-community/eslint-comments/no-unlimited-disable: error */

var foo //eslint-disable-line no-unused-vars
```

</eslint-playground>

## Options

You can specify required arguments for directive-comments.

```json
{
    "@eslint-community/eslint-comments/no-unlimited-disable": [
        "error",
        {
            "directives": {
                "eslint-disable": "no-undef",
                "istanbul": "ignore (if|else|next)"
            }
        }
    ]
}
```

-   `directives` option is an object of keys to string regular expressions to
    specify required arguments for directive-comments. A directive-comment
    whose kind is listed is reported (with a "Missing argument" message) if
    its argument does not match the regular expression; other kinds keep the
    default behavior.
