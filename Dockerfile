FROM node:22-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm ci --only=production

# Copiar código-fonte
COPY src ./src
COPY tsconfig.json ./

# Build TypeScript
RUN npm run build

# Generate Prisma client
RUN npx prisma generate

# Remover src para reduzir tamanho da imagem
RUN rm -rf src

# Comando padrão
CMD ["node", "dist/index.js"]
