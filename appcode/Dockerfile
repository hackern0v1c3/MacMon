FROM node:lts

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080 8443

RUN apt-get update && \
  apt-get install -y nmap dsniff arp-scan

CMD [ "npm", "start" ]