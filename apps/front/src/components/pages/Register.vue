<script lang="ts" setup>
import { useAuthStore } from "@/stores/authStore";
import { ref } from "vue";

const emit = defineEmits<{ "go-login": [] }>();
const auth = useAuthStore();

const name = ref("");
const email = ref("");
const password = ref("");
const formError = ref<string | null>(null);

async function onSubmit(e: Event) {
    e.preventDefault();
    formError.value = null;
    try {
        await auth.register(name.value, email.value, password.value);
    } catch (err: any) {
        formError.value = auth.error || "Échec d'inscription";
    }
}
</script>

<template>
    <div class="auth-card">
        <h1>Créer un compte</h1>
        <form @submit="onSubmit" class="form">
            <label>
                <span>Nom</span>
                <input
                    v-model="name"
                    type="text"
                    required
                    placeholder="Votre nom"
                />
            </label>
            <label>
                <span>Email</span>
                <input
                    v-model="email"
                    type="email"
                    required
                    placeholder="vous@exemple.com"
                />
            </label>
            <label>
                <span>Mot de passe</span>
                <input
                    v-model="password"
                    type="password"
                    required
                    placeholder="••••••••"
                />
            </label>

            <button class="primary" :disabled="auth.loading" type="submit">
                {{ auth.loading ? "Création…" : "S'inscrire" }}
            </button>
            <p v-if="formError" class="error">{{ formError }}</p>
        </form>

        <p class="hint">
            Déjà un compte ?
            <button class="link" @click="emit('go-login')">Se connecter</button>
        </p>
    </div>
</template>

<style scoped>
.auth-card {
    width: 100%;
    max-width: 400px;
    background: var(--bg-primary);
    border: 1px solid var(--border-light);
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}
h1 {
    margin: 0 0 16px;
    font-size: 22px;
    color: var(--text-primary);
}
.form {
    display: grid;
    gap: 12px;
}
label {
    display: grid;
    gap: 6px;
}
label span {
    font-size: 13px;
    color: var(--text-secondary);
}
input {
    padding: 10px 12px;
    border: 1px solid var(--border-medium);
    background: var(--bg-secondary);
    color: var(--text-primary);
    border-radius: 8px;
}
button.primary {
    margin-top: 4px;
    padding: 10px 12px;
    background: var(--accent-blue);
    color: var(--bg-primary);
    border: none;
    border-radius: 8px;
    cursor: pointer;
}
.hint {
    margin-top: 12px;
    color: var(--text-secondary);
    font-size: 14px;
}
.link {
    border: none;
    background: none;
    color: var(--accent-blue);
    cursor: pointer;
    padding: 0 4px;
}
.error {
    color: var(--accent-red);
    margin: 4px 0 0;
    font-size: 14px;
}
</style>
