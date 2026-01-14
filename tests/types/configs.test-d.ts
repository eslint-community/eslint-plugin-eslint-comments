import * as configs from "@eslint-community/eslint-plugin-eslint-comments/configs"
import type { Linter } from "eslint"

describe("type tests", () => {
    test("configs.recommended is a valid ESLint config type", () => {
        expectTypeOf(configs)
            .toHaveProperty("recommended")
            .toExtend<Linter.Config>()

        expectTypeOf([configs.recommended]).toExtend<Linter.Config[]>()

        expectTypeOf(configs.recommended).toExtend<Linter.Config>()

        expectTypeOf(configs)
            .toHaveProperty("recommended")
            .toExtend<Linter.Config>()

        expectTypeOf([configs.recommended]).toExtend<Linter.Config[]>()

        configs.recommended satisfies Linter.Config

        expectTypeOf<typeof configs.recommended>().toExtend<Linter.Config>()
    })
})
