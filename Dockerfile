FROM ubuntu:noble-20260113

RUN apt-get update && apt-get install -y \
    bash \
    jq \
    curl \
    ca-certificates \
    gnupg \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" > /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Update npm to fix vulnerabilities in its bundled dependencies
# (cross-spawn, glob, tar)
RUN npm update -g npm

COPY ./ /app/
WORKDIR /app/

RUN npm ci

# Compile with dev dependencies present, then prune them so the runtime image
# only carries production dependencies before the global CLI install.
RUN npm run compile \
    && npm prune --omit=dev \
    && npm install -g .

RUN mkdir /etc/connector/
WORKDIR /etc/connector/

ENTRYPOINT [ "ndc-oas-lambda" ]
