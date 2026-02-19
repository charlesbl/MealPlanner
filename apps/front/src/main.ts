import { createPinia } from "pinia"; // Import Pinia
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index.js";
import { useAuthStore } from "./stores/authStore";
import "./style.css";

const pinia = createPinia(); // Create Pinia instance
const app = createApp(App);

app.use(pinia); // Use Pinia
app.use(router);
app.mount("#app");

// Kick off auth check without blocking initial render
const auth = useAuthStore();
void auth.init();
