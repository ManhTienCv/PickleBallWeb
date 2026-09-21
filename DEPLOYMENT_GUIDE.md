# HƯỚNG DẪN TRIỂN KHAI TOÀN BỘ HỆ THỐNG (DEPLOYMENT GUIDE)
> **Kiến trúc**: TiDB Cloud (MySQL Database) + Render (Laravel Backend) + Vercel (React Client & Admin)  
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
                                    [ Docker PHP 8.3 + Laravel 11 ]
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
   - Ở mục **Connect with**: Chọn **General** (hoặc **PHP / MySQL CLI**).
   - Nhấn **Generate Password** để tạo mật khẩu.
   - **LƯU LẠI CÁC THÔNG SỐ NÀY** để lát nữa dán vào Render:
     - **Host**: (Ví dụ: `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`)
     - **Port**: `4000`
     - **User**: (Ví dụ: `xxxxxx.root`)
     - **Password**: (Mật khẩu vừa tạo)
     - **Database**: `test` (hoặc tạo database `demopick`)
5. **Tạo Database `demopick` (Tuỳ chọn nhưng khuyên dùng)**:
   - Trên thanh menu TiDB Cloud, bấm vào tab **Chat2Query** (hoặc **SQL Editor**).
   - Gõ lệnh sau và bấm **Run**:
     ```sql
     CREATE DATABASE IF NOT EXISTS demopick;
     ```

---

## BƯỚC 2: DEPLOY BACKEND LARAVEL LÊN RENDER (5 phút)

