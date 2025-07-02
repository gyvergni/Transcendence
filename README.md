
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

## Routes à implémenter

### Users

- `GET /users/:username`
- `PUT /users/change-username`

### Guest

- `GET /guest/:username?guestname=`
- `DELETE /guest/:id/delete`


### Stats

### Match History