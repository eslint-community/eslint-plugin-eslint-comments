"use strict"

const eslintComments = require("../../../../../index")
module.exports = [
    {
        files: ["**/*.js"],
        plugins: {
            "@eslint-community/eslint-comments": eslintComments,
        },
        rules: {
            "@eslint-community/eslint-comments/no-unused-disable": "error",
        },
    },
]
