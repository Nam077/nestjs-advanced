# Sử dụng image Node.js chính thức
FROM node:16-alpine

# Tạo thư mục làm việc
WORKDIR /app

# Copy package.json và cài đặt dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy toàn bộ mã nguồn vào container
COPY . .

# Build ứng dụng NestJS
RUN npm run build

# Expose cổng mà ứng dụng sẽ chạy
EXPOSE 3000

# Lệnh để chạy ứng dụng
CMD ["npm", "run", "start:prod"]
