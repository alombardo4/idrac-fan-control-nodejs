FROM node:16-alpine

ADD . .

RUN npm ci && npm run build && npm ci --only=production

RUN apk add --no-cache ipmitool

CMD ["node" , "--enable-source-maps", "dist/main.js"]