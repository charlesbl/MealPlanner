import { onMounted, onUnmounted, readonly, ref } from "vue";

const STORAGE_KEY = "theme_override";

export function useDarkMode() {
    const isDark = ref(false);
    let mediaQuery: MediaQueryList | null = null;

    const applyTheme = (dark: boolean) => {
        isDark.value = dark;
        document.documentElement.setAttribute(
            "data-theme",
            dark ? "dark" : "light",
        );
    };

    const systemListener = (e: MediaQueryListEvent) => {
        if (!localStorage.getItem(STORAGE_KEY)) {
            applyTheme(e.matches);
        }
    };

    const setDarkMode = (dark: boolean) => {
        localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
        applyTheme(dark);
    };

    onMounted(() => {
        const override = localStorage.getItem(STORAGE_KEY);
        if (override) {
            applyTheme(override === "dark");
        } else if (window.matchMedia) {
            mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            applyTheme(mediaQuery.matches);
            mediaQuery.addEventListener("change", systemListener);
        }
    });

    onUnmounted(() => {
        if (mediaQuery) {
            mediaQuery.removeEventListener("change", systemListener);
        }
    });

    return {
        isDark: readonly(isDark),
        setDarkMode,
    };
}
