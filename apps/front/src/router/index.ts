import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/authStore";
import Login from "../components/pages/Login.vue";
import Register from "../components/pages/Register.vue";
import DashboardPage from "../pages/DashboardPage.vue";
import ChatPage from "../pages/ChatPage.vue";
import LibraryPage from "../pages/LibraryPage.vue";
import JournalPage from "../pages/JournalPage.vue";
import ProfilePage from "../pages/ProfilePage.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: "/", redirect: "/dashboard" },
        { path: "/login", name: "login", component: Login },
        { path: "/register", name: "register", component: Register },
        {
            path: "/dashboard",
            name: "dashboard",
            component: DashboardPage,
            meta: { requiresAuth: true },
        },
        {
            path: "/chat",
            name: "chat",
            component: ChatPage,
            meta: { requiresAuth: true },
        },
        {
            path: "/chat/:threadId",
            name: "chat-thread",
            component: ChatPage,
            meta: { requiresAuth: true },
        },
        {
            path: "/library",
            name: "library",
            component: LibraryPage,
            meta: { requiresAuth: true },
        },
        {
            path: "/journal",
            name: "journal",
            component: JournalPage,
            meta: { requiresAuth: true },
        },
        {
            path: "/journal/:date",
            name: "journal-date",
            component: JournalPage,
            meta: { requiresAuth: true },
        },
        {
            path: "/profile",
            name: "profile",
            component: ProfilePage,
            meta: { requiresAuth: true },
        },
    ],
});

router.beforeEach((to) => {
    const auth = useAuthStore();
    const isAuthenticated = !!auth.token || !!auth.user;

    if (to.meta.requiresAuth && !isAuthenticated) {
        return { name: "login" };
    }

    if ((to.name === "login" || to.name === "register") && isAuthenticated) {
        return { name: "dashboard" };
    }
});

export default router;
