FROM node:20-buster-slim

# Create temp dir
RUN mkdir /tellulf

# Copy source to web directory
COPY . /tellulf

WORKDIR /tellulf

# Run Yarn stuff
RUN yarn
RUN yarn run lint
RUN npx tsc --p tsconfig.server.json
RUN npx tsc --p tsconfig.client.json
RUN npx sass sass:assets/css

# RUN yarn run build
# "yarn run lint && npx tsc --p tsconfig.server.json && npx tsc --p tsconfig.client.json && npx sass sass:assets/css",

# Set port
EXPOSE 3000

CMD ["node", "/tellulf/build/Server.js"]
