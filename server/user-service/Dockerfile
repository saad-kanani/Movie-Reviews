FROM node:22-alpine

WORKDIR /app

COPY server/user-service/package*.json ./

RUN npm install

COPY server/user-service/ ./
COPY server/proto ./proto

EXPOSE 5001

CMD ["npm", "run", "start"]
