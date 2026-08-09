# 📝 DemoPick Web — Nhật Ký Triển Khai Chi Tiết (Development Log)

> **Mục đích:** Ghi chép từng file đã tạo/sửa, trạng thái biên dịch/chạy thử, các bug đã phát hiện & sửa chữa. File này được cập nhật SAU MỖI PHASE HOẶC SPRINT để đảm bảo không bị mất ngữ cảnh hay bỏ sót lỗi.

---

## 🟢 PHASE 0: FOUNDATION (ĐÃ HOÀN THÀNH — 07/08/2026)

### 1. Backend Laravel (`PickleBall/`)

| File / Component | Trạng thái | Ghi chú / Kiểm thử |
|------------------|------------|-------------------|
| `composer.json` | ✅ Hoàn thành | Đã thêm `laravel/sanctum`, `spatie/laravel-permission`, `simplesoftwareio/simple-qrcode`, `spatie/laravel-query-builder`, `App\Modules\` namespace |
| `config/database.php` | ✅ Hoàn thành | Đã cấu hình 3 MySQL connections: `main` (demopick_main), `shop` (demopick_shop), `booking` (demopick_booking) |
| `config/cors.php` | ✅ Hoàn thành | Cho phép origin `http://localhost:5173` (Client) & `http://localhost:5174` (Admin), exposed header `X-Trace-Id` |
| `routes/api.php` | ✅ Hoàn thành | Đăng ký prefix `/api/v1`, nhóm auth, user, cart, booking, admin, webhooks |
| `bootstrap/app.php` | ✅ Hoàn thành | Đã đăng ký `routes/api.php`, cấu hình JSON response cho `api/*` |
| `bootstrap/providers.php` | ✅ Hoàn thành | Đã đăng ký 5 Module ServiceProviders (`User`, `Shop`, `Booking`, `Order`, `Report`) |
| `app/Modules/Shared/` | ✅ Hoàn thành | Enums: `UserRole`, `OrderStatus`, `SlotStatus`, `BookingStatus`, `PaymentMethod`, `PaymentStatus`, `CourtStatus`<br/>Middleware: `TraceIdMiddleware`<br/>Trait: `HasStandardResponse`<br/>Exceptions: `ApiException`, `InsufficientStockException`, `HoldExpiredException`, `PaymentFailedException` |
| `app/Modules/User/Http/Controllers/AuthController.php` | ✅ Placeholder | Phục vụ kiểm thử `php artisan route:list` |
| `app/Modules/User/Http/Controllers/ProfileController.php` | ✅ Placeholder | Phục vụ kiểm thử `php artisan route:list` |

**Kế hoạch kiểm thử Backend:**
- `php artisan route:list`: Pass (9 routes registered successfully).
- `composer dump-autoload`: Pass.

---

### 2. Customer Portal SPA (`demopick-client/`)

| File / Component | Trạng thái | Ghi chú / Kiểm thử |
|------------------|------------|-------------------|
| `package.json` | ✅ Hoàn thành | React 18, Vite 5, Tailwind v3, Radix UI, TanStack Query, Axios, Lucide |
| `vite.config.ts` | ✅ Hoàn thành | Cấu hình path alias `@/` -> `src/`, SWC plugin, Dev server port `5173` |
| `tsconfig.app.json` | ✅ Hoàn thành | Khai báo `@/*`, types: `["node"]` |
| `src/vite-env.d.ts` | ✅ Hoàn thành | Reference client types cho `import.meta.env` |
| `src/index.css` | ✅ Hoàn thành | HSL CSS variables, Google Fonts Inter, `@tailwind` directives (đã fix vị trí `@import`) |
| `src/lib/api.ts` | ✅ Hoàn thành | Axios client với Bearer Token & 401 Interceptor |
| `src/contexts/AuthContext.tsx` | ✅ Hoàn thành | Context quản lý Auth state, login/register/logout APIs |
| `src/components/CustomerLayout.tsx` | ✅ Hoàn thành | Header, Nav, User profile widget, Footer |
| `src/pages/Home.tsx` | ✅ Hoàn thành | Hero banner, Services overview |
| `src/pages/NotFound.tsx` | ✅ Hoàn thành | Trang 404 chuẩn UI |
| `src/components/ui/` (47 components) | ✅ Hoàn thành | Đã copy từ PickleBallONE & xoá 2 file thừa (`chart.tsx`, `resizable.tsx` - admin only) |
| `src/hooks/` | ✅ Hoàn thành | `use-toast.ts`, `use-mobile.tsx` |

