FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY public ./public
COPY data ./data

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Tạo thư mục data với quyền cho appuser (cho Railway persistent volume)
RUN mkdir -p /data && chown -R appuser:appgroup /data

USER appuser

EXPOSE 3000

CMD ["node", "src/index.js"]
