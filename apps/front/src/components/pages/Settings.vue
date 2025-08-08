<script lang="ts" setup>
import { ref } from "vue";

const emit = defineEmits<{
    close: [];
}>();

const isConfirmingDelete = ref(false);

const handleDeleteAllData = () => {
    if (!isConfirmingDelete.value) {
        isConfirmingDelete.value = true;
        // Auto-cancel confirmation after 3 seconds
        setTimeout(() => {
            isConfirmingDelete.value = false;
        }, 3000);
        return;
    }

    // Clear all localStorage data
    localStorage.clear();

    // Reset confirmation state
    isConfirmingDelete.value = false;

    // Close settings page
    emit("close");

    // Reload the page to reset application state
    window.location.reload();
};

const handleClose = () => {
    isConfirmingDelete.value = false;
    emit("close");
};
</script>

<template>
    <div class="settings-container">
        <div class="settings-header">
            <h2>Paramètres</h2>
            <button @click="handleClose" class="close-button">✕</button>
        </div>

        <div class="settings-content">
            <div class="settings-section">
                <h3>Données</h3>
                <div class="setting-item">
                    <div class="setting-description">
                        <h4>Supprimer toutes les données</h4>
                        <p>
                            Efface tous les messages, repas et plannings
                            sauvegardés.
                        </p>
                    </div>
                    <button
                        @click="handleDeleteAllData"
                        :class="[
                            'delete-button',
                            { confirm: isConfirmingDelete },
                        ]"
                    >
                        {{
                            isConfirmingDelete
                                ? "Confirmer la suppression"
                                : "Supprimer toutes les données"
                        }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.settings-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: var(--bg-primary);
}

.settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-medium);
    background-color: var(--bg-primary);
    flex-shrink: 0;
}

.settings-header h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
}

.close-button {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 8px;
    border-radius: 4px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
}

.close-button:hover {
    background-color: var(--bg-hover);
    color: var(--text-primary);
}

.settings-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background-color: var(--bg-secondary);
}

.settings-section {
    background-color: var(--bg-primary);
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 16px;
    border: 1px solid var(--border-light);
}

.settings-section h3 {
    margin: 0 0 16px 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
}

.setting-item {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.setting-description h4 {
    margin: 0 0 4px 0;
    font-size: 16px;
    font-weight: 500;
    color: var(--text-primary);
}

.setting-description p {
    margin: 0;
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.4;
}

.delete-button {
    padding: 12px 16px;
    background-color: var(--accent-red);
    color: var(--bg-primary);
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    align-self: flex-start;
}

.delete-button:hover {
    background-color: var(--accent-red-hover);
    transform: translateY(-1px);
}

.delete-button:active {
    transform: translateY(0);
}

.delete-button.confirm {
    background-color: #dc2626;
    animation: pulse 0.5s ease-in-out;
}

@keyframes pulse {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.02);
    }
    100% {
        transform: scale(1);
    }
}

/* Mobile-first responsive design */
@media (min-width: 768px) {
    .setting-item {
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-start;
    }

    .delete-button {
        align-self: center;
    }
}
</style>
