# 02 — Navigation

## Objectif

Remplacer le layout scroll-snap horizontal 3 colonnes par une bottom navigation bar
avec 5 pages en vue-router. Structurer l'arborescence des pages.

---

## Checklist

- [ ] Configurer vue-router avec les 5 routes principales
- [ ] Supprimer le layout scroll-snap dans `App.vue`
- [ ] Créer le composant `BottomNav.vue`
- [ ] Créer les shells vides des 5 pages
- [ ] Gérer la redirection auth (non connecté → Login)
- [ ] Adapter `App.vue` pour le nouveau layout

---

## Structure des routes

```
/               → redirect vers /dashboard (si auth) ou /login
/login          → Login.vue
/register       → Register.vue
/dashboard      → DashboardPage.vue       (onglet Home)
/chat           → ChatPage.vue            (onglet Chat)
/chat/:threadId → ChatPage.vue            (conversation spécifique)
/library        → LibraryPage.vue         (onglet Bibliothèque)
/journal        → JournalPage.vue         (onglet Journal)
/journal/:date  → JournalPage.vue         (jour spécifique, format YYYY-MM-DD)
/profile        → ProfilePage.vue         (onglet Profil)
```

---

## Layout App.vue (nouveau)

```
<template>
  <div id="app">

    <!-- Pas authentifié -->
    <RouterView v-if="!auth.isAuthenticated" />

    <!-- Authentifié -->
    <template v-else>
      <main class="page-content">
        <RouterView />
      </main>
      <BottomNav :activePage="currentPage" />
    </template>

  </div>
</template>
```

CSS du layout :

```
#app           → height: 100dvh, display: flex, flex-direction: column
.page-content  → flex: 1, overflow-y: auto, padding-bottom: 72px (hauteur bottom nav)
BottomNav      → position: fixed, bottom: 0, width: 100%
```

---

## BottomNav.vue

5 onglets avec icônes Lucide :

```
Home        → icône LayoutDashboard  → route /dashboard
Chat        → icône MessageCircle    → route /chat
Bibliothèque→ icône BookOpen         → route /library
Journal     → icône CalendarDays     → route /journal
Profil      → icône User             → route /profile
```

Comportement :

- Lire `useRoute().name` pour déterminer l'onglet actif
- Onglet actif : icône couleur accent + petit dot sand centré en dessous
- Onglets inactifs : icône couleur muted
- Tap → `router.push(route)`
- Hauteur fixe 56px + safe area iOS en bas (`padding-bottom: env(safe-area-inset-bottom)`)

---

## Guard de navigation

Dans `router/index.ts` :

```
beforeEach:
  si route nécessite auth ET utilisateur non connecté
    → redirect /login
  si route /login ou /register ET utilisateur connecté
    → redirect /dashboard
```

---

## Pages à créer (shells vides)

Chaque page = un composant minimal avec juste un `<h1>` pour commencer.
Elles seront enrichies dans les étapes 11 à 15.

- `pages/DashboardPage.vue`
- `pages/ChatPage.vue` (reprend l'essentiel de `Chat.vue` actuel)
- `pages/LibraryPage.vue` (reprend l'essentiel de `Library.vue` actuel)
- `pages/JournalPage.vue` (nouvelle)
- `pages/ProfilePage.vue` (nouvelle)
