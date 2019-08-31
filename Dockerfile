FROM node:12
RUN mkdir -p /src/app
RUN mkdir -p /src/migrations
COPY app /src/app
COPY migrations /src/migrations
COPY .env /src
COPY index.js /src
COPY knexfile.js /src
COPY package.json /src
COPY package-lock.json /src
WORKDIR /src
RUN npm ci
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "index.js"]
