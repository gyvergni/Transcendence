
# Lancement du serveur

## Étapes pour lancer le serveur (dans `dev_backend`)

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

## Routes à implémenter

### Users

- `PUT /users/change-username` ?

### Guest

- `DELETE /guest/:id/delete`

### Stats

 - `A Faire`

### Match History

 - `A Faire`