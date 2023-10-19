FROM node:latest

# Create app directory
RUN mkdir -p /tellulf
WORKDIR /tellulf
COPY . /tellulf

RUN ls -l

# Install dependencies and build
RUN yarn && yarn build

# Smoke test
RUN node /app/dist/test.js

# Copy source to web directory
# COPY . /tellulf

# Create health check
HEALTHCHECK --interval=1m --timeout=5s \
  CMD curl -f http://localhost:3000/ || exit 1


WORKDIR /tellulf

CMD ["yarn", "start"]