<script lang="ts" setup>
import AppButton from "@/components/ui/AppButton.vue";
import AppInput from "@/components/ui/AppInput.vue";
import { useAuthStore } from "@/stores/authStore";
import { ref } from "vue";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

const name = ref("");
const email = ref("");
const password = ref("");
const formError = ref<string | null>(null);

async function onSubmit(e: Event) {
    e.preventDefault();
    formError.value = null;
    try {
        await auth.register(name.value, email.value, password.value);
        router.push("/dashboard");
    } catch (err: any) {
        formError.value = auth.error || "Échec d'inscription";
    }
}
</script>

<template>
    <div class="auth-wrapper">
        <div class="auth-card">
            <h1>Créer un compte</h1>
            <form @submit="onSubmit" class="form">
                <label>
                    <span>Nom</span>
                    <AppInput
                        v-model="name"
                        type="text"
                        required
                        placeholder="Votre nom"
                    />
                </label>
                <label>
                    <span>Email</span>
                    <AppInput
                        v-model="email"
                        type="email"
                        required
                        placeholder="vous@exemple.com"
                    />
                </label>
                <label>
                    <span>Mot de passe</span>
                    <AppInput
                        v-model="password"
                        type="password"
                        required
                        placeholder="••••••••"
                    />
                </label>

                <AppButton
                    type="submit"
                    :disabled="auth.loading"
                    class="submit-btn"
                >
                    {{ auth.loading ? "Création…" : "S'inscrire" }}
                </AppButton>
                <p v-if="formError" class="error">{{ formError }}</p>
            </form>

            <p class="hint">
                Déjà un compte ?
                <AppButton variant="muted" @click="router.push('/login')" class="link-btn">
                    Se connecter
                </AppButton>
            </p>
        </div>
    </div>
</template>

<style scoped>
.auth-wrapper {
    height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.auth-card {
    width: 100%;
    max-width: 380px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-card);
    padding: 28px 24px;
    margin: 16px;
}

h1 {
    margin: 0 0 20px;
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text);
    letter-spacing: -0.01em;
}

.form {
    display: grid;
    gap: 14px;
}

label {
    display: grid;
    gap: 6px;
}

label span {
    font-size: 11px;
    color: var(--color-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
}

.submit-btn {
    margin-top: 4px;
    width: 100%;
    justify-content: center;
}

.hint {
    margin-top: 16px;
    color: var(--color-muted);
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 4px;
}

.link-btn {
    padding-left: 0;
    padding-right: 0;
}

.error {
    color: #f87171;
    margin: 0;
    font-size: 13px;
}
</style>
