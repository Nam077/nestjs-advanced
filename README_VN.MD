
# NestJS Nâng Cao

**nestjs-advanced** là một framework backend hiện đại, toàn diện, được thiết kế để tận dụng sức mạnh của NestJS trong khi tích hợp nhiều công cụ và tính năng cần thiết cho các ứng dụng cấp độ sản xuất. Nó cung cấp các cơ chế xác thực an toàn, xử lý tác vụ nền, bộ nhớ đệm có thể mở rộng, chức năng email và ghi nhật ký nâng cao để duy trì và hiệu suất.

## Mục Lục

- [Giới Thiệu](#giới-thiệu)
- [Các Tính Năng Chính](#các-tính-năng-chính)
- [Tổng Quan Về Các Phụ Thuộc](#tổng-quan-về-các-phụ-thuộc)
- [Scripts](#scripts)
- [Công Nghệ](#công-nghệ)
- [Cài Đặt Dự Án](#cài-đặt-dự-án)
- [Kiểm Tra](#kiểm-tra)
- [Linting và Định Dạng](#linting-và-định-dạng)
- [Commit Quy Ước](#commit-quy-ước)
- [Cấu Hình Kiểm Tra Jest](#cấu-hình-kiểm-tra-jest)
- [Giấy Phép](#giấy-phép)

## Giới Thiệu

Dự án **nestjs-advanced** cung cấp một giải pháp backend mạnh mẽ và có thể mở rộng, tích hợp nhiều công nghệ quan trọng:

- **Xác thực bằng JWT với mã hóa RSA** để kiểm soát truy cập an toàn.
- **Quản lý phiên** sử dụng Redis để hỗ trợ nhiều phiên người dùng.
- **Xử lý tác vụ nền** với RabbitMQ.
- **Tác vụ định kỳ** sử dụng cron jobs cho các quy trình nền định kỳ.
- **Gửi email** sử dụng Nodemailer với các mẫu Pug động.
- **Tài liệu API** sử dụng Swagger để tự động tạo tài liệu API.
- **Hỗ trợ quốc tế hóa (i18n)** cho các ứng dụng đa ngôn ngữ.
- **Ghi nhật ký toàn diện** với Winston và xoay vòng nhật ký hàng ngày.

## Các Tính Năng Chính

- **Xác thực JWT** với mã hóa cặp khóa RSA, key được thay đổi định kỳ một cach tự động và an toàn.
- **Redis cho Bộ Nhớ Đệm & Quản Lý Phiên**: Lưu trữ trong bộ nhớ nhanh để quản lý các phiên người dùng và dữ liệu có thể lưu trữ khác.
- **RabbitMQ cho Hàng Đợi Tin Nhắn**: Xử lý tác vụ không đồng bộ, chẳng hạn như gửi email và xử lý các công việc nền.
- **Cron Jobs Định Kỳ**: Tác vụ tự động và định kỳ sử dụng module `@nestjs/schedule`.
- **Hệ Thống Email**: Tích hợp với Nodemailer và Pug cho các mẫu email động, cho phép chức năng email linh hoạt (ví dụ: xác minh, đặt lại mật khẩu).
- **Tài Liệu API**: Tích hợp Swagger cho tài liệu API tương tác và khám phá.
- **Fastify**: Một lựa chọn thay thế hiệu suất cao cho Express.js để xử lý các yêu cầu HTTP.
- **Ghi Nhật Ký Winston**: Thiết lập ghi nhật ký tùy chỉnh với xoay vòng tệp hàng ngày sử dụng `winston-daily-rotate-file`.

## Tổng Quan Về Các Phụ Thuộc

Dự án này bao gồm nhiều phụ thuộc, cả runtime và development, để đảm bảo hoạt động liền mạch, bảo mật và năng suất phát triển:

### Phụ Thuộc Runtime

- **@nestjs/common**: Cung cấp chức năng cốt lõi của NestJS.
- **@nestjs/config**: Xử lý cấu hình dựa trên môi trường.
- **@nestjs/core**: Module cốt lõi của NestJS.
- **@nestjs/jwt**: Sử dụng để tạo và xác minh JWT.
- **@nestjs/platform-fastify**: Bộ điều hợp Fastify cho NestJS để cải thiện hiệu suất.
- **@nestjs/typeorm**: Tích hợp TypeORM với NestJS để quản lý cơ sở dữ liệu.
- **ioredis**: Client Redis cho NestJS.
- **nest-winston**: Tích hợp với Winston để ghi nhật ký nâng cao.
- **bcryptjs**: Băm và xác thực mật khẩu.
- **crypto-js**: Cho các hoạt động mã hóa như mã hóa và băm.
- **winston-daily-rotate-file**: Tích hợp xoay vòng nhật ký hàng ngày.
- **nodemailer**: Để gửi email.
- **pg**: Client PostgreSQL để kết nối với cơ sở dữ liệu.
- **@golevelup/nestjs-rabbitmq**: Tích hợp RabbitMQ cho NestJS.
- **pug**: Công cụ mẫu để render email động.

### Phụ Thuộc Development

- **ESLint & Prettier**: Đảm bảo chất lượng mã và định dạng nhất quán.
- **Commitlint**: Thực thi các thông điệp commit quy ước.
- **Husky**: Git hooks cho các tác vụ tự động trước khi commit như linting và testing.
- **Jest**: Framework kiểm tra.
- **TypeScript**: Đảm bảo an toàn kiểu và chuyển đổi mã.
- **Supertest**: Để kiểm tra end-to-end của API.

## Scripts

Dự án này chứa nhiều script yarn để đơn giản hóa các tác vụ phát triển, kiểm tra và triển khai:

- **typeorm**: Chạy các lệnh CLI của TypeORM.
- **migration:generate**: Tạo tệp migration mới dựa trên các thay đổi trong các entity.
- **migration:create**: Tạo tệp migration trống mới.
- **migration:run**: Chạy các migration cơ sở dữ liệu đang chờ xử lý.
- **migration:revert**: Hoàn nguyên migration mới nhất đã chạy.
- **schema:drop**: Xóa toàn bộ schema cơ sở dữ liệu.
- **build**: Xây dựng ứng dụng NestJS cho sản xuất.
- **format**: Định dạng mã nguồn sử dụng Prettier.
- **start**: Khởi động ứng dụng ở chế độ sản xuất.
- **start:dev**: Khởi động ứng dụng ở chế độ phát triển với live reload.
- **start:debug**: Khởi động ứng dụng ở chế độ debug với live reload.
- **start:prod**: Khởi động ứng dụng ở chế độ sản xuất.
- **lint**: Chạy ESLint để kiểm tra các vấn đề mã và tự động sửa chúng.
- **test**: Chạy tất cả các kiểm tra đơn vị với Jest.
- **test:watch**: Chạy kiểm tra liên tục ở chế độ watch.
- **test:cov**: Chạy kiểm tra và tạo báo cáo độ bao phủ.
- **test:debug**: Chạy kiểm tra với chế độ debug.
- **test:e2e**: Chạy kiểm tra end-to-end sử dụng Jest và Supertest.
- **prepare**: Chuẩn bị các hooks Husky cho các tác vụ trước khi commit và trước khi push.
- **commit**: Sử dụng Commitizen để giúp định dạng thông điệp commit theo quy ước.

## Công Nghệ

Dưới đây là danh sách các công nghệ và thư viện chính được sử dụng trong dự án:

- **NestJS**: Framework cốt lõi để xây dựng các ứng dụng server-side có thể mở rộng.
- **Fastify**: Framework web hiệu suất cao để xử lý các yêu cầu HTTP.
- **TypeORM**: Bộ ánh xạ đối tượng-quan hệ cho tích hợp PostgreSQL.
- **Redis**: Lưu trữ trong bộ nhớ được sử dụng cho quản lý phiên và bộ nhớ đệm.
- **RabbitMQ**: Bộ điều phối tin nhắn cho xử lý tác vụ nền.
- **Nodemailer**: Để gửi email với các mẫu động.
- **Winston**: Cung cấp ghi nhật ký có cấu trúc với xoay vòng tệp hàng ngày.
- **Class-validator**: Framework xác thực để đảm bảo tính toàn vẹn dữ liệu trong DTOs.
- **Swagger**: Tự động tạo tài liệu API.

## Cài Đặt Dự Án

### Cài Đặt

1. Clone repository:

  ```bash
  git clone https://github.com/Nam077/nestjs-advanced.git
  cd nestjs-advanced
  ```

2. Cài đặt các phụ thuộc:

  ```bash
  yarn install
  ```

3. Sao chép tệp cấu hình môi trường ví dụ:

  ```bash
  cp .env.example .env
  ```

4. Khởi động các dịch vụ sử dụng Docker:

  ```bash
  docker-compose --env-file .env.docker up --build
  ```

5. Chạy các migration cơ sở dữ liệu:

  ```bash
  yarn run migration:run
  ```

### Chạy Ứng Dụng

- Khởi động ở chế độ phát triển với live reload:

  ```bash
  yarn run start:dev
  ```

- Xây dựng và chạy ở chế độ sản xuất:

  ```bash
  yarn run build
  yarn run start:prod
  ```

## Kiểm Tra

Dự án bao gồm độ bao phủ kiểm tra toàn diện với các kiểm tra đơn vị và kiểm tra end-to-end (E2E).

### Chạy Kiểm Tra

- Để chạy tất cả các kiểm tra:

  ```bash
  yarn run test
  ```

- Để chạy kiểm tra ở chế độ watch:

  ```bash
  yarn run test:watch
  ```

- Để tạo báo cáo độ bao phủ:

  ```bash
  yarn run test:cov
  ```

## Linting và Định Dạng

Dự án tuân theo các tiêu chuẩn chất lượng mã nghiêm ngặt sử dụng **ESLint** và **Prettier**. Để chạy kiểm tra lint và tự động sửa các vấn đề:

```bash
yarn run lint
```

Để định dạng mã sử dụng Prettier:

```bash
yarn run format
```

### Commitlint và Husky

Dự án này sử dụng **Husky** để chạy các hooks Git cho các tác vụ trước khi commit và trước khi push như linting và testing. **Commitlint** thực thi các thông điệp commit quy ước, giúp duy trì lịch sử Git sạch và nhất quán.

Để thực hiện một commit:

```bash
yarn run commit
```

Điều này sẽ nhắc bạn sử dụng Commitizen, giúp định dạng thông điệp commit của bạn theo các tiêu chuẩn commit quy ước (ví dụ: `feat: add user authentication`).

## Cấu Hình Kiểm Tra Jest

Dự án được cấu hình để sử dụng **Jest** cho kiểm tra. Dưới đây là cấu hình Jest được bao gồm trong dự án:

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": "src",
  "testRegex": ".*\\.spec\\.ts$",
  "transform": {
   "^.+\\.(t|j)s$": "ts-jest"
  },
  "collectCoverageFrom": ["**/*.(t|j)s"],
  "coverageDirectory": "../coverage",
  "testEnvironment": "node"
}
```

Cấu hình này cho phép thu thập độ bao phủ kiểm tra, hỗ trợ TypeScript và chạy kiểm tra trong môi trường Node.js.

## Giấy Phép

Dự án này được cấp phép theo giấy phép **UNLICENSED**. Điều này có nghĩa là mã nguồn của dự án không thể được sử dụng, sao chép, sửa đổi hoặc phân phối tự do bởi người khác mà không có sự cho phép rõ ràng từ tác giả.