**Bug đã xử lý trong Phase 0:**
1. 🐛 **Lỗi TS2307/TS2580 (`path`, `__dirname`, `@types/node`):** Thêm `@types/node` vào `devDependencies` & `tsconfig.app.json`.
2. 🐛 **Lỗi Type Mismatch trong `chart.tsx` & `resizable.tsx`:** Đây là 2 component của Admin Dashboard, không dùng ở Customer Portal -> Đã xoá khỏi `demopick-client`.
3. 🐛 **Lỗi CSS Warning `@import must precede @tailwind`:** Đã chuyển dòng `@import url(...)` lên vị trí dòng 1 của `index.css`.

**Kế hoạch kiểm thử Customer Portal:**
- `npm run build`: **Pass** (1660 modules transformed, build thành công 0 lỗi trong 28s).

---

### 3. Admin Dashboard SPA (`PickleBallONE/`)

| File / Component | Trạng thái | Ghi chú / Kiểm thử |
|------------------|------------|-------------------|
| `package.json` | ✅ Hoàn thành | Đã `npm install axios` |
| `.env` | ✅ Hoàn thành | `VITE_API_BASE_URL=http://localhost:8000/api/v1` |
| `src/lib/api.ts` | ✅ Hoàn thành | Axios client cho Admin |
| `src/contexts/AuthContext.tsx` | ✅ Hoàn thành | Auth Context kiểm tra quyền role (`admin`, `super_admin`, `staff`) |

---

## 🟢 PHASE 1: CORE BACKEND & MIGRATIONS (ĐÃ HOÀN THÀNH — 08/08/2026)

### 1. Multi-Database Migrations & Models

| Connection / Module | Schema / Table | Model Class | Trạng thái |
|---------------------|----------------|-------------|------------|
| `main` | `users`, `roles`, `permissions`, `model_has_*`, `role_has_*` | `App\Modules\User\Models\User`, `Role`, `Permission` | ✅ Executed & Seeded |
| `main` | `orders`, `order_items`, `order_saga_logs`, `order_outbox_events`, `payments` | `App\Modules\Order\Models\Order`, `OrderItem`, `OrderSagaLog`, `OrderOutboxEvent`, `Payment` | ✅ Executed |
| `shop` | `categories`, `brands`, `products`, `product_variants`, `inventory_transactions`, `carts`, `cart_items` | `App\Modules\Shop\Models\Category`, `Brand`, `Product`, `ProductVariant`, `InventoryTransaction`, `Cart`, `CartItem` | ✅ Executed & Seeded |
| `booking` | `courts`, `court_pricing_rules`, `time_slots`, `holds`, `bookings`, `booking_items`, `booking_status_history`, `checkin_logs` | `App\Modules\Booking\Models\Court`, `CourtPricingRule`, `TimeSlot`, `Hold`, `Booking`, `BookingItem`, `BookingStatusHistory`, `CheckInLog` | ✅ Executed & Seeded |

---

### 2. Business Logic Services & Controllers

| Module / Service | File Path | Chức năng | Trạng thái |
|------------------|-----------|-----------|------------|
| **User** | `AuthController.php`, `ProfileController.php` | Đăng ký, đăng nhập Sanctum token, lấy/cập nhật hồ sơ cá nhân | ✅ Passed |
| **Shop** | `ProductController.php`, `CategoryController.php`, `BrandController.php`, `CartController.php`, `CartService.php` | Quản lý sản phẩm, thương hiệu, danh mục, giỏ hàng session/user với validation tồn kho | ✅ Passed |
| **Booking** | `CourtController.php`, `SlotController.php`, `HoldController.php`, `CheckInAdminController.php`, `SlotGenerationService.php`, `HoldService.php` | Tự động tạo slot 1 tiếng, giữ sân (Hold) atomic với DB Pessimistic Lock & TTL 10 phút, checkin QR | ✅ Passed |
| **Order / Saga** | `CheckoutController.php`, `OrderController.php`, `PaymentWebhookController.php`, `CheckoutOrchestrator.php`, `PaymentService.php` | Saga Orchestration đa cơ sở dữ liệu: Trừ kho `shop` -> Tạo đơn hàng `main` -> Chuyển Hold thành Booking `booking` -> Tạo VietQR/MoMo Payment + Hoàn tác tự động (Compensation) khi lỗi | ✅ Passed |

