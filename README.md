
# Lancement du serveur

## Étapes pour lancer le serveur backend (dans `dev_backend`)

1. Installer les dépendances  
   ```bash
   pnpm install
   ```
2. Générer le client Prisma  
   ```bash
   npx prisma migrate dev --name init
   ```
3. Démarrer le serveur en mode développement  
   ```bash
   pnpm dev
   ```

---
      
## Étapes pour lancer le frontend (dans `dev_front`)

<<<<<<< HEAD
## Étapes pour lancer le front (dans `dev_front`)

=======
>>>>>>> origin/fullstack
1. Installer les dépendances  
   ```bash
   pnpm install
   ```
<<<<<<< HEAD
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

Dans player-select.ts/setupPlayerSelect() => GET guests / POST guest

Une fois que la logique game / front sera établie: POST les stats du guest et POST les stats du match dans historique

Une fois que dashboard sera fait: GET toutes les stats du guest et historique des matchs. (En attendant tu peux déjà setup toutes les variables des stats dans un fichier dashboard.ts et je ferai l'affichage)

Une fois que l'avatar sera setup: GET l'avatar


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
=======
2. Démarrer le serveur en mode développement    
   ```bash
   pnpm run dev
   ```
>>>>>>> origin/fullstack
