FROM node:22-alpine

RUN apk add --no-cache git

WORKDIR /app

COPY . .

RUN if [ -f yarn.lock ]; then yarn install; elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install; elif [ -f package-lock.json ]; then npm ci || npm install; else npm install; fi

RUN if [ -f yarn.lock ]; then yarn build; elif [ -f pnpm-lock.yaml ]; then pnpm build; else npm run build; fi

EXPOSE 3000

RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "3000"]