---

### 3. Bug đã xử lý trong Phase 1

1. 🐛 **Lỗi Class `PermissionRegistrar` Not Found trong Migration:** `database/migrations/2026_08_08_000001_create_permission_tables.php` dùng trực tiếp tên cột `'permission_id'` và `'role_id'` để tránh phụ thuộc vào Autoloader trong lúc chạy migration.
2. 🐛 **Lỗi Missing Service Provider in Autoload:** Đăng ký `SanctumServiceProvider` và `PermissionServiceProvider` vào `bootstrap/providers.php`.
3. 🐛 **Lỗi Multi-DB Spatie Permission Model Connection:** Tạo custom models `App\Modules\User\Models\Role` và `Permission` với `$connection = 'main';` và cấu hình lại `config/permission.php` để Spatie tự động truy vấn trên database `main`.
4. 🐛 **Lỗi php extension `ext-gd` missing khi install Composer:** Dùng `--ignore-platform-reqs` để cài đặt hoàn chỉnh `simple-qrcode`, `sanctum`, `laravel-permission`, `query-builder`.

---

### 4. Kết quả kiểm thử Phase 1

- `php artisan migrate:fresh --seed` (với SQLite fallback test multi-DB): **Pass 100%**
  - `0001_01_01_000000_create_users_table`: DONE
  - `2026_08_08_000001_create_permission_tables`: DONE
  - `2026_08_08_000002_create_shop_tables`: DONE
  - `2026_08_08_000003_create_booking_tables`: DONE
  - `2026_08_08_000004_create_order_tables`: DONE
  - `RoleSeeder`: 4 roles (`customer`, `staff`, `admin`, `super_admin`) created.
  - `AdminUserSeeder`: 3 users (`admin@demopick.vn`, `staff@demopick.vn`, `customer@demopick.vn`) seeded with hashed passwords & roles.
  - `ShopSeeder`: 4 categories, 3 brands, 4 products with variants & initial stock seeded.
  - `BookingSeeder`: 4 courts (Sân 1, Sân 2, Sân VIP 1, Sân VIP 2) with pricing rules & 7 days time slots generated.
- `php artisan route:list --path=api`: **23 endpoints active and registered**.

## 🟢 PHASE 2: CUSTOMER PORTAL SPA INTEGRATION (ĐÃ HOÀN THÀNH — 08/08/2026)

### 1. API Services Layer (`src/services/`)

| File / Component | Chức năng | Trạng thái |
|------------------|-----------|------------|
| `auth.service.ts` | Login, Register, Logout, Get Profile, Update Profile APIs | ✅ Passed |
| `shop.service.ts` | Get Categories, Brands, Products, Product Detail by Slug | ✅ Passed |
| `cart.service.ts` | Get Cart, Add Item, Update Quantity, Remove Item | ✅ Passed |
| `booking.service.ts` | Get Courts, Get Slots by Date, Create Hold, Release Hold | ✅ Passed |
| `order.service.ts` | Checkout, Get Orders List, Get Order Detail by Code | ✅ Passed |

---

### 2. UI Pages & Components (`src/pages/` & `src/components/`)

