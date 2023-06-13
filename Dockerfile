FROM node:20.3-alpine

# Create temp dir
RUN mkdir /tellulf

# Set port
EXPOSE 3000

# Copy source to web directory
COPY . /tellulf

CMD ["node", "/tellulf/build/Server.js"]
