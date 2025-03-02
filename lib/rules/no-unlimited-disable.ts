/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * See LICENSE file in root directory for full license.
 */
import type { Rule } from "eslint"
import { getAllDirectiveComments } from "../internal/get-all-directive-comments.ts"
import * as utils from "../internal/utils.ts"

const noUnlimitedDisable: Rule.RuleModule = {
    meta: {
        docs: {
            description:
                "disallow `eslint-disable` comments without rule names",
            category: "Best Practices",
            recommended: true,
            url: "https://eslint-community.github.io/eslint-plugin-eslint-comments/rules/no-unlimited-disable.html",
        },
        fixable: null as any,
        messages: {
            unexpected:
                "Unexpected unlimited '{{kind}}' comment. Specify some rule names to disable.",
        },
        schema: [],
        type: "suggestion",
    },

    create(context) {
        for (const directiveComment of getAllDirectiveComments(
            context as never
        )) {
            const { kind } = directiveComment
            if (
                kind !== "eslint-disable" &&
                kind !== "eslint-disable-line" &&
                kind !== "eslint-disable-next-line"
            ) {
                continue
            }
            if (!directiveComment.value) {
                context.report({
                    loc: utils.toForceLocation(directiveComment.loc),
                    messageId: "unexpected",
                    data: { kind: directiveComment.kind },
                })
            }
        }

        return {}
    },
}

export default noUnlimitedDisable
