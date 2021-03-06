FROM node:boron
# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
COPY package.json .
# For npm@5 or later, copy package-lock.json as well
# COPY package.json package-lock.json ./

RUN npm install

# Bundle app source
COPY . .

ENV FEATHERS=https://api.survey.le34.dk

RUN npm run build

EXPOSE 3030

CMD [ "npm", "start" ]