
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

1. Installer les dépendances  
   ```bash
   pnpm install
   ```
2. Démarrer le serveur en mode développement    
   ```bash
   pnpm run dev
   ```
