FROM ubuntu:noble-20260113

RUN apt-get update && apt-get install -y \
    bash \
    jq \
    curl \
    ca-certificates \
    gnupg \
    && dpkg --compare-versions "$(dpkg-query -W -f='${Version}' ca-certificates)" ge 20260816ubuntu0.24.04.1 \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_24.x nodistro main" > /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y nodejs \
    && node -e 'if (Number(process.versions.node.split(".")[0]) !== 24) process.exit(1)' \
    && dpkg --compare-versions "$(node --version | sed 's/^v//')" ge 24.22.1 \
    && rm -rf /var/lib/apt/lists/*

# Update npm to fix vulnerabilities in its bundled dependencies
# (cross-spawn, glob, tar). npm bundles undici 6.29.0 (CVE-2026-109869);
# swap in the patched 6.29.1 until npm ships it (same as ndc-nodejs-lambda).
RUN npm update -g npm \
    && NPM_UNDICI="$(npm root -g)/npm/node_modules/undici" \
    && cd /tmp && npm pack undici@6.29.1 --silent \
    && rm -rf "$NPM_UNDICI" && mkdir "$NPM_UNDICI" \
    && tar -xzf undici-6.29.1.tgz -C "$NPM_UNDICI" --strip-components=1 \
    && rm undici-6.29.1.tgz && cd / \
    && node -e "if (require('$NPM_UNDICI/package.json').version !== '6.29.1') process.exit(1)"

# Patched Node and the OS store are independent trust inputs; retain OS trust selection.
ENV NODE_OPTIONS="--no-experimental-strip-types --use-openssl-ca" \
    SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt \
    SSL_CERT_DIR=/etc/ssl/certs

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
