FROM node:22-alpine

WORKDIR /app

COPY server/gateway/package*.json ./

RUN npm install

COPY server/gateway/ ./
COPY server/proto ./proto

EXPOSE 3000

CMD ["npm", "run", "start"]