# Sử dụng image Node.js chính thức
FROM node:20-alpine

# Tạo thư mục làm việc
WORKDIR /app

RUN yarn global add @nestjs/cli

# Copy package.json và cài đặt dependencies
COPY package*.json ./
COPY yarn.lock ./
RUN yarn install --production

# Copy toàn bộ mã nguồn vào container
COPY . .

# Build ứng dụng NestJS
RUN yarn build

# Expose cổng mà ứng dụng sẽ chạy từ .env APP_PORT
ARG APP_PORT
EXPOSE $APP_PORT


# Lệnh để chạy ứng dụng
CMD ["yarn", "start:prod"]
