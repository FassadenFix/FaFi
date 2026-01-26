FROM node:18-alpine

# Arbeitsverzeichnis
WORKDIR /app

# Package-Dateien kopieren
COPY package*.json ./

# Dependencies installieren (nur Produktion)
RUN npm ci --only=production

# Anwendung kopieren
COPY . .

# Port freigeben
EXPOSE 3001

# Health-Check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Start
CMD ["node", "server.js"]
