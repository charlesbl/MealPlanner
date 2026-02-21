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
        { path: "/login", name: "login", component: Login, meta: { title: "MealPlanner" } },
        { path: "/register", name: "register", component: Register, meta: { title: "MealPlanner" } },
        {
            path: "/dashboard",
            name: "dashboard",
            component: DashboardPage,
            meta: { requiresAuth: true, title: "Dashboard – MealPlanner" },
        },
        {
            path: "/chat",
            name: "chat",
            component: ChatPage,
            meta: { requiresAuth: true, title: "Chat – MealPlanner" },
        },
        {
            path: "/chat/:threadId",
            name: "chat-thread",
            component: ChatPage,
            meta: { requiresAuth: true, title: "Chat – MealPlanner" },
        },
        {
            path: "/library",
            name: "library",
            component: LibraryPage,
            meta: { requiresAuth: true, title: "Library – MealPlanner" },
        },
        {
            path: "/journal",
            name: "journal",
            component: JournalPage,
            meta: { requiresAuth: true, title: "Journal – MealPlanner" },
        },
        {
            path: "/journal/:date",
            name: "journal-date",
            component: JournalPage,
            meta: { requiresAuth: true, title: "Journal – MealPlanner" },
        },
        {
            path: "/profile",
            name: "profile",
            component: ProfilePage,
            meta: { requiresAuth: true, title: "Profile – MealPlanner" },
        },
    ],
});

router.beforeEach((to) => {
    const auth = useAuthStore();
    const isAuthenticated = !!auth.token || !!auth.user;

    if (to.meta.requiresAuth && !isAuthenticated) {
        return { name: "login", query: { redirect: to.fullPath } };
    }

    if ((to.name === "login" || to.name === "register") && isAuthenticated) {
        return { name: "dashboard" };
    }
});

router.afterEach((to) => {
    document.title = (to.meta.title as string) ?? "MealPlanner";
});

export default router;