| File / Component | Chức năng | Trạng thái |
|------------------|-----------|------------|
| `Login.tsx` & `Register.tsx` | Form đăng nhập & đăng ký với validation & preset demo customer (`customer@demopick.vn`) | ✅ Passed |
| `Profile.tsx` | Quản lý hồ sơ cá nhân và thông tin tài khoản | ✅ Passed |
| `ProductCard.tsx` | Card sản phẩm với giá, nhãn thương hiệu, trạng thái tồn kho & nút Thêm giỏ | ✅ Passed |
| `Products.tsx` & `ProductDetail.tsx` | Catalog tìm kiếm & bộ lọc danh mục/thương hiệu + Trang chi tiết chọn biến thể | ✅ Passed |
| `BookingGrid.tsx` & `CourtBooking.tsx` | Lưới lịch 7 ngày trực quan, phân biệt giờ thường/giờ cao điểm (17h-21h), chọn slot giữ sân | ✅ Passed |
| `HoldTimerToast.tsx` | Component toast nổi đếm ngược 10 phút khoá sân tự động kèm nút Thanh toán | ✅ Passed |
| `Cart.tsx` | Giỏ hàng tăng/giảm số lượng, xóa item & tính tổng thanh toán tức thì | ✅ Passed |
| `Checkout.tsx` | Chọn phương thức thanh toán VietQR (mã QR), MoMo, hoặc Tiền mặt tại sân | ✅ Passed |
| `OrderSuccess.tsx` | Giao diện hiển thị VietQR tự động / nút chuyển cổng MoMo / Mã QR Checkin sân | ✅ Passed |
| `Orders.tsx` | Lịch sử đơn hàng, trạng thái đơn và mã QR Checkin của từng booking | ✅ Passed |
| `CustomerLayout.tsx` & `App.tsx` | Header navigation với badge giỏ hàng tự động, User dropdown menu & 11 Router paths | ✅ Passed |

---

### 3. Kết quả kiểm thử Customer Portal

- `npm run build`: **Pass 100%** (2592 modules transformed, built in 13.30s 0 error).

---

## 🟢 PHASE 3: ADMIN DASHBOARD INTEGRATION & CLEANUP (ĐÃ HOÀN THÀNH — 08/08/2026)

### 1. Re-architecting Admin Portal (`PickleBallONE/`)

| File / Component | Chức năng | Trạng thái |
|------------------|-----------|------------|
| `Login.tsx` | Trang đăng nhập Quản trị viên (`admin@demopick.vn` / `staff@demopick.vn`) bảo mật bằng Sanctum Bearer Token | ✅ Passed |
| `ProtectedRoute.tsx` | Guard điều hướng bảo vệ toàn bộ các trang Admin, tự động chuyển về `/login` nếu chưa đăng nhập | ✅ Passed |
| `AppLayout.tsx` | Header & Sidebar chuẩn hóa thương hiệu **DemoPick ONE Admin**, hiển thị avatar/email user, nút Check-in QR & Đăng xuất | ✅ Passed |
| `CheckInDialog.tsx` | Dialog quét mã QR / nhập mã đặt sân xác minh khách đến chơi tức thì tại cổng | ✅ Passed |
| `Dashboard.tsx` | Tổng quan doanh thu real-time, trạng thái cụm 4 sân Pickleball & các nút truy cập nhanh | ✅ Passed |
| `CourtMap.tsx` | Lưới lịch sân trực tiếp theo thời gian thực (Sân 1, Sân 2, Sân VIP 1, Sân VIP 2) loại bỏ hoàn toàn mock data | ✅ Passed |
| `POS.tsx` | Máy bán hàng tại quầy kết nối trực tiếp API Backend (`/api/v1/products` & `/checkout`) | ✅ Passed |
| `Inventory.tsx` | Quản lý kho hàng, khai báo **Thêm sản phẩm mới** & **Nhập hàng cộng tồn kho** đợt mới | ✅ Passed |
| `Orders.tsx` | Quản lý hóa đơn độc lập, hỗ trợ **Chỉnh sửa & In lại hóa đơn** khi lỡ bấm chọn nhầm món tại quầy POS | ✅ Passed |
| `Payments.tsx` | Trang Quản lý Thanh toán & Chuyển khoản VietQR/MoMo: Hỗ trợ **Cấp độ 1 (Duyệt thủ công)** & **Cấp độ 2 (Giả lập Webhook 100%)** | ✅ Passed |

---

### 2. Kết quả kiểm thử toàn hệ thống

- **Backend API (`PickleBall/`):** `php artisan route:list` — **23 endpoints RESTful v1 active**.
- **Customer Portal SPA (`demopick-client/`):** `npm run build` — **Pass 100%** (2592 modules transformed).
- **Admin Dashboard SPA (`PickleBallONE/`):** `npm run build` — **Pass 100%** (2609 modules transformed).
- **1-Click Execution Scripts (`run-all.bat` & `run-all.ps1`):** Hoạt động hoàn hảo.


