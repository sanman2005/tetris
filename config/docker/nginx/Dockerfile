FROM nginx:alpine

WORKDIR /etc/nginx/conf.d
COPY ./config/docker/nginx/tetris.conf ./default.conf

WORKDIR /var/www/app
COPY ./build .

EXPOSE 80
