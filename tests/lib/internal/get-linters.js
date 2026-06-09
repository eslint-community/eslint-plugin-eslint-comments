/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * See LICENSE file in root directory for full license.
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
 * Load `get-linters` in isolation with a `require` whose `cache` property is a
 * given value. This mirrors ESM / bundled / patched-module contexts where
 * `require.cache` can be `undefined` or `null`.
 * @param {*} cacheValue The value to assign to `require.cache`.
 * @returns {Function} The compiled `get-linters` export.
 */
function loadWithRequireCache(cacheValue) {
    const source = fs.readFileSync(getLintersPath, "utf8")
    const realRequire = Module.createRequire(getLintersPath)
    const requireWithCache = (id) => realRequire(id)

    requireWithCache.cache = cacheValue
    requireWithCache.resolve = realRequire.resolve

    const moduleObject = { exports: {} }
    const compiled = vm.runInThisContext(Module.wrap(source), {
        filename: getLintersPath,
    })

    compiled.call(
        moduleObject.exports,
        moduleObject.exports,
        requireWithCache,
        moduleObject,
        getLintersPath,
        path.dirname(getLintersPath)
    )

    return moduleObject.exports
}

describe("internal/get-linters", () => {
    it("does not throw when require.cache is undefined", () => {
        const getLinters = loadWithRequireCache(undefined)

        assert.doesNotThrow(() => getLinters())
        assert.ok(Array.isArray(getLinters()))
    })

    it("does not throw when require.cache is null", () => {
        const getLinters = loadWithRequireCache(null)

        assert.doesNotThrow(() => getLinters())
        assert.ok(Array.isArray(getLinters()))
    })
})
