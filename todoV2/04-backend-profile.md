# 04 — Backend : UserProfile

## Objectif

Persister le profil personnel de l'utilisateur (taille, poids, âge, objectifs nutritionnels)
en base de données et exposer une API REST pour le lire et le mettre à jour.

---

## Checklist

- [ ] Créer l'entité TypeORM `UserProfile`
- [ ] Créer la migration associée
- [ ] Créer le repository `UserProfileRepository`
- [ ] Créer le service `UserProfileService`
- [ ] Créer le router Express `profileRouter`
- [ ] Brancher le router dans `app.ts`
- [ ] Calculer le TDEE automatiquement côté backend

---

## Entité TypeORM — UserProfile

Table : `user_profile`
Relation : One-to-One avec `User` (userId = FK + PK)

```
Colonnes :
  user_id       UUID     PK, FK → users.id, ON DELETE CASCADE
  height        FLOAT    nullable
  weight        FLOAT    nullable
  age           INT      nullable
  calorie_goal  INT      nullable
  protein_goal  INT      nullable
  carbs_goal    INT      nullable
  fat_goal      INT      nullable
  updated_at    TIMESTAMP  auto-update
```

---

## Calcul TDEE (côté service)

Formule Mifflin-St Jeor (si height + weight + age renseignés) :

```
BMR (homme) = 10 × poids(kg) + 6.25 × taille(cm) − 5 × âge + 5
BMR (femme) = 10 × poids(kg) + 6.25 × taille(cm) − 5 × âge − 161

TDEE = BMR × 1.55 (activité modérée par défaut)
```

Le TDEE est calculé à la volée et retourné dans la réponse GET, pas stocké en base.

---

## Endpoints API

### GET /profile

- Auth requise (JWT middleware)
- Si profil inexistant → créer un profil vide et le retourner
- Réponse :
    ```
    UserProfile + { tdee: number | null }
    ```

### PUT /profile

- Auth requise
- Body : `UpdateProfileRequest` (champs partiels)
- Validation Zod du body
- Upsert en base
- Réponse : profil mis à jour + tdee recalculé

---

## Notes

- Créer le profil vide automatiquement au premier GET (pattern upsert lazy)
  plutôt qu'à la création du compte, pour ne pas bloquer le register
- Le champ `gender` n'est pas demandé par l'utilisateur pour l'instant,
  donc le TDEE utilisera uniquement la formule neutre (moyenne homme/femme)
  ou on laisse `tdee: null` si les données sont incomplètes
