FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
ENV BROWSER=none
ENV CI=true
CMD ["npm", "start"]
