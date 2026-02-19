# 12 — Frontend : Page Chat (refonte + historique)

## Objectif

Refondre la page Chat avec le nouveau design, ajouter le drawer d'historique
des conversations, et enrichir les recipe cards dans les réponses de l'agent.

---

## Checklist

- [ ] Refondre `ChatPage.vue` avec Tailwind
- [ ] Créer `conversationsStore` (Pinia)
- [ ] Créer `ConversationDrawer.vue`
- [ ] Adapter la gestion du thread_id (depuis le backend)
- [ ] Enrichir `AssistantMessage.vue` avec les recipe cards interactives
- [ ] Refondre `RecipeCard` inline dans le chat (nouveau composant `ChatRecipeCard`)
- [ ] Gérer le nouvel event SSE `threadCreated`
- [ ] Refondre `ChatInput.vue` avec Tailwind

---

## conversationsStore (Pinia)

```
state:
  threads:        ThreadSummary[]
  currentThreadId: string | null
  drawerOpen:     boolean
  loading:        boolean

actions:
  fetchThreads()              → GET /threads → met à jour threads
  createThread()              → POST /threads → retourne nouveau thread, set currentThreadId
  switchThread(threadId)      → set currentThreadId + recharger l'historique
  deleteThread(threadId)      → DELETE /threads/:id + retirer de la liste
  setTitle(threadId, title)   → mise à jour locale optimiste (depuis event SSE)
  openDrawer() / closeDrawer()
```

Initialisation : au login, `fetchThreads()` + charger le thread le plus récent.

---

## Structure de la page — ChatPage.vue

```
<div class="chat-page">

  <!-- Drawer historique (slide depuis la gauche) -->
  <ConversationDrawer
    :threads="conversationsStore.threads"
    :currentThreadId="conversationsStore.currentThreadId"
    :isOpen="conversationsStore.drawerOpen"
    @select="conversationsStore.switchThread"
    @delete="conversationsStore.deleteThread"
    @new="startNewConversation"
    @close="conversationsStore.closeDrawer"
  />

  <!-- Overlay sombre quand drawer ouvert -->
  <div v-if="drawerOpen" class="drawer-overlay" @click="closeDrawer" />

  <!-- Header -->
  <header class="chat-header">
    <button @click="conversationsStore.openDrawer">
      <MenuIcon />
    </button>
    <span class="chat-title">MEALPLANNER</span>
    <button @click="startNewConversation">
      <SquarePenIcon />
    </button>
  </header>

  <!-- Messages -->
  <div class="messages-area" ref="messagesEl">
    <EmptyState v-if="messages.length === 0" />
    <template v-for="msg in messages">
      <UserMessage v-if="msg.role === 'user'" :message="msg" />
      <AssistantMessage v-else :message="msg" />
    </template>
  </div>

  <!-- Input -->
  <ChatInput
    :disabled="isStreaming"
    @send="sendMessage"
  />

</div>
```

---

## ConversationDrawer.vue

Panneau latéral gauche avec l'historique des conversations.

```
Largeur : 280px
Position : fixed, slide depuis left: -280px → left: 0
Fond : #0D0F14, border-right hairline

Contenu :
  En-tête :
    "CONVERSATIONS"  [✕ fermer]

  Bouton "Nouvelle conversation" :
    [+ Nouvelle conversation]
    Border hairline sand, texte sand

  Liste des threads (triés par lastMessageAt DESC) :
    Chaque item :
      - Titre de la conversation (blanc, tronqué 1 ligne)
      - Date relative ("il y a 2h", "hier", "lun. 17 fév.")
      - Thread actif : barre sand 2px à gauche + fond légèrement plus clair
      - Swipe left ou bouton suppression (apparu au hover/long-press)
```

---

## Gestion du thread_id (adaptation)

Flux de création d'une nouvelle conversation :

```
1. Utilisateur clique "Nouvelle conversation" ou envoie un 1er message
2. Front appelle conversationsStore.createThread()
3. Backend retourne { id, title: "Nouvelle conversation" }
4. Front utilise cet id comme thread_id pour le stream SSE
5. Backend génère le titre après le 1er échange (async)
6. Backend envoie l'event SSE :
   event: threadCreated / threadTitleUpdated
   data: { threadId, title }
7. Front met à jour le titre dans conversationsStore
```

Migration : retirer le `langgraph_thread_id` du localStorage.
Le thread actif est maintenant géré par `conversationsStore.currentThreadId`.

---

## ChatRecipeCard.vue (nouveau)

Recipe card enrichie, affichée inline dans les messages de l'agent.

```
Props:
  recipe:  Recipe   // avec ou sans nutrition

Rendu:
  ┌──────────────────────────────┐
  │ Nom de la recette            │
  │──────────────────────────────│
  │ 520 kcal  P·35g  G·60g  L·18g│  ← sand/muted
  │──────────────────────────────│  ← si pas de nutrition: "Macros non calculées"
  │ [+ Bibliothèque]  [Planifier]│
  └──────────────────────────────┘

Boutons :
  "+ Bibliothèque" → appelle libraryStore.addRecipe() si pas déjà dedans
                     affiche "✓ Ajoutée" si déjà dans la bibliothèque
  "Planifier"      → appelle planStore.addMeal(recipe)
                     feedback visuel "✓ Planifié"
```

La détection "recette mentionnée dans le message" se fait côté agent :
le LLM inclut les données de recette en JSON dans un event SSE spécifique
plutôt que dans le texte, et le front le parse pour afficher la ChatRecipeCard.

---

## Nouveaux events SSE à gérer côté front

```
"threadCreated"       → conversationsStore.createThread (met à jour l'id + titre)
"threadTitleUpdated"  → conversationsStore.setTitle(threadId, title)
"recipeCard"          → injecter une ChatRecipeCard dans le message courant
"updateJournal"       → journalStore.fetchDay() (après un logFood tool)
```

---

## RefactorAssistantMessage.vue

Adapter le composant pour gérer les nouveaux types de parts :

```
parts: Array<
  | { type: "text",       content: string }
  | { type: "tool",       name: string, status: "running"|"completed" }
  | { type: "recipeCard", recipe: Recipe }   // nouveau
>
```

---

## Notes

- Le drawer se ferme au tap sur overlay ET au swipe left (touch event)
- Sur tablette/desktop : le drawer peut être en mode permanent (sidebar fixe)
- Garder le streaming SSE existant, juste adapter la gestion des events
- L'historique d'une conversation se charge via `chatService.getHistory(threadId)`
  au moment du switch de thread

---

## After Implementation

1. Check every box in this file's Checklist
2. Update the master checklist in `todoV2/README.md`
3. Run `pnpm format` — auto-formats all changed files
4. Run `pnpm lint` — catches any remaining issues
