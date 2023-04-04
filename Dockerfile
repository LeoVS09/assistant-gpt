# Define two step build to cache dependencies 
# in base step will install all node modules and base tools
FROM node:18-alpine as base

RUN apk update && apk upgrade && \
   apk add bash bash-completion make curl wget

RUN npm i -g serverless

WORKDIR /app 

COPY package.json yarn.lock /app/
RUN yarn

# In second step will copy all all local files to 
FROM base

COPY . /app

ENTRYPOINT ["./docker-entrypoint.sh"]

EXPOSE 8080