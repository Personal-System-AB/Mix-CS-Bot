FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY src ./src
COPY tsconfig.json ./

RUN npm run build
RUN npx prisma generate
RUN npm prune --omit=dev

CMD ["npm", "start"]