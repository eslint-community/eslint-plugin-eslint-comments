import * as path from "node:path"
import { defineConfig } from "vitest/config"
import packageJson from "./package.json" with { type: "json" }

const vitestConfig = defineConfig({
    root: import.meta.dirname,
    test: {
        clearMocks: true,
        dir: path.join(import.meta.dirname, "tests"),
        globals: true,
        name: {
            label: packageJson.name,
        },
        root: import.meta.dirname,
        unstubEnvs: true,
        unstubGlobals: true,
        typecheck: {
            enabled: true,
            tsconfig: path.join(import.meta.dirname, "tsconfig.json"),
        },
        watch: false,
    },
})

export default vitestConfig
