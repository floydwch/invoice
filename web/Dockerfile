FROM node:14
RUN mkdir /app
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn run build
EXPOSE 80
CMD ["yarn", "start", "-p", "80"]