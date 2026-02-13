FROM ghcr.io/hasura/ndc-nodejs-lambda:v1.20.2

COPY --chown=hasura:hasura package-lock.json package.json api.ts /functions/

WORKDIR /functions
RUN --mount=type=cache,target=/home/hasura/.npm,uid=1000,gid=1000 \
    npm ci

COPY --chown=hasura:hasura ./ /functions
