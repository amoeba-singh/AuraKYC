FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --production

COPY . .

RUN mkdir -p uploads

EXPOSE 8000

ENV NODE_ENV=production

CMD ["node", "main.js"]
