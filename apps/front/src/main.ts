import { createPinia } from "pinia"; // Import Pinia
import { createApp } from "vue";
import App from "./App.vue";
import "./style.css";

const pinia = createPinia(); // Create Pinia instance
const app = createApp(App);

app.use(pinia); // Use Pinia
app.mount("#app");
