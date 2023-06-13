FROM node:20.3-alpine

# Create temp dir
RUN mkdir /tellulf

# Copy source to web directory
COPY . /tellulf

WORKDIR /tellulf

# Run NPM stuff
RUN yarn install --production --ignore-scripts
# RUN yarn run lint
# RUN yarn run build

# Set port
EXPOSE 3000

CMD ["node", "/tellulf/build/Server.js"]
