FROM node:20

# Create temp dir
# RUN mkdir /tellulf

# Copy source to web directory
COPY . /tellulf

CMD ["node", "/tellulf/build/Server.js"]