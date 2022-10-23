FROM caddy:2.4.6

# these paths are relative to the project root, not this folder
ADD caddy/Caddyfile /etc/caddy/Caddyfile

RUN mkdir -p /data/caddy; \
    addgroup -g 101 -S caddyUser; \
    adduser -u 101 -D -S -G caddyUser caddyUser; \ 
    chown =R caddyUser:caddyUser /data 

ENV XDG_DATA_HOME=/data
# Extract website (avoid ADD: unpredictable, and seems not to extract on CI/CD server July 2022)
# Note: this does leave behind the extar tar.gz file in a layer
COPY frontend.tar.gz /var/www/
RUN cd /var/www/ && tar -xzf frontend.tar.gz && rm frontend.tar.gz
