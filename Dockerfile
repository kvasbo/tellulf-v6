FROM node:20-buster-slim

# Create temp dir
RUN mkdir /tellulf

# Copy source to web directory
COPY . /tellulf

WORKDIR /tellulf

# Run Yarn stuff
RUN yarn install
RUN npx tsc --p tsconfig.server.json
RUN npx tsc --p tsconfig.client.json
RUN npx sass sass:assets/css

# Set port
EXPOSE 3000

CMD ["node", "/tellulf/build/Server.js"]
