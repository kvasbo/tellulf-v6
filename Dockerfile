FROM php:8.0-apache-buster

COPY ./src/* /var/www/html

EXPOSE 80

WORKDIR /var/www/html

RUN mkdir twig-cache

CMD ["/usr/sbin/apache2ctl", "-D", "FOREGROUND"]