1. Truy cập: **[https://render.com](https://render.com)** và đăng nhập bằng tài khoản **GitHub**.
2. Tại Dashboard của Render, bấm **New +** ở góc phải ➔ Chọn **Web Service**.
3. Chọn mục **Build and deploy from a Git repository** ➔ Nhấn **Next**.
4. Chọn repository: **`PickleBallWeb`** (nếu chưa thấy, nhấn *Configure account* để cấp quyền cho Render thấy repo này).
5. Điền thông số cấu hình Web Service:
   - **Name**: `demopick-api` (hoặc tên tuỳ ý của bạn).
   - **Region**: **Singapore** (khuyên dùng, cùng vùng với TiDB Cloud).
   - **Branch**: `main`.
   - **Root Directory**: `PickleBall`
   - **Runtime**: **Docker** (Render sẽ tự tìm thấy file `PickleBall/Dockerfile` đã được tạo sẵn).
   - **Instance Type**: **Free** ($0/month).
6. Cuộn xuống mục **Environment Variables** (Biến môi trường) ➔ Bấm **Add Environment Variable** và thêm các dòng sau:

| Key | Value | Ghi chú |
| :--- | :--- | :--- |
| `APP_NAME` | `DemoPick` | |
| `APP_ENV` | `production` | |
| `APP_DEBUG` | `false` | |
| `APP_KEY` | *(Để trống hoặc copy chuỗi base64 trong file .env local)* | Nếu để trống, Docker sẽ tự tạo |
| `DB_CONNECTION` | `main` | |
| `DB_HOST` | *(Dán Host từ TiDB Cloud ở Bước 1)* | Ví dụ: `gateway01.ap-southeast-1...` |
| `DB_PORT` | `4000` | Port mặc định của TiDB Cloud |
| `DB_DATABASE` | `demopick` (hoặc `test`) | Tên database bạn đã tạo |
| `DB_USERNAME` | *(Dán User từ TiDB Cloud)* | |
| `DB_PASSWORD` | *(Dán Password từ TiDB Cloud)* | |
| `RUN_SEEDERS` | `true` | Tự động nạp 42 sản phẩm chuẩn vào CSDL |
| `QUEUE_CONNECTION` | `database` | |
| `CACHE_STORE` | `database` | |
| `SESSION_DRIVER` | `database` | |

7. Bấm **Create Web Service**.
8. **Chờ Render build Docker**:
   - Quá trình build Docker và cài đặt PHP Composer mất khoảng 3 - 5 phút.
   - Khi màn hình hiện `Starting Apache web server on port...` và trạng thái chuyển sang màu xanh **Live**, Backend của bạn đã hoạt động!
9. **Copy URL Backend**:
   - Ở phía trên bên trái màn hình Render, copy đường link có dạng:  
     👉 **`https://demopick-api.onrender.com`** *(Link của bạn có thể khác chút theo tên bạn đặt)*.
   - Thử mở trình duyệt truy cập: `https://demopick-api.onrender.com/api/v1/products` ➔ Nếu thấy danh sách JSON sản phẩm hiện ra nghĩa là Backend + CSDL đã thông 100%!

---

## BƯỚC 3: DEPLOY FRONTEND CLIENT LÊN VERCEL (3 phút)

1. Truy cập: **[https://vercel.com](https://vercel.com)** và đăng nhập bằng **GitHub**.
2. Nhấn nút **Add New...** ở góc phải ➔ Chọn **Project**.
3. Tìm repo **`PickleBallWeb`** ➔ Bấm nút **Import**.
4. Cấu hình dự án cho trang Khách Hàng:
   - **Project Name**: `demopick-client`
   - **Framework Preset**: `Vite` (Vercel thường tự nhận diện).
   - **Root Directory**: Nhấn nút **Edit** bên cạnh ➔ Chọn thư mục **`demopick-client`** ➔ Nhấn **Continue**.
   - Mở mục **Environment Variables** (Biến môi trường) ➔ Thêm biến sau:
     - **Key**: `VITE_API_BASE_URL`
     - **Value**: `https://<ten-backend-cua-ban>.onrender.com/api/v1` *(Dán URL Render ở Bước 2 kèm đuôi `/api/v1`)*
5. Bấm **Deploy**.
6. Chờ khoảng 40 giây, Vercel sẽ thông báo **Congratulations!** và tạo cho bạn một đường link chính thức (Ví dụ: `https://demopick-client.vercel.app`).

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
5. Bạn sẽ nhận được đường link Admin chính thức (Ví dụ: `https://demopick-admin.vercel.app`).

---

## BƯỚC 5: CẬP NHẬT CORS TRÊN RENDER ĐỂ HOÀN TẤT KẾT NỐI (1 phút)

Để bảo mật và cho phép 2 website Vercel của bạn gọi API vào Backend mà không bao giờ bị lỗi CORS:

1. Quay lại trang quản lý Web Service trên **Render** (`demopick-api`).
2. Vào mục **Environment** ở menu bên trái.
3. Thêm/Cập nhật các biến sau với đường link Vercel bạn vừa nhận được:
   - `FRONTEND_URL`: `https://demopick-client.vercel.app` *(Link bước 3)*
   - `ADMIN_URL`: `https://demopick-admin.vercel.app` *(Link bước 4)*
   - `SANCTUM_STATEFUL_DOMAINS`: `demopick-client.vercel.app,demopick-admin.vercel.app`
4. Nhấn **Save Changes**. Render sẽ tự động áp dụng biến mới trong vòng 10 giây.

---

## 🎉 CHÚC MỪNG BẠN! HỆ THỐNG ĐÃ HOÀN TẤT 100% ONLINE!

Bây giờ bạn có thể:
1. Mở trang khách hàng: Thử duyệt vợt, nước uống, đặt sân thi đấu.
2. Mở trang Admin: Đăng nhập bằng `admin@demopick.vn` / mật khẩu để quản lý POS, sơ đồ sân và đơn hàng.
3. Mọi dữ liệu bạn tạo mới sẽ được lưu vĩnh viễn trên TiDB Cloud MySQL.

---

## 💡 MẸO VẬN HÀNH QUAN TRỌNG (TIPS & TRICKS)

### 1. Khắc phục độ trễ "ngủ" (Cold Start) của Render Free:
- Gói Free của Render sẽ tạm dừng nếu không có ai truy cập trong 15 phút. Khi có khách truy cập lại, sẽ mất khoảng 30s để máy chủ khởi động.
- **Cách giữ cho Render luôn thức 24/7 hoàn toàn miễn phí**:
  1. Vào trang miễn phí: **[https://cron-job.org](https://cron-job.org)** hoặc **[https://uptimerobot.com](https://uptimerobot.com)**.
  2. Tạo 1 tác vụ giám sát (Monitor / Cron job) trỏ vào đường link:  
     `https://demopick-api.onrender.com/api/v1/products`
  3. Cài đặt tần suất: **Mỗi 10 phút hoặc 14 phút gọi 1 lần**.
  4. 👉 Render sẽ luôn nhận diện có truy cập và **không bao giờ đi ngủ**, web của bạn lúc nào cũng phản hồi nhanh như gói trả phí!

### 2. Cập nhật mã nguồn sau này:
- Mỗi khi bạn chỉnh sửa code ở máy tính và chạy:
  ```bash
  git add .
  git commit -m "Cập nhật tính năng"
  git push origin main
  ```
- Cả **Render** và **Vercel** sẽ tự động phát hiện và kéo mã mới về build lại ngay tức thì mà bạn không cần phải thao tác thủ công gì thêm!
