
# Lancement du serveur

## Étapes pour lancer le serveur (dans `dev_backend`)

1. Installer les dépendances  
   ```bash
   pnpm install
   ```
2. Générer le client Prisma  
   ```bash
   npx prisma generate
   ```
3. Démarrer le serveur en mode développement  
   ```bash
   pnpm dev
   ```

---

## Étapes pour lancer le front (dans `dev_front`)

1. Installer les dépendances  
   ```bash
   pnpm install
   ```
2. Démarrer le serveur en mode développement  
   ```bash
   pnpm run dev
   ```

---

## Structure des fichiers typescript dans `dev_front/src/tsc`

animation.ts : fonctions d'animations du UI

main.ts: fonction main appelée par index.html qui initialise le UIManager et lance les boucles d'interactions

player-select.ts : gestion des boîtes de sélection de joueur (ou IA)

tournament.ts: gestion des tournois, écrans et logique de match-making

ui-manager.ts: définition de la classe ui-manager qui contient les éléments de UI afin de les utiliser dans les autres fichiers

views.ts: setup des évènements liées à chaque vue

---

## API calls à setup

Dans views.ts/setupLoginEvents() => api login

Dans views.ts/setupSignUpEvents() => api create profile






---
## Routes à implémenter

### Users

- `PUT /users/change-username` ?

### Guest

- `DELETE /guest/:id/delete`

### Stats

 - `A Faire`

### Match History

 - `A Faire`