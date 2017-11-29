FROM alpine:3.6

# greet me :)
MAINTAINER Tobias Rös - <roes@amicaldo.de>

# install dependencies
RUN apk update && apk add \
  bash \
  nodejs \
  nodejs-npm \
  nginx \
  redis


# remove default content
RUN rm -R /var/www/*

# create directory structure
RUN mkdir -p /etc/nginx
RUN mkdir -p /run/nginx
RUN mkdir -p /etc/nginx/global
RUN mkdir -p /var/www/html

# touch required files
RUN touch /var/log/nginx/access.log && touch /var/log/nginx/error.log

# install vhost config
ADD ./config/vhost.conf /etc/nginx/conf.d/default.conf

# install webroot files
ADD ./ /var/www/html/

# install bower dependencies
RUN npm install -g yarn handlebars && cd /var/www/html/ && yarn install

# precompile elephant templates
RUN cd /var/www/html/ && handlebars elephants/*/*.hbs -f elephants/elephants.tpl.js

EXPOSE 80
EXPOSE 443

RUN chmod +x /var/www/html/config/run.sh
ENTRYPOINT ["/var/www/html/config/run.sh"]