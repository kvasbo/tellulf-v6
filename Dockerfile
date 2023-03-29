FROM node:19-buster-slim

# Create temp dir
RUN mkdir /tellulf

# Copy source to web directory
COPY . /tellulf

WORKDIR /tellulf

# Run NPM stuff
RUN yarn
RUN yarn run build

# Set port
EXPOSE 3000

CMD ["node", "build/Server.js"]
