# build stage
FROM node:16-alpine as build-stage
WORKDIR /app
COPY . /app
RUN npm install --force
RUN npm run build
## các bạn có thể dùng yarn install .... tuỳ nhu cầu nhé

# production stage
FROM nginx:1.17-alpine as production-stage
COPY --from=build-stage /app/build /usr/share/nginx/html
EXPOSE 3001
CMD ["nginx", "-g", "daemon off;"]
