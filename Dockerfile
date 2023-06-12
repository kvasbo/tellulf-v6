FROM node:20-buster-slim

# Create temp dir
RUN mkdir /tellulf

# Copy source to web directory
COPY . /tellulf

WORKDIR /tellulf

# Run Yarn stuff
RUN yarn
RUN yarn run lint
RUN yarn run build

# Switch Yarn to production mode
RUN rm -rf node_modules
RUN yarn cache clean
RUN yarn install --production

# Set port
EXPOSE 3000

CMD ["node", "/tellulf/build/Server.js"]
