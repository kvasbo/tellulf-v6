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

# Set port
EXPOSE 3000

CMD ["node", "/tellulf/build/Server.js"]
