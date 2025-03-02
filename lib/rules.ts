import type { Rule } from "eslint"
import disableEnablePair from "./rules/disable-enable-pair.ts"
import noAggregatingEnable from "./rules/no-aggregating-enable.ts"
import noDuplicateDisable from "./rules/no-duplicate-disable.ts"
import noRestrictedDisable from "./rules/no-restricted-disable.ts"
import noUnlimitedDisable from "./rules/no-unlimited-disable.ts"
import noUnusedDisable from "./rules/no-unused-disable.ts"
import noUnusedEnable from "./rules/no-unused-enable.ts"
import noUse from "./rules/no-use.ts"
import requireDescription from "./rules/require-description.ts"

export const rules = {
    "disable-enable-pair": disableEnablePair,
    "no-aggregating-enable": noAggregatingEnable,
    "no-duplicate-disable": noDuplicateDisable,
    "no-restricted-disable": noRestrictedDisable,
    "no-unlimited-disable": noUnlimitedDisable,
    "no-unused-disable": noUnusedDisable,
    "no-unused-enable": noUnusedEnable,
    "no-use": noUse,
    "require-description": requireDescription,
} satisfies Record<string, Rule.RuleModule>
