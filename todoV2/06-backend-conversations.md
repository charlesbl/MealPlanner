# 06 — Backend : Historique des conversations

## Objectif
Persister les conversations (threads LangGraph) en base de données avec un titre
auto-généré, et exposer une API pour les lister, les récupérer et les supprimer.

---

## Checklist

- [ ] Créer l'entité TypeORM `Thread`
- [ ] Créer la migration associée
- [ ] Créer le service `ThreadService`
- [ ] Créer le router Express `threadsRouter`
- [ ] Générer le titre automatiquement au premier message
- [ ] Brancher le router dans `app.ts`
- [ ] Adapter l'agent pour notifier la création / mise à jour d'un thread

---

## Entité TypeORM — Thread

Table : `threads`

```
Colonnes :
  id               UUID       PK — correspond au thread_id LangGraph
  user_id          UUID       FK → users.id, ON DELETE CASCADE
  title            VARCHAR    titre auto-généré, modifiable
  created_at       TIMESTAMP  auto
  last_message_at  TIMESTAMP  mis à jour à chaque message
```

---

## Endpoints API

### GET /threads
- Auth requise
- Liste tous les threads de l'utilisateur
- Triés par `last_message_at` DESC
- Réponse : `ThreadSummary[]`
  ```
  { id, title, createdAt, lastMessageAt }[]
  ```

### POST /threads
- Auth requise
- Créer un nouveau thread (appelé par le front quand l'utilisateur clique "Nouvelle conversation")
- Génère un `thread_id` UUID côté backend
- Titre par défaut : "Nouvelle conversation"
- Réponse : `Thread`

### PATCH /threads/:id
- Auth requise
- Mettre à jour le titre d'un thread (optionnel, pour renommage manuel)
- Body : `{ title: string }`

### DELETE /threads/:id
- Auth requise
- Supprimer le thread et son historique LangGraph associé
- Réponse : 204

---

## Génération automatique du titre

Déclenché après le **premier échange complet** d'une conversation (user message + réponse agent).

```
Appeler le LLM avec :
  "Génère un titre court (5 mots max) pour cette conversation.
   Premier message : {firstUserMessage}
   Première réponse : {firstBotResponseSummary}
   Réponds uniquement avec le titre, sans guillemets."

Mettre à jour Thread.title avec le résultat
```

Stratégie : déclencher ce call de façon asynchrone (non-bloquant pour le stream SSE).

---

## Adaptation de l'agent

À chaque appel du chat stream (`POST /chat`) :

```
Si thread_id fourni :
  → Vérifier que le thread appartient à l'utilisateur
  → Mettre à jour last_message_at
  → Si c'est le premier message → déclencher génération de titre (async)

Si pas de thread_id :
  → Créer un nouveau Thread en base
  → Utiliser son id comme thread_id LangGraph
  → Retourner le thread_id dans les events SSE (event "threadCreated")
```

Nouvel event SSE à ajouter :
```
event: threadCreated
data: { threadId: string, title: string }
```

---

## Stockage de l'historique LangGraph

LangGraph stocke son historique en mémoire (MemorySaver actuellement).
Pour la persistance réelle à travers les sessions, deux options :

1. **Option simple** : PostgresSaver de LangGraph (si disponible pour la version utilisée)
2. **Option manuelle** : À chaque fin de stream, sauvegarder les messages dans une table
   `thread_messages` séparée et les recharger via `chatService.getHistory()`

→ Vérifier si `@langchain/langgraph` expose un PostgresSaver compatible.
→ Si non, utiliser l'option manuelle avec la table `thread_messages`.

---

## Notes

- Le `thread_id` dans `localStorage` du front (`langgraph_thread_id`) devient
  optionnel : c'est maintenant le back qui fait autorité
- Garder la compatibilité : si un `thread_id` est en localStorage sans entrée en base,
  le créer à la volée
