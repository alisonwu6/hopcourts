FROM node:20
ARG NODE_ENV=development
ENV NODE_ENV=$NODE_ENV
WORKDIR /app
COPY package*.json ./
RUN npm install --include=dev
RUN apt-get update && apt-get install -y ffmpeg
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
