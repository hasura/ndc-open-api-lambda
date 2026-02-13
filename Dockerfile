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

COPY ./ /app/
WORKDIR /app/

RUN npm install

# we use unsafe install because we have ignored all the test files to keep the image size small
# the test files are not needed in the production image
# therefore, please ensure that the tests are green before building the image
RUN npm run install-bin-unsafe

RUN mkdir /etc/connector/
WORKDIR /etc/connector/

ENTRYPOINT [ "ndc-oas-lambda" ]