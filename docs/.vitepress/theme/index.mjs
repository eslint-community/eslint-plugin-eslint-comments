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
                loader: () => import("./components/eslint-playground.vue"),
            })
        )
    },
}
export default theme
