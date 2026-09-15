FROM node:alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . /app

EXPOSE 5173

CMD CMD ["npm", "run", "dev", "--", "--host"]