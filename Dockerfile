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

# Tạo data directory với full permissions
RUN mkdir -p /data && chmod 777 /data && chmod a+rwx /data

# Chủ sở hữu của /data là root, nhưng everyone có write access
# (Điều này cần thiết vì persistent volume được mount as root)

USER appuser

EXPOSE 3000

CMD ["node", "src/index.js"]
