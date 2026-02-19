import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "url"; // Import URL utilities

// https://vite.dev/config/
export default defineConfig({
    plugins: [tailwindcss(), vue()],
    resolve: {
        alias: {
            // Use import.meta.url for robust path resolution
            "@": fileURLToPath(new URL("./src", import.meta.url)), // Resolve '@' to './src'
        },
    },
});
