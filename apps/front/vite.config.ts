import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "url"; // Import URL utilities
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [tailwindcss(), vue()],
    envDir: resolve(fileURLToPath(new URL(".", import.meta.url)), "../.."),
    resolve: {
        alias: {
            // Use import.meta.url for robust path resolution
            "@": fileURLToPath(new URL("./src", import.meta.url)), // Resolve '@' to './src'
        },
    },
});
