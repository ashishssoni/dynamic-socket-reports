# Base image
FROM node:18-alpine

ENV PORT 3000

EXPOSE 3000

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN apk add --update --no-cache python3 build-base gcc && ln -sf /usr/bin/python3 /usr/bin/python

RUN npm install

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN set -eux; \
  for i in $(seq 1 5); do \
  if [ -d ".next" ] && [ $(du -s .next | awk '{print $1}') -ge 2000 ]; then \
  break; \
  fi; \
  npm run build; \
  done

# Running the app
CMD [ "npm", "run", "start" ]
