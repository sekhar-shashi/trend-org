FROM node:lts-alpine
WORKDIR /apps
COPY ./dist/apps/download-files-s3 .
ENV PORT=3333
EXPOSE ${PORT}
# RUN npm install --production
# dependencies that nestjs needs
RUN npm install reflect-metadata tslib rxjs @nestjs/platform-express
CMD node ./main.js
