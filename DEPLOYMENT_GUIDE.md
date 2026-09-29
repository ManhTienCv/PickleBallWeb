# HƯỚNG DẪN TRIỂN KHAI TOÀN BỘ HỆ THỐNG (DEPLOYMENT GUIDE)
> **Kiến trúc**: TiDB Cloud (MySQL Database) + Render (Spring Boot Java 21 Backend) + Vercel (React Client & Admin)  
> **Chi phí**: **100% MIỄN PHÍ (0 VNĐ)**  
> **Thời gian thực hiện**: Khoảng 10 - 15 phút.

---

## 🗺️ TỔNG QUAN KIẾN TRÚC HỆ THỐNG

```
[ Người dùng & Khách hàng ] ───► Vercel (demopick-client.vercel.app)
                                              │
[ Quản trị viên & Nhân viên] ──► Vercel (demopick-admin.vercel.app)
                                              │ (Gọi REST API qua HTTPS)
                                              ▼
                               Render (demopick-api.onrender.com)
                                    [ Docker Java 21 + Spring Boot 3 ]
                                              │
                                              ▼ (MySQL Port 4000 qua TLS)
                               TiDB Cloud Serverless (25GB Free)
```

---

## BƯỚC 1: TẠO CSDL MYSQL CLOUD MIỄN PHÍ TRÊN TIDB CLOUD (2 phút)

