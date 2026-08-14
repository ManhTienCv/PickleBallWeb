# 🗄️ Hướng Dẫn Thiết Lập Cơ Sở Dữ Liệu (Database Setup Guide) — DemoPick Web

Tài liệu này hướng dẫn chi tiết cách thiết lập, cấu hình kết nối và chạy Migration cho dự án **DemoPick Web** theo mô hình **Kiến trúc Hướng dịch vụ (SOA)** đa cơ sở dữ liệu.

---

## 📐 1. Tổng Quan Kiến Trúc Cơ Sở Dữ Liệu

Hệ thống DemoPick Web sử dụng **3 cơ sở dữ liệu độc lập** để đảm bảo tính cô lập và khả năng mở rộng dịch vụ:

| Database Name | Module Đảm Nhận | Các Bảng Chính |
|---------------|------------------|----------------|
| **`demopick_main`** | User & Đơn Hàng | `users`, `roles`, `permissions`, `orders`, `order_items`, `payments`, `order_saga_logs` |
| **`demopick_shop`** | Cửa Hàng Thiết Bị | `categories`, `brands`, `products`, `product_variants`, `inventory_transactions`, `carts`, `cart_items` |
| **`demopick_booking`** | Đặt Thuê Sân Pickleball | `courts`, `court_pricing_rules`, `time_slots`, `holds`, `bookings`, `booking_items`, `checkin_logs` |

---

## 🛠️ 2. Bước 1: Tạo 3 Database Trên MySQL Workbench / phpMyAdmin

Mở **MySQL Workbench** (hoặc **phpMyAdmin** trong XAMPP), kết nối tới server MySQL của bạn, mở tab Query mới (`Ctrl + T`) và chạy lệnh SQL sau:

```sql
-- 1. Tạo Database chính (User, Role, Order)
CREATE DATABASE IF NOT EXISTS demopick_main CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Tạo Database cửa hàng (Sản phẩm, Kho, Giỏ hàng)
CREATE DATABASE IF NOT EXISTS demopick_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3. Tạo Database đặt sân (Sân, Khung giờ, Giữ chỗ, Checkin)
CREATE DATABASE IF NOT EXISTS demopick_booking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## ⚙️ 3. Bước 2: Cấu Hình Kết Nối Trong File `.env`

Mở file [`.env`](file:///d:/WebsiteAppFullProject/PhanMemHuongDichVu/PickleBallWeb/PickleBall/.env) tại thư mục `PickleBall/` và điều chỉnh tham số theo môi trường MySQL trên máy bạn:

### 🔹 Trường hợp A: Sử dụng MySQL Standalone / MySQL Workbench (Cổng `3306`)
```env
DB_CONNECTION=main
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=mat_khau_mysql_workbench_cua_ban

DB_MAIN_DATABASE=demopick_main
DB_SHOP_DATABASE=demopick_shop
DB_BOOKING_DATABASE=demopick_booking
```

### 🔹 Trường hợp B: Sử dụng XAMPP MySQL (Cổng `3307`)
```env
DB_CONNECTION=main
DB_HOST=127.0.0.1
DB_PORT=3307
DB_USERNAME=root
DB_PASSWORD=

DB_MAIN_DATABASE=demopick_main
DB_SHOP_DATABASE=demopick_shop
DB_BOOKING_DATABASE=demopick_booking
```

---

## 🚀 4. Bước 3: Chạy Migration & Khởi Tạo Dữ Liệu Mẫu (Seeding)

Mở Terminal / PowerShell tại thư mục `PickleBall/` và thực thi câu lệnh:

```powershell
cd d:\WebsiteAppFullProject\PhanMemHuongDichVu\PickleBallWeb\PickleBall
php artisan migrate:fresh --seed
```

### 📋 Danh sách Dữ liệu Mẫu Được Sinh Ra Tự Động (Seeders):
1. **Quản trị & Phân quyền:**
   - 4 Quyền/Vai trò: `customer`, `staff`, `admin`, `super_admin`
   - Tài khoản Admin: `admin@demopick.vn` / Mật khẩu: `12345678`
   - Tài khoản Nhân viên: `staff@demopick.vn` / Mật khẩu: `12345678`
   - Tài khoản Khách hàng: `customer@demopick.vn` / Mật khẩu: `12345678`
2. **Cửa hàng:** 4 Danh mục, 3 Thương hiệu chính hãng, 4 Sản phẩm vợt/bóng kèm tồn kho biến thể.
3. **Sân Pickleball:** 4 Sân (Sân 1, Sân 2, Sân VIP 1, Sân VIP 2) kèm quy tắc giá (khung giờ thường và giờ cao điểm 17h-21h) và khung giờ 7 ngày.

---

## 💡 5. Phương Án Fallback Nhanh: Dùng SQLite (Không Cần MySQL Server)

Nếu máy bạn chưa bật MySQL/XAMPP hoặc muốn chạy nhanh để test ứng dụng, chạy lệnh sau trong PowerShell để sử dụng cơ sở dữ liệu SQLite tệp tin:

```powershell
$env:DB_MAIN_DRIVER="sqlite"; $env:DB_SHOP_DRIVER="sqlite"; $env:DB_BOOKING_DRIVER="sqlite"; php artisan migrate:fresh --seed
```

---

## ❓ 6. Xử Lý Lỗi Thường Gặp (Troubleshooting)

### 🔴 1. Lỗi `SQLSTATE[HY000] [1045] Access denied for user 'root'@'localhost'`
- **Nguyên nhân:** Sai mật khẩu hoặc chưa điền mật khẩu trong file `.env`.
- **Khắc phục:** Mở file `.env` và điền chính xác mật khẩu MySQL Workbench vào dòng `DB_PASSWORD=...`.

### 🔴 2. Lỗi `SQLSTATE[HY000] [1049] Unknown database 'demopick_main'`
- **Nguyên nhân:** Chưa chạy lệnh SQL tạo 3 Database ở Bước 1.
- **Khắc phục:** Mở MySQL Workbench dán đoạn SQL ở Bước 1 và bấm biểu tượng tia sét để tạo database.

### 🔴 3. Lỗi `SQLSTATE[HY000] [2002] Connection refused`
- **Nguyên nhân:** MySQL Service chưa được Start hoặc sai cổng `DB_PORT`.
- **Khắc phục:** Kiểm tra trong XAMPP Control Panel đã bấm **Start** MySQL chưa, hoặc kiểm tra xem cổng đang dùng là `3306` hay `3307`.



Khởi Tạo Dữ Liệu Ban Đầu (Chỉ cần 1 lệnh tự động)
Khi bạn chạy dự án Laravel Backend, bạn chỉ cần chạy 1 câu lệnh duy nhất:

bash


php artisan migrate:fresh --seed
Lệnh này sẽ tự động:

Tạo toàn bộ cấu trúc bảng trong Database MySQL (users, courts, products, orders, posts...).
Tự động nạp sẵn dữ liệu mẫu ban đầu (Tài khoản Admin, danh sách 6 sân Pickleball, bảng giá, phụ kiện vợt/bóng và các bài viết Blog) mà bạn không cần gõ tay bất kỳ dòng dữ liệu nào.