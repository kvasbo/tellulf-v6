FROM node:20.3-alpine

# Create temp dir
RUN mkdir /tellulf

WORKDIR /tellulf

# Copy source to web directory
COPY . /tellulf

# Install production dependencies, could probably be moved to CI but kept here for binary compatibility
# RUN yarn install --production --ignore-scripts

RUN ls -la /tellulf

# Set port
EXPOSE 3000

CMD ["node", "/tellulf/build/Server.js"]
