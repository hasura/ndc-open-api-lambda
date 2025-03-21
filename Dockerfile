FROM node:20-alpine

# we need to update npm to update cross-spawn to a version higher than or equal to 7.0.6 to avoid a critical vulnerability
# RUN npm update -g npm

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