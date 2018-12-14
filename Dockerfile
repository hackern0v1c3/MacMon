#start with node container
FROM node:lts

#Labels
LABEL maintainer="admin@hackernovice.com"

#create mysql environment based on here https://github.com/docker-library/mysql/blob/696fc899126ae00771b5d87bdadae836e704ae7d/8.0/Dockerfile
RUN groupadd -r mysql && useradd -r -g mysql mysql

RUN apt-get update && apt-get install -y --no-install-recommends gnupg dirmngr && rm -rf /var/lib/apt/lists/*

ENV GOSU_VERSION 1.7

RUN set -x \
	&& apt-get update && apt-get install -y --no-install-recommends ca-certificates wget && rm -rf /var/lib/apt/lists/* \
	&& wget -O /usr/local/bin/gosu "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$(dpkg --print-architecture)" \
	&& wget -O /usr/local/bin/gosu.asc "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$(dpkg --print-architecture).asc" \
	&& export GNUPGHOME="$(mktemp -d)" \
	&& gpg --batch --keyserver ha.pool.sks-keyservers.net --recv-keys B42F6819007F00F88E364FD4036A9C25BF357DD4 \
	&& gpg --batch --verify /usr/local/bin/gosu.asc /usr/local/bin/gosu \
	&& gpgconf --kill all \
	&& rm -rf "$GNUPGHOME" /usr/local/bin/gosu.asc \
	&& chmod +x /usr/local/bin/gosu \
	&& gosu nobody true \
  && apt-get purge -y --auto-remove ca-certificates wget

RUN mkdir /docker-entrypoint-initdb.d

RUN apt-get update && apt-get install -y --no-install-recommends \
	pwgen \
	openssl \
	perl \
  && rm -rf /var/lib/apt/lists/*

RUN set -ex; \
	key='A4A9406876FCBD3C456770C88C718D3B5072E1F5'; \
	export GNUPGHOME="$(mktemp -d)"; \
	gpg --batch --keyserver ha.pool.sks-keyservers.net --recv-keys "$key"; \
	gpg --batch --export "$key" > /etc/apt/trusted.gpg.d/mysql.gpg; \
	gpgconf --kill all; \
	rm -rf "$GNUPGHOME"; \
	apt-key list > /dev/null

ENV MYSQL_MAJOR 8.0
ENV MYSQL_VERSION 8.0.13-1debian9

RUN echo "deb http://repo.mysql.com/apt/debian/ stretch mysql-${MYSQL_MAJOR}" > /etc/apt/sources.list.d/mysql.list

RUN { \
		echo mysql-community-server mysql-community-server/data-dir select ''; \
		echo mysql-community-server mysql-community-server/root-pass password ''; \
		echo mysql-community-server mysql-community-server/re-root-pass password ''; \
		echo mysql-community-server mysql-community-server/remove-test-db select false; \
	} | debconf-set-selections \
	&& apt-get update && apt-get install -y mysql-community-client="${MYSQL_VERSION}" mysql-community-server-core="${MYSQL_VERSION}" && rm -rf /var/lib/apt/lists/* \
	&& rm -rf /var/lib/mysql && mkdir -p /var/lib/mysql /var/run/mysqld \
	&& chown -R mysql:mysql /var/lib/mysql /var/run/mysqld \
  && chmod 777 /var/run/mysqld

COPY mysql_config/ /etc/mysql/

#Setup macmon
ARG DB_ADDRESS=127.0.0.1
ARG DB_PORT=3306
ARG DB_NAME=AssetTracking
ARG DB_USER=AssetTrackingUser
ARG LOG_LEVEL=production
ARG HTTPS_PORT=443
ARG RUN_AS=node
ARG NO_LOCAL_DB=false

ENV DB_ADDRESS="${DB_ADDRESS}"
ENV DB_PORT="${DB_PORT}"
ENV DB_NAME="${DB_NAME}"
ENV DB_USER="${DB_USER}"
ENV LOG_LEVEL="${LOG_LEVEL}"
ENV HTTPS_PORT="${HTTPS_PORT}"
ENV RUN_AS="${RUN_AS}"
ENV NO_LOCAL_DB="${NO_LOCAL_DB}"
 
RUN apt-get update && \
  apt-get install -y --no-install-recommends \
	nmap \
	dsniff arp-scan \
	&& rm -rf /var/lib/apt/lists/*

RUN chmod u+s /usr/bin/arp-scan

WORKDIR /usr/src/app

COPY ./appcode/package*.json ./

RUN npm install

COPY ./appcode .

RUN chown -R node:node /usr/src/app

VOLUME [ "/var/lib/mysql", "/usr/src/app/private" ]

ENTRYPOINT [ "/usr/src/app/docker-entrypoint.sh" ]

CMD [ "npm", "start" ]