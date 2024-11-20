import configs from "@eslint-community/eslint-plugin-eslint-comments/configs"
import type { Linter } from "eslint"
import { expectTypeOf } from "expect-type"

expectTypeOf(configs)
  .toHaveProperty("recommended")
  .toMatchTypeOf<Linter.FlatConfig>()

expectTypeOf([configs.recommended]).toMatchTypeOf<Linter.FlatConfig[]>()

expectTypeOf(configs.recommended).toMatchTypeOf<Linter.FlatConfig>()

expectTypeOf(configs)
  .toHaveProperty("recommended")
  .toMatchTypeOf<Linter.FlatConfig>()
