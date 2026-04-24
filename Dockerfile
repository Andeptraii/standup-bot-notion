FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY public ./public
COPY data ./data

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Tạo data directory với permission cho appuser
# (trong production, persistent volume sẽ mount tại /data,
#  nhưng ta cần đảm bảo directory có permission để ghi file)
RUN mkdir -p /data && chmod 777 /data

USER appuser

EXPOSE 3000

CMD ["node", "src/index.js"]
