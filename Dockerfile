FROM node:20 AS base

FROM base AS deps
WORKDIR /astro-script-embed
COPY package*.json ./
RUN npm i

# Copy over node modules for dev
FROM deps AS dev
WORKDIR /astro-script-embed
COPY --from=deps /astro-script-embed/node_modules ./node_modules
COPY . .
