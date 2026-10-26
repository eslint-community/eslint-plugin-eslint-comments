/**
 * Test that `get-linters` tolerates a missing `require.cache`.
 */
"use strict"

const assert = require("assert")
const fs = require("fs")
const path = require("path")
const vm = require("vm")
const Module = require("module")

const getLintersPath = path.resolve(
    __dirname,
    "../../../lib/internal/get-linters.js"
)

/**
 * Load `get-linters` with a `require` function whose `cache` is the given
 * value. Some loaders (e.g. ESM wrappers or bundlers) don't provide
 * `require.cache`.
 * @param {*} cache The value to use as `require.cache`.
 * @returns {Function} The loaded `get-linters` module.
 */
function loadGetLinters(cache) {
    const source = fs.readFileSync(getLintersPath, "utf8")
    const requireWithCache = Module.createRequire(getLintersPath)
    requireWithCache.cache = cache

    const module = { exports: {} }
    const wrapper = vm.runInThisContext(Module.wrap(source), {
        filename: getLintersPath,
    })
    wrapper.call(
        module.exports,
        module.exports,
        requireWithCache,
        module,
        getLintersPath,
        path.dirname(getLintersPath)
    )

    return module.exports
}

describe("internal/get-linters", () => {
    it("should return an array when require.cache is available", () => {
        const getLinters = require(getLintersPath)

        assert.ok(Array.isArray(getLinters()))
    })

    it("should not throw when require.cache is undefined", () => {
        const getLinters = loadGetLinters(void 0)

        assert.ok(Array.isArray(getLinters()))
    })

    it("should not throw when require.cache is null", () => {
        const getLinters = loadGetLinters(null)

        assert.ok(Array.isArray(getLinters()))
    })
})
