FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN npm install --frozen-lockfile

COPY . .

RUN npm run build

EXPOSE 3000

ENV PORT 3000

CMD ["npm", "start"]
