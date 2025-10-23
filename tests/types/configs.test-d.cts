import configs = require("@eslint-community/eslint-plugin-eslint-comments/configs")
import expectTypeModule = require("expect-type")

import type { Linter } from "eslint"

import expectTypeOf = expectTypeModule.expectTypeOf

expectTypeOf(configs)
  .toHaveProperty("recommended")
  .toExtend<Linter.FlatConfig>()

expectTypeOf([configs.recommended]).toExtend<Linter.FlatConfig[]>()

expectTypeOf(configs.recommended).toExtend<Linter.FlatConfig>()

expectTypeOf(configs)
  .toHaveProperty("recommended")
  .toExtend<Linter.FlatConfig>()
