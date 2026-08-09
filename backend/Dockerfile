FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npm run db:migrate && npm run db:seed && node dist/src/main.js"]