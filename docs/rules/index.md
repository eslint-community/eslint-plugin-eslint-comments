# Available Rules

-   🌟 mark: the rule which is enabled by `@eslint-community/eslint-comments/recommended` preset.
-   ✒️ mark: the rule which is fixable by `eslint --fix` command.

## Best Practices

| Rule ID                                                                                    | Description                                                               |     |
| :----------------------------------------------------------------------------------------- | :------------------------------------------------------------------------ | :-- |
| [@eslint-community/eslint-comments/<wbr>disable-enable-pair](./disable-enable-pair.md)     | require a `eslint-enable` comment for every `eslint-disable` comment      | 🌟  |
| [@eslint-community/eslint-comments/<wbr>no-aggregating-enable](./no-aggregating-enable.md) | disallow a `eslint-enable` comment for multiple `eslint-disable` comments | 🌟  |
| [@eslint-community/eslint-comments/<wbr>no-duplicate-disable](./no-duplicate-disable.md)   | disallow duplicate `eslint-disable` comments                              | 🌟  |
| [@eslint-community/eslint-comments/<wbr>no-unlimited-disable](./no-unlimited-disable.md)   | disallow `eslint-disable` comments without rule names                     | 🌟  |
| [@eslint-community/eslint-comments/<wbr>no-unused-enable](./no-unused-enable.md)           | disallow unused `eslint-enable` comments                                  | 🌟  |

## Stylistic Issues

| Rule ID                                                                                    | Description                                               |     |
| :----------------------------------------------------------------------------------------- | :-------------------------------------------------------- | :-- |
| [@eslint-community/eslint-comments/<wbr>no-restricted-disable](./no-restricted-disable.md) | disallow `eslint-disable` comments about specific rules   |     |
| [@eslint-community/eslint-comments/<wbr>no-use](./no-use.md)                               | disallow ESLint directive-comments                        |     |
| [@eslint-community/eslint-comments/<wbr>require-description](./require-description.md)     | require include descriptions in ESLint directive-comments |     |
