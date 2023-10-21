FROM node:20

# Create app directory
RUN mkdir -p /tellulf
WORKDIR /tellulf
COPY . /tellulf

RUN ls -l

# Install dependencies and build
RUN yarn
RUN yarn run build

# Smoke test
RUN yarn run test

# Create health check
HEALTHCHECK --interval=1m --timeout=5s \
  CMD curl -f http://localhost:3000/ || exit 1


WORKDIR /tellulf

CMD ["yarn", "start"]