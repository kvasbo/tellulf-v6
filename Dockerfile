FROM node:20

# Copy source to web directory
COPY . /tellulf

# Create health check
HEALTHCHECK --interval=1m --timeout=5s \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["node", "/tellulf/build/Server.js"]