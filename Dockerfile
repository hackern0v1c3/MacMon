#start with node container
FROM node:lts

#Labels
LABEL maintainer="macmondev@gmail.com"

#create mysql environment based on here https://github.com/docker-library/mysql/blob/696fc899126ae00771b5d87bdadae836e704ae7d/8.0/Dockerfile
RUN groupadd -r mysql && useradd -r -g mysql mysql

RUN apt-get update && apt-get install -y --no-install-recommends gnupg dirmngr && rm -rf /var/lib/apt/lists/*

# Add Tini
ENV TINI_VERSION v0.18.0
RUN wget -O /tini "https://github.com/krallin/tini/releases/download/$TINI_VERSION/tini-$(dpkg --print-architecture)"
RUN chmod +x /tini

# Add Gosu
RUN apt-get update && apt-get install -y --no-install-recommends gosu && rm -rf /var/lib/apt/lists/*

RUN mkdir /docker-entrypoint-initdb.d

RUN apt-get update && apt-get install -y --no-install-recommends \
	pwgen \
	openssl \
	perl \
  && rm -rf /var/lib/apt/lists/*

RUN { \
		echo mariadb-server mysql-server/data-dir select ''; \
		echo mariadb-server mysql-server/root-pass password 'unused'; \
		echo mariadb-server mysql-server/re-root-pass password 'unused'; \
		echo mariadb-server mysql-server/remove-test-db select true; \
	} | debconf-set-selections \
	&& apt-get update && apt-get install -y mariadb-server && rm -rf /var/lib/apt/lists/*

RUN sed -ri 's/^user\s/#&/' /etc/mysql/my.cnf /etc/mysql/conf.d/*;

RUN	rm -rf /var/lib/mysql \
	&& mkdir -p /var/lib/mysql /var/run/mysqld \
	&& chown -R mysql:mysql /var/lib/mysql /var/run/mysqld \
  && chmod 777 /var/run/mysqld \
	&& echo '[mysqld]\nskip-host-cache\nskip-name-resolve' > /etc/mysql/conf.d/docker.cnf

RUN find /etc/mysql/ -name '*.cnf' -print0 \
		| xargs -0 grep -lZE '^(bind-address|log)' \
		| xargs -rt -0 sed -Ei 's/^(bind-address|log)/#&/';

#Setup macmon
ARG DB_ADDRESS=127.0.0.1
ARG DB_PORT=3306
ARG DB_NAME=AssetTracking
ARG DB_USER=AssetTrackingUser
ARG LOG_LEVEL=production
ARG HTTPS_PORT=8443
ARG RUN_AS=node
ARG NO_LOCAL_DB=false
ARG HASH_STRENGTH=10

ENV DB_ADDRESS="${DB_ADDRESS}"
ENV DB_PORT="${DB_PORT}"
ENV DB_NAME="${DB_NAME}"
ENV DB_USER="${DB_USER}"
ENV LOG_LEVEL="${LOG_LEVEL}"
ENV HTTPS_PORT="${HTTPS_PORT}"
ENV RUN_AS="${RUN_AS}"
ENV NO_LOCAL_DB="${NO_LOCAL_DB}"
ENV HASH_STRENGTH="${HASH_STRENGTH}"

ENV VERSION="0.16"
 
RUN apt-get update && \
  apt-get install -y --no-install-recommends \
	nmap \
	arp-scan \
	python3-pip \
	python3-setuptools \
	python3-dev \
	libcap2-bin \
	&& rm -rf /var/lib/apt/lists/*

RUN setcap cap_net_bind_service=+ep `readlink -f \`which node\``

RUN pip3 install scapy

RUN chmod u+s /usr/bin/arp-scan

RUN pip3 install pyinstaller

WORKDIR /tmp

COPY ./appcode/bin/dos.py ./dos.py

RUN pyinstaller --onefile --hidden-import=queue /tmp/dos.py 

WORKDIR /usr/src/app

COPY ./appcode/package*.json ./

RUN npm install

COPY ./appcode .

COPY ./appcode/private/config.example ./private/config.json

RUN chown -R node:node /usr/src/app

RUN cp /tmp/dist/dos /usr/src/app/bin/

RUN chown root:root /usr/src/app/bin/dos

RUN chmod 755 /usr/src/app/bin/dos

RUN chmod u+s /usr/src/app/bin/dos

RUN rm -rf /tmp/*

VOLUME [ "/var/lib/mysql", "/usr/src/app/private" ]

ENTRYPOINT [ "/tini", "--", "/usr/src/app/docker-entrypoint.sh" ]

CMD [ "npm", "start" ]