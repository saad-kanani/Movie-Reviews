FROM node:22-alpine

WORKDIR /app

COPY server/review-service/package*.json ./

RUN npm install

COPY server/review-service/ ./
COPY server/proto ./proto

EXPOSE 5003

CMD ["npm", "run", "start"]
