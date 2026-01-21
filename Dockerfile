# Utiliser Node.js 20 LTS
FROM node:20-alpine

# Créer le répertoire de l'application
WORKDIR /app

# Copier les fichiers package
COPY package*.json ./

# Installer les dépendances
RUN npm install --production

# Copier le reste de l'application
COPY . .

# Démarrer l'application
CMD ["node", "server/server.js"]