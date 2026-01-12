import DefaultTheme from "vitepress/theme"
import { defineAsyncComponent } from "vue"
import "./style.css"

/** @type {import('vitepress').Theme} */
const theme = {
    extends: DefaultTheme,
    enhanceApp(ctx) {
        ctx.app.component(
            "eslint-playground",
            defineAsyncComponent({
                // @ts-expect-error -- ignore
                loader: () => import("./components/eslint-playground.vue"),
            })
        )
    },
}
export default theme
