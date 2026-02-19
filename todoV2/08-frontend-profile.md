# 08 — Frontend : Page Profil

## Objectif

Créer la page Profil permettant à l'utilisateur de renseigner ses informations
personnelles, ses objectifs nutritionnels, et d'accéder aux réglages de l'app.

---

## Checklist

- [ ] Créer `profileStore` (Pinia)
- [ ] Créer `profileService` dans `shared-all`
- [ ] Créer `ProfilePage.vue`
- [ ] Afficher le TDEE calculé automatiquement
- [ ] Déplacer le toggle dark mode ici
- [ ] Déplacer le bouton de déconnexion ici

---

## profileStore (Pinia)

```
state:
  profile: UserProfile | null
  tdee:    number | null
  loading: boolean

actions:
  fetchProfile()           → GET /profile → met à jour state
  updateProfile(data)      → PUT /profile → optimistic update + refetch
```

Chargement : au login (dans `authStore.init()`) et à chaque montage de la page.

---

## Structure de la page — ProfilePage.vue

```
<PageHeader title="MON PROFIL" />

<SectionLabel>INFORMATIONS</SectionLabel>
<AppCard>
  <EditableRow label="Taille"  unit="cm"  v-model="profile.height" />
  <AppDivider />
  <EditableRow label="Poids"   unit="kg"  v-model="profile.weight" />
  <AppDivider />
  <EditableRow label="Âge"     unit="ans" v-model="profile.age" />
</AppCard>

<SectionLabel>OBJECTIFS</SectionLabel>
<AppCard>
  <EditableRow label="Calories" unit="kcal" accent v-model="profile.calorieGoal" />
  <AppDivider />
  <EditableRow label="Protéines" unit="g"  v-model="profile.proteinGoal" />
  <AppDivider />
  <EditableRow label="Glucides"  unit="g"  v-model="profile.carbsGoal" />
  <AppDivider />
  <EditableRow label="Lipides"   unit="g"  v-model="profile.fatGoal" />
</AppCard>

<SectionLabel v-if="tdee">DÉPENSE ESTIMÉE</SectionLabel>
<AppCard v-if="tdee">
  <StatRow label="TDEE estimé"       :value="`${tdee} kcal/j`" />
  <AppDivider />
  <StatRow label="Déficit suggéré"   :value="`−${tdee - profile.calorieGoal} kcal`" accent />
</AppCard>

<SectionLabel>APPARENCE</SectionLabel>
<AppCard>
  <ToggleRow label="Thème sombre" v-model="darkMode" />
</AppCard>

<button class="logout-btn" @click="logout">Déconnexion</button>
```

---

## Composant EditableRow

Ligne de formulaire inline : label à gauche, valeur cliquable à droite.
Au tap sur la valeur → ouvre un bottom sheet avec un `<input type="number">`.
Validation à la fermeture → appelle `profileStore.updateProfile()`.

```
Props:
  label:   string
  unit:    string
  accent:  boolean (valeur affichée en couleur sand)

v-model: number | null

Comportement:
  - Valeur null → affiche "—" en muted
  - Valeur présente → affiche "{value} {unit}" (valeur blanche ou sand si accent)
  - Chevron → à droite en muted
  - Au tap → ouvre BottomSheet avec input numérique
```

---

## BottomSheet (composant réutilisable)

Utilisé aussi dans d'autres pages.

```
Props:
  title:       string
  isOpen:      boolean

Comportement:
  - Slide depuis le bas (transition)
  - Overlay sombre derrière
  - Slot pour le contenu
  - Tap sur overlay → ferme
  - Swipe down → ferme
```

---

## Auto-save

Ne pas avoir de bouton "Sauvegarder" global.
Chaque champ sauvegarde individuellement à la fermeture du BottomSheet.
Feedback visuel : une brève animation de confirmation sur la ligne modifiée.

---

## Notes

- Le TDEE est recalculé et renvoyé par le backend à chaque PUT /profile
- Si height/weight/age sont incomplets → afficher "Renseignez vos infos pour voir votre dépense estimée" à la place du bloc TDEE
- Le bouton Déconnexion garde le pattern double-confirm existant
