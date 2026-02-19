# 01 — Design System

## Objectif
Remplacer le CSS scoped custom actuel par Tailwind CSS v4 avec un design system cohérent.
Définir les tokens, la typographie et les composants atomiques réutilisables.

---

## Checklist

- [ ] Installer Tailwind CSS v4 + plugin Vite dans `apps/front`
- [ ] Supprimer `style.css` actuel (variables CSS custom) et migrer les tokens vers Tailwind
- [ ] Installer Lucide Vue pour les icônes
- [ ] Définir les tokens de design
- [ ] Créer les composants atomiques de base

---

## Tokens de design

### Couleurs (à déclarer dans `tailwind.config`)

```
background:   #09090B  (--color-bg)
surface:      #111111  (--color-surface)
border:       #222222  (--color-border)
accent:       #D4B896  (--color-accent)
text-primary: #EFEFEF  (--color-text)
text-muted:   #555555  (--color-muted)
```

### Typographie

```
font-family: "Geist", "Neue Haas Grotesk", system-ui
font-size scale: xs(11) sm(13) base(15) lg(18) xl(24) 2xl(32) 3xl(48)
font-weight: normal(400) medium(500) semibold(600)
letter-spacing: tight(-0.02em) normal(0) wide(0.08em) wider(0.12em)
```

### Espacements

```
Padding cards:     16px / 20px
Gap entre cards:   12px
Padding pages:     20px horizontal
Border radius:     6px (cards), 4px (inputs), 2px (pills)
Border width:      1px hairline partout
```

---

## Composants atomiques à créer

### `AppCard.vue`
Wrapper de carte : fond `surface`, border `border`, radius 6px.
Props : `noPadding` (boolean).

### `AppButton.vue`
Variantes :
- `ghost` : border hairline sand, texte sand, fond transparent
- `muted` : texte muted, pas de border
- `danger` : texte rouge muted

### `AppInput.vue`
Input texte : fond `surface`, border `border`, focus border accent sand.
Props : `placeholder`, `modelValue`.

### `AppDivider.vue`
`<hr>` hairline `border-color: border`.

### `AppToggle.vue`
Toggle switch custom : thumb sand sur track dark.

### `SectionLabel.vue`
Label de section en uppercase spacé, taille xs, couleur accent sand.
Exemple : "INFORMATIONS", "OBJECTIFS".

### `BottomNav.vue`
Barre de navigation fixe en bas. 5 icônes Lucide.
Props : `activePage` (enum: home | chat | library | journal | profile).
Icône active : couleur accent + dot sand dessous. Autres : muted.

---

## Migration du CSS existant

Pour chaque composant `.vue` existant :
1. Supprimer le bloc `<style scoped>`
2. Remplacer les classes custom par des classes Tailwind
3. Conserver la logique template/script intacte

Ordre de migration recommandé : commencer par les composants les plus simples
(UserMessage, ToolStatus, MarkdownRenderer) puis remonter vers les pages.

---

## Dark mode

Tailwind v4 gère le dark mode via `data-theme="dark"` sur `<html>`.
Le composable `useDarkMode` existant reste inchangé.
Déclarer les variantes dark dans la config Tailwind.
