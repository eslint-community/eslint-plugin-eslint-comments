import * as path from "node:path"
import type { InlineConfig, UserConfig } from "tsdown"
import { defineConfig } from "tsdown"
import packageJson from "./package.json" with { type: "json" }

const tsdownConfig = defineConfig((cliOptions) => {
    const commonOptions = {
        clean: false,
        cwd: import.meta.dirname,
        dts: {
            emitJs: false,
            newContext: true,
            oxc: false,
            resolver: "tsc",
            sourcemap: true,
        },
        failOnWarn: true,
        fixedExtension: false,
        format: ["cjs", "es"],
        hash: false,
        minify: "dce-only",
        nodeProtocol: true,
        outExtensions: ({ format }) => ({
            dts: format === "cjs" ? ".d.cts" : ".d.ts",
            js: format === "cjs" ? ".cjs" : ".js",
        }),
        platform: "node",
        shims: true,
        sourcemap: true,
        target: ["esnext"],
        treeshake: {
            moduleSideEffects: false,
        },
        tsconfig: path.join(import.meta.dirname, "tsconfig.build.json"),
        ...cliOptions,
    } as const satisfies InlineConfig

    return [
        {
            ...commonOptions,
            entry: {
                index: "index.ts",
            },
            name: `${packageJson.name} Modern Dual Format`,
        },
        {
            ...commonOptions,
            entry: {
                configs: "configs.ts",
            },
            name: `${packageJson.name}/configs Modern Dual Format`,
        },
    ] as const satisfies UserConfig[]
})

export default tsdownConfig
