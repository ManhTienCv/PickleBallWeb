# 🚀 HƯỚNG DẪN KHỞI CHẠY TỪNG PHÂN HỆ (DEMOPICK WEB SYSTEM)

Tài liệu này hướng dẫn bạn cách khởi chạy từng phân hệ độc lập (khi muốn tùy chỉnh giao diện hay debug) cũng như cách chạy toàn bộ hệ thống.

---

## 🛠️ 1. Hướng Dẫn Chạy Lẻ Từng Phân Hệ (Cho Lập Trình Viên)

Hệ thống được chia làm **3 phân hệ độc lập** theo kiến trúc Hướng dịch vụ (SOA). Bạn mở cửa sổ Terminal (PowerShell / CMD / Terminal của VS Code) và di chuyển vào đúng thư mục tương ứng:

### 🔹 A. Khởi chạy Backend API (Laravel 13 - Port 8000)
> *Bắt buộc phải chạy dịch vụ này nếu giao diện cần lấy/gửi dữ liệu thực tế từ Database.*

```bash
# 1. Di chuyển vào thư mục PickleBall
cd PickleBall

# 2. Khởi chạy server Laravel
php artisan serve --port=8000
```
👉 Địa chỉ API: **`http://localhost:8000`**

---

### 🔹 B. Khởi chạy Trang Khách Hàng (Customer Portal SPA - Port 5173)
> *Chỉ chạy dịch vụ này khi bạn muốn sửa đổi & xem trước giao diện Khách hàng.*

```bash
# 1. Di chuyển vào thư mục demopick-client
cd demopick-client

# 2. Khởi chạy máy chủ giao diện Vite
npm run dev
```
👉 Truy cập trình duyệt: **`http://localhost:5173`**

---

### 🔹 C. Khởi chạy Trang Quản Trị (Admin Dashboard SPA - Port 5174)
> *Chỉ chạy dịch vụ này khi bạn muốn sửa đổi & xem trước giao diện Admin.*

```bash
# 1. Di chuyển vào thư mục demopick-admin
cd demopick-admin

# 2. Khởi chạy máy chủ giao diện Vite
npm run dev
```
👉 Truy cập trình duyệt: **`http://localhost:5174`**

---

## 🔑 2. Thông Tin Tài Khoản Đăng Nhập Test

### 🛡️ Trang Quản Trị (Admin Portal - `http://localhost:5174/login`)
- **Tài khoản Super Admin:** `admin@demopick.vn` | Mật khẩu: `12345678`
- **Tài khoản Nhân viên:** `staff@demopick.vn` | Mật khẩu: `12345678`

### 👤 Trang Khách Hàng (Customer Portal - `http://localhost:5173/login`)
- **Tài khoản Khách hàng:** `customer@demopick.vn` | Mật khẩu: `12345678`

---

## ⚡ 3. Hướng Dẫn Chạy Toàn Bộ Hệ Thống (1-Click)

Khi muốn kiểm thử toàn bộ dòng chảy (từ đặt sân khách hàng -> xem sơ đồ quản trị -> bán hàng POS), bạn chạy 1 câu lệnh duy nhất từ thư mục gốc:

- **Windows CMD:** Đúp chuột vào file `run-all.bat` (hoặc gõ `.\run-all.bat` trong CMD)
- **PowerShell:** Gõ `.\run-all.ps1` trong PowerShell
