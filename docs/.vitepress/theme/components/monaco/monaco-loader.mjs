import { init } from "modern-monaco"

export const DARK_THEME_NAME = "github-dark"

let monacoPromise = null

/**
 * Load Monaco Editor.
 * @returns {Promise<import("modern-monaco/editor-core")>}
 */
export function loadMonacoEditor() {
    if (monacoPromise) {
        return monacoPromise
    }
    monacoPromise = init({
        themes: [DARK_THEME_NAME],
        lsp: {
            typescript: {
                diagnosticsOptions: {
                    validate: false,
                },
            },
        },
    })

    return monacoPromise
}
