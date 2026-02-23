<script setup lang="ts">
import AppButton from "@/components/ui/AppButton.vue";
import AppCard from "@/components/ui/AppCard.vue";
import AppDivider from "@/components/ui/AppDivider.vue";
import AppInput from "@/components/ui/AppInput.vue";
import AppToggle from "@/components/ui/AppToggle.vue";
import SectionLabel from "@/components/ui/SectionLabel.vue";
import { useDarkMode } from "@/composables/useDarkMode";
import { useAuthStore } from "@/stores/authStore";
import { useProfileStore } from "@/stores/profileStore";
import type { UpdateProfileRequest } from "@mealplanner/shared-all";
import { computed, nextTick, ref } from "vue";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const profileStore = useProfileStore();
const router = useRouter();
const { isDark, setDarkMode } = useDarkMode();

type ProfileField =
    | "height"
    | "weight"
    | "age"
    | "calorieGoal"
    | "proteinGoal"
    | "carbsGoal"
    | "fatGoal";

const editingField = ref<ProfileField | null>(null);
const editLabel = ref("");
const editUnit = ref("");
const editValue = ref("");
const editInputRef = ref<HTMLInputElement | null>(null);
const saveError = ref<string | null>(null);

const fieldLabels: Record<ProfileField, string> = {
    height: "Taille",
    weight: "Poids",
    age: "Âge",
    calorieGoal: "Calories",
    proteinGoal: "Protéines",
    carbsGoal: "Glucides",
    fatGoal: "Lipides",
};

const fieldUnits: Record<ProfileField, string> = {
    height: "cm",
    weight: "kg",
    age: "ans",
    calorieGoal: "kcal",
    proteinGoal: "g",
    carbsGoal: "g",
    fatGoal: "g",
};

async function openEdit(field: ProfileField) {
    editingField.value = field;
    editLabel.value = `${fieldLabels[field]} (${fieldUnits[field]})`;
    editUnit.value = fieldUnits[field];
    const val = profileStore.profile?.[field];
    editValue.value = val != null ? String(val) : "";
    saveError.value = null;
    await nextTick();
    editInputRef.value?.focus();
}

function closeEdit() {
    editingField.value = null;
    saveError.value = null;
}

async function submitEdit() {
    if (!editingField.value) return;
    const trimmed = editValue.value.trim();
    const numVal = trimmed === "" ? null : Number(trimmed);
    if (trimmed !== "" && isNaN(numVal!)) return;
    try {
        const patch: UpdateProfileRequest = { [editingField.value]: numVal };
        await profileStore.saveProfile(patch);
        closeEdit();
    } catch {
        saveError.value = "Erreur lors de la sauvegarde";
    }
}

function displayValue(field: ProfileField): string {
    const val = profileStore.profile?.[field];
    if (val == null) return "—";
    return `${val} ${fieldUnits[field]}`;
}

const deficit = computed(() => {
    const t = profileStore.tdee;
    const g = profileStore.profile?.calorieGoal;
    if (!t || !g) return null;
    const diff = t - g;
    return diff >= 0 ? `-${diff} kcal` : `+${Math.abs(diff)} kcal`;
});

async function handleLogout() {
    auth.logout();
    await router.push("/login");
}

const darkModelValue = computed({
    get: () => isDark.value,
    set: (v) => setDarkMode(v),
});
</script>

