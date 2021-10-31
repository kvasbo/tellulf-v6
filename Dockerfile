FROM php:8.0-apache

# install ZIP
RUN apt-get -y update \
 && apt-get -y autoremove \
 && apt-get clean \
 && apt-get install -y zip \
 && rm -rf /var/lib/apt/lists/*

# ADD Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy source
COPY ./src/* /var/www/html/

# Set workdir
WORKDIR /var/www/html

# Install dependencies
RUN composer install --no-dev

# Create twig cache dir
RUN mkdir twig-cache

# Set port
EXPOSE 80

CMD ["/usr/sbin/apache2ctl", "-D", "FOREGROUND"]