# Inherit from node v4 docker image
FROM node:4-wheezy

RUN apt-get update
RUN apt-get install -y curl wget

ADD . /app

#setup node
ADD package.json /app/package.json
RUN npm update -g npm
RUN cd /app && npm install

EXPOSE 3000
ENV PORT=3000

WORKDIR /app

# Redis now launch via docker-compose and is referenced via link
ENTRYPOINT ["npm"]
CMD  ["run", "start"]

#everything needed by extensions
RUN apt-get install -y gcc python python-dev python-pip
RUN yes | pip install biopython
