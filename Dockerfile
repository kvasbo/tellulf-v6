FROM node:19-buster-slim

# Create temp dir
RUN mkdir /tellulf
WORKDIR /tellulf

# Copy source to web directory
COPY ./ /tellulf

# Run NPM stuff
RUN yarn
RUN yarn run build

# Set port
EXPOSE 3000

CMD ["node", "build/index.js"]
