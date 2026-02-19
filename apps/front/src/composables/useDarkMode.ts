import { onMounted, onUnmounted, readonly, ref } from "vue";

export function useDarkMode() {
    const isDark = ref(false);
    let mediaQuery: MediaQueryList | null = null;

    const updateDarkMode = (e: MediaQueryListEvent | MediaQueryList) => {
        isDark.value = e.matches;
        document.documentElement.setAttribute(
            "data-theme",
            e.matches ? "dark" : "light",
        );
    };

    onMounted(() => {
        if (window.matchMedia) {
            mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            updateDarkMode(mediaQuery);
            mediaQuery.addEventListener("change", updateDarkMode);
        }
    });

    onUnmounted(() => {
        if (mediaQuery) {
            mediaQuery.removeEventListener("change", updateDarkMode);
        }
    });

    return {
        isDark: readonly(isDark),
    };
}
