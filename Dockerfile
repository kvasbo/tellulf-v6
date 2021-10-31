FROM php:8.0-apache

# install ZIP
RUN apt-get -y update \
 && apt-get -y autoremove \
 && apt-get clean \
 && apt-get install -y zip nodejs npm \
 && rm -rf /var/lib/apt/lists/*

# ADD Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Create temp dir
RUN mkdir /tellulf-temp
WORKDIR /tellulf-temp

# Copy source to web directory
COPY ./ /tellulf-temp

# Install dependencies
RUN composer install --no-dev

# Run NPM stuff
RUN npm install --global yarn
RUN yarn
RUN yarn run sass

# Clean target and move content
RUN rm -rf /var/www/html/*
RUN mv /tellulf-temp/src/* /var/www/html/

# WORKDIR /var/www/html

# Set port
EXPOSE 80

CMD ["/usr/sbin/apache2ctl", "-D", "FOREGROUND"]