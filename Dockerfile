FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY public ./public
COPY data ./data
COPY entrypoint.sh ./entrypoint.sh

RUN chmod +x ./entrypoint.sh

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Tạo data directory với permission
RUN mkdir -p /data && chmod 777 /data

USER appuser

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
