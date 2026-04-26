FROM node:22-alpine

WORKDIR /app

COPY server/movie-service/package*.json ./

RUN npm install

COPY server/movie-service/ ./
COPY server/proto ./proto

EXPOSE 5002

CMD ["npm", "run", "start"]