1. Truy cập: **[https://tidbcloud.com](https://tidbcloud.com)** và chọn **Sign in with GitHub** (hoặc Google).
2. Tại màn hình chính, nhấn **Create Cluster**:
   - Chọn loại: **Serverless** (Gói miễn phí 25GB trọn đời).
   - Cluster Name: Đặt tên tuỳ ý (ví dụ: `demopick-db`).
   - Region (Khu vực): Chọn **AWS / Singapore (ap-southeast-1)** hoặc **Tokyo** (để có tốc độ kết nối về Việt Nam nhanh nhất).
   - Nhấn **Create**.
3. Chờ khoảng 15 giây để cụm CSDL khởi tạo xong.
4. Nhấn nút **Connect** ở góc phải:
   - Ở mục **Connect with**: Chọn **General** (hoặc **MySQL CLI / JDBC**).
   - Nhấn **Generate Password** để tạo mật khẩu.
   - **LƯU LẠI CÁC THÔNG SỐ NÀY** để lát nữa dán vào Render:
     - **Host**: (Ví dụ: `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`)
     - **Port**: `4000`
     - **User**: (Ví dụ: `xxxxxx.root`)
     - **Password**: (Mật khẩu vừa tạo)
     - **Database**: `demopick` (hoặc `test`)
5. **Tạo Database `demopick` (Tuỳ chọn nhưng khuyên dùng)**:
   - Trên thanh menu TiDB Cloud, bấm vào tab **Chat2Query** (hoặc **SQL Editor**).
   - Gõ lệnh sau và bấm **Run**:
     ```sql
     CREATE DATABASE IF NOT EXISTS demopick;
     ```

---

## BƯỚC 2: DEPLOY BACKEND SPRING BOOT (JAVA 21) LÊN RENDER (5 phút)

1. Truy cập: **[https://render.com](https://render.com)** và đăng nhập bằng tài khoản **GitHub**.
2. Tại Dashboard của Render, bấm **New +** ở góc phải ➔ Chọn **Web Service**.
3. Chọn mục **Build and deploy from a Git repository** ➔ Nhấn **Next**.
4. Chọn repository: **`PickleBallWeb`** (nếu chưa thấy, nhấn *Configure account* để cấp quyền cho Render thấy repo này).
5. Điền thông số cấu hình Web Service:
   - **Name**: `demopick-api` (hoặc tên tuỳ ý của bạn).
   - **Region**: **Singapore** (khuyên dùng, cùng vùng với TiDB Cloud).
   - **Branch**: `main`.
   - **Root Directory**: `PickleBall-SpringBoot`
   - **Runtime**: **Docker** (Render sẽ tự động dùng file `PickleBall-SpringBoot/Dockerfile`).
   - **Instance Type**: **Free** ($0/month).
6. Cuộn xuống mục **Environment Variables** (Biến môi trường) ➔ Bấm **Add Environment Variable** và thêm các dòng sau:

| Key | Value Mẫu | Mục đích |
| :--- | :--- | :--- |
| `APP_NAME` | `DemoPick` | Tên hệ thống |
| `APP_ENV` | `production` | Môi trường triển khai |
| `PORT` | `8080` | Cổng dịch vụ (Render tự inject) |
| `DB_HOST` | *(Dán Host từ TiDB Cloud ở Bước 1)* | Ví dụ: `gateway01.ap-southeast-1...` |
| `DB_PORT` | `4000` | Port TiDB Cloud |
| `DB_DATABASE` | `demopick` | Tên Database |
| `DB_USERNAME` | *(Dán User từ TiDB Cloud)* | Tài khoản DB |
| `DB_PASSWORD` | *(Dán Password từ TiDB Cloud)* | Mật khẩu DB |
| `JWT_SECRET` | `demopick_super_secret_key_pickleball_spring_boot_ptpmhdv_2026_secure_key_at_least_32_bytes` | Chuỗi mã hoá Bearer JWT |
| `CORS_ALLOWED_ORIGINS` | `https://demopick-client.vercel.app,https://demopick-admin.vercel.app,http://localhost:5173,http://localhost:5174` | Cho phép Vercel gọi API |
| `MOMO_PARTNER_CODE` | `MOMOBKUN20180529` | Mã đối tác MoMo Sandbox |
| `MOMO_ACCESS_KEY` | `klm05TvNBzhg7h7j` | Access key MoMo |
| `MOMO_SECRET_KEY` | `at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa` | Secret key MoMo |
| `MOMO_ENDPOINT` | `https://test-payment.momo.vn/v2/gateway/api/create` | Gateway thanh toán MoMo |
| `MOMO_REDIRECT_URL`| `https://demopick-client.vercel.app/payment/momo/callback` | Điều hướng sau thanh toán |
| `MOMO_IPN_URL` | `https://demopick-api.onrender.com/api/v1/webhooks/payment/momo` | Webhook IPN xử lý kết quả |
| `MAIL_HOST` | `smtp.gmail.com` | Máy chủ gửi mail SMTP |
| `MAIL_PORT` | `587` | Cổng TLS Gmail |
| `MAIL_USERNAME` | `nvmtein@gmail.com` | Tài khoản Gmail gửi OTP |
| `MAIL_PASSWORD` | `rsaegcuzmnruldjs` | App Password Gmail (16 ký tự) |
| `MAIL_FROM_ADDRESS`| `nvmtein@gmail.com` | Email người gửi hiển thị |
| `MAIL_FROM_NAME` | `Pickleball` | Tên người gửi |
| `GHN_API_URL` | `https://online-gateway.ghn.vn/shiip/public-api/v2` | API Giao Hàng Nhanh |
| `GHN_API_TOKEN` | `5a8e6646-a763-11f1-be93-ea52ad3d88b7` | Token GHN Express |
| `GHN_SHOP_ID` | `6643423` | Shop ID đăng ký GHN |
| `GHN_SENDER_DISTRICT_ID` | `1485` | Quận gửi hàng |
| `GHN_SENDER_WARD_CODE` | `1A0607` | Phường gửi hàng |

> 💡 **Mẹo**: Nếu bạn dùng file `render.yaml` (Infrastructure as Code) trong thư mục gốc dự án, Render sẽ tự động đọc toàn bộ cấu hình trên mà bạn không cần phải nhập tay từng dòng!

7. Bấm **Create Web Service**.
8. **Chờ Render build Docker**:
   - Quá trình build Maven (Stage 1) và đóng gói JRE 21 (Stage 2) mất khoảng 2 - 3 phút.
   - Khi log hiện `Started PickleBallApplication in ... seconds` và trạng thái chuyển sang màu xanh **Live**, Backend Spring Boot đã chạy thành công!
9. **Copy URL Backend**:
   - Ở phía trên bên trái màn hình Render, copy đường link có dạng:  
     👉 **`https://demopick-api.onrender.com`**
   - Mở trình duyệt kiểm tra: `https://demopick-api.onrender.com/api/v1/products` ➔ Nếu thấy danh sách JSON sản phẩm hiện ra nghĩa là Backend + TiDB Cloud đã sẵn sàng 100%!

---

## BƯỚC 3: DEPLOY FRONTEND CLIENT LÊN VERCEL (3 phút)

1. Truy cập: **[https://vercel.com](https://vercel.com)** và đăng nhập bằng **GitHub**.
2. Nhấn nút **Add New...** ở góc phải ➔ Chọn **Project**.
3. Tìm repo **`PickleBallWeb`** ➔ Bấm nút **Import**.
4. Cấu hình dự án cho trang Khách Hàng:
   - **Project Name**: `demopick-client`
   - **Framework Preset**: `Vite` (Vercel tự nhận diện).
   - **Root Directory**: Nhấn nút **Edit** bên cạnh ➔ Chọn thư mục **`demopick-client`** ➔ Nhấn **Continue**.
   - Mở mục **Environment Variables** (Biến môi trường) ➔ Thêm biến sau:
     - **Key**: `VITE_API_BASE_URL`
     - **Value**: `https://<ten-backend-cua-ban>.onrender.com/api/v1` *(Dán URL Render ở Bước 2 kèm đuôi `/api/v1`)*
5. Bấm **Deploy**.
6. Chờ khoảng 30 - 45 giây, Vercel sẽ thông báo **Congratulations!** và tạo link chính thức (Ví dụ: `https://demopick-client.vercel.app`).

---

## BƯỚC 4: DEPLOY FRONTEND ADMIN LÊN VERCEL (3 phút)

1. Quay lại trang chủ Vercel: Nhấn **Add New...** ➔ Chọn **Project**.
2. Chọn lại repo **`PickleBallWeb`** ➔ Bấm **Import**.
3. Cấu hình dự án cho trang Quản Trị:
   - **Project Name**: `demopick-admin`
   - **Framework Preset**: `Vite`.
   - **Root Directory**: Nhấn **Edit** ➔ Chọn thư mục **`demopick-admin`** ➔ Nhấn **Continue**.
   - Mở mục **Environment Variables** ➔ Thêm biến sau:
     - **Key**: `VITE_API_BASE_URL`
     - **Value**: `https://<ten-backend-cua-ban>.onrender.com/api/v1` *(Giống hệt bước 3)*
4. Bấm **Deploy**.
5. Bạn sẽ nhận được link Admin chính thức (Ví dụ: `https://demopick-admin.vercel.app`).

---

## BƯỚC 5: CẬP NHẬT CORS TRÊN RENDER ĐỂ HOÀN TẤT KẾT NỐI (1 phút)

Để bảo mật và cho phép 2 website Vercel gọi API vào Backend mà không bị lỗi CORS:

1. Quay lại trang quản lý Web Service trên **Render** (`demopick-api`).
2. Vào mục **Environment** ở menu bên trái.
3. Kiểm tra biến `CORS_ALLOWED_ORIGINS` đã chứa đầy đủ 2 domain Vercel:
   ```
   https://demopick-client.vercel.app,https://demopick-admin.vercel.app
   ```
4. Nhấn **Save Changes**. Render sẽ tự động áp dụng biến mới trong vòng 10 giây.

---

## 🎉 HỆ THỐNG ĐÃ HOÀN TẤT 100% ONLINE!

- **Khách hàng**: `https://demopick-client.vercel.app` (Đặt sân, mua vợt bóng, giỏ hàng hỗn hợp, thanh toán MoMo).
- **Quản trị viên**: `https://demopick-admin.vercel.app` (Sơ đồ sân realtime, POS bán hàng, quản lý đơn hàng).
- **Backend API**: `https://demopick-api.onrender.com` (Spring Boot 3 + Java 21, RESTful API).
- **CSDL Clould**: TiDB Cloud MySQL 8.0 Serverless.

---

## 💡 MẸO VẬN HÀNH QUAN TRỌNG (TIPS & TRICKS)

### 1. Khắc phục độ trễ "ngủ" (Cold Start) của Render Free:
- Gói Free của Render sẽ tạm dừng nếu không có ai truy cập trong 15 phút.
- **Cách giữ cho Render luôn thức 24/7 hoàn toàn miễn phí**:
  1. Vào trang miễn phí: **[https://cron-job.org](https://cron-job.org)** hoặc **[https://uptimerobot.com](https://uptimerobot.com)**.
  2. Tạo 1 tác vụ giám sát (Monitor / Cron job) trỏ vào đường link:  
     `https://demopick-api.onrender.com/api/v1/products`
  3. Cài đặt tần suất: **Mỗi 10 - 14 phút gọi 1 lần**.
  4. 👉 Render sẽ luôn nhận diện có truy cập và **không bao giờ ngủ**, phản hồi luôn nhanh tức thì!

### 2. Cập nhật mã nguồn tự động:
- Mỗi khi bạn chỉnh sửa mã nguồn cục bộ và thực hiện đẩy lên GitHub:
  ```bash
  git add .
  git commit -m "Cập nhật tính năng"
  git push origin main
  ```
- Cả **Render** và **Vercel** sẽ tự động bắt Webhook từ GitHub và tự động build lại phiên bản mới nhất!
