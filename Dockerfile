# Base stage
FROM node:10 as base
WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install

# Build stage
FROM base as builder
WORKDIR /usr/src/app
COPY app.js .
COPY dataProcess.js .
COPY db.js .
COPY index.html .
COPY webpack.config.js .
RUN npm run build

# Production stage
FROM node:10
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production
COPY --from=builder /usr/src/app/dist ./
EXPOSE 3000
ENTRYPOINT ["node","./bundle.js"]