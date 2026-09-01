FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npx", "tsx", "src/index.ts"]
