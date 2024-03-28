FROM node:20

COPY ./ /app/
WORKDIR /app/

RUN npm install
RUN npm run install-bin

RUN mkdir /etc/connector/
WORKDIR /etc/connector/

ENTRYPOINT [ "oas" ]