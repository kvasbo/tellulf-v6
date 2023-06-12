# Only works with Github Actions as defined in this repos .github/workflows/build.yml

FROM node:20-buster-slim

# Create temp dir
RUN mkdir /tellulf

# Copy source to web directory
# COPY . /tellulf

WORKDIR /tellulf

COPY ./node_modules /tellulf/node_modules
COPY ./build /tellulf/build
COPY ./assets/css /tellulf/assets/css
COPY ./assets/js /tellulf/assets/js

# Run Yarn stuff
# RUN yarn install
# RUN npx tsc --p tsconfig.server.json
# RUN npx tsc --p tsconfig.client.json
# RUN npx sass sass:assets/css

# Set port
EXPOSE 3000

CMD ["node", "/tellulf/build/Server.js"]