<template>
    <div class="profile-page">
        <h1 class="page-title">MON PROFIL</h1>

        <!-- INFORMATIONS -->
        <SectionLabel class="section-label">Informations</SectionLabel>
        <AppCard :noPadding="true" class="card">
            <button class="profile-row" @click="openEdit('height')">
                <span class="row-label">Taille /</span>
                <span class="row-value">{{ displayValue("height") }}</span>
                <span class="row-chevron">›</span>
            </button>
            <AppDivider />
            <button class="profile-row" @click="openEdit('weight')">
                <span class="row-label">Poids /</span>
                <span class="row-value">{{ displayValue("weight") }}</span>
                <span class="row-chevron">›</span>
            </button>
            <AppDivider />
            <button class="profile-row" @click="openEdit('age')">
                <span class="row-label">Âge /</span>
                <span class="row-value">{{ displayValue("age") }}</span>
                <span class="row-chevron">›</span>
            </button>
        </AppCard>

        <!-- OBJECTIFS -->
        <SectionLabel class="section-label">Objectifs</SectionLabel>
        <AppCard :noPadding="true" class="card">
            <button class="profile-row" @click="openEdit('calorieGoal')">
                <span class="row-label">Calories /</span>
                <span class="row-value accent">{{
                    displayValue("calorieGoal")
                }}</span>
                <span class="row-chevron">›</span>
            </button>
            <AppDivider />
            <button class="profile-row" @click="openEdit('proteinGoal')">
                <span class="row-label">Protéines /</span>
                <span class="row-value">{{ displayValue("proteinGoal") }}</span>
                <span class="row-chevron">›</span>
            </button>
            <AppDivider />
            <button class="profile-row" @click="openEdit('carbsGoal')">
                <span class="row-label">Glucides /</span>
                <span class="row-value">{{ displayValue("carbsGoal") }}</span>
                <span class="row-chevron">›</span>
            </button>
            <AppDivider />
            <button class="profile-row" @click="openEdit('fatGoal')">
                <span class="row-label">Lipides /</span>
                <span class="row-value">{{ displayValue("fatGoal") }}</span>
                <span class="row-chevron">›</span>
            </button>
        </AppCard>

        <!-- DÉPENSE ESTIMÉE -->
        <template v-if="profileStore.tdee">
            <SectionLabel class="section-label">Dépense estimée</SectionLabel>
            <AppCard :noPadding="true" class="card">
                <div class="stat-row">
                    <span class="row-label">TDEE estimé</span>
                    <span class="row-value">{{ profileStore.tdee }} kcal</span>
                </div>
                <AppDivider />
                <div class="stat-row">
                    <span class="row-label">Déficit suggéré</span>
                    <span class="row-value accent">{{ deficit }}</span>
                </div>
            </AppCard>
        </template>

        <!-- APPARENCE -->
        <AppCard class="card appearance-card">
            <div class="toggle-row">
                <span class="row-label">Thème sombre</span>
                <AppToggle v-model="darkModelValue" />
            </div>
        </AppCard>

        <!-- DÉCONNEXION -->
        <div class="logout-row">
            <AppButton variant="muted" @click="handleLogout"
                >Déconnexion</AppButton
            >
        </div>

        <!-- Edit modal -->
        <Teleport to="body">
            <div
                v-if="editingField"
                class="modal-overlay"
                @click.self="closeEdit"
            >
                <div class="modal-card">
                    <p class="modal-label">{{ editLabel }}</p>
                    <AppInput
                        ref="editInputRef"
                        v-model="editValue"
                        type="number"
                        :placeholder="`Valeur en ${editUnit}`"
                        @keydown.enter="submitEdit"
                        @keydown.escape="closeEdit"
                    />
                    <p v-if="saveError" class="save-error">{{ saveError }}</p>
                    <div class="modal-actions">
                        <AppButton
                            @click="submitEdit"
                            :disabled="profileStore.loading"
                        >
                            Enregistrer
                        </AppButton>
                        <AppButton variant="muted" @click="closeEdit"
                            >Annuler</AppButton
                        >
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<style scoped>
.profile-page {
    padding: 24px 16px 32px;
    display: flex;
    flex-direction: column;
}

.page-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 24px;
    letter-spacing: -0.01em;
}

.section-label {
    display: block;
    margin-bottom: 8px;
    margin-top: 20px;
}

.card {
    margin-bottom: 0;
}

.appearance-card {
    margin-top: 20px;
}

.profile-row,
.stat-row {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 14px 16px;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
}

.stat-row {
    cursor: default;
}

.row-label {
    flex: 1;
    font-size: 14px;
    color: var(--color-text);
}

.row-value {
    font-size: 14px;
    color: var(--color-text);
    font-weight: 500;
}

.row-value.accent {
    color: var(--color-accent);
}

.row-chevron {
    font-size: 18px;
    color: var(--color-muted);
    line-height: 1;
    margin-left: 4px;
}

.toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.logout-row {
    display: flex;
    justify-content: center;
    margin-top: 24px;
}

.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
}

.modal-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 20px;
    width: 100%;
    max-width: 340px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.modal-label {
    font-size: 12px;
    color: var(--color-muted);
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.06em;
}

.save-error {
    font-size: 12px;
    color: #f87171;
    margin: 0;
}

.modal-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
}
</style>
