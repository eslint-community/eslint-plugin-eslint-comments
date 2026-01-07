export default [
    {
        ignores: [
            "coverage",
            "/docs/.vitepress/dist",
            "/docs/.vitepress/cache"
        ]
    },
    {
        languageOptions: {
            sourceType: "commonjs"
        }
    },
    {
        files: ["**/*.mjs"],
        languageOptions: {
            sourceType: "module"
        }
    },
    {
        files: ["docs/.vuepress/components/*.vue"],
        languageOptions: {
            parserOptions: {
                parser: "@babel/eslint-parser"
            }
        }
    }
]
