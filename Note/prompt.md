**Đóng vai:** Bạn là một Kiến trúc sư phần mềm (Software Architect) và Chuyên gia phát triển hệ thống Thương mại điện tử (E-commerce). Hãy giúp tôi thiết kế kiến trúc, lên khung cơ sở dữ liệu và danh sách API cho dự án "Nền tảng Thương mại điện tử thiết bị thể thao tích hợp dịch vụ đặt sân Pickleball (DemoPick Web)" dựa trên mô hình Kiến trúc Hướng dịch vụ (SOA).

**1. Bối cảnh và Mục tiêu dự án:**

Hệ thống DemoPick Web là một giải pháp quản lý toàn diện giải quyết hai bài toán kinh doanh: (1) Phân phối thiết bị thể thao vật lý (vợt Pickleball, bóng, phụ kiện) và (2) Quản lý lưới lịch và đặt thuê sân Pickleball. Điểm mấu chốt của dự án là phải xây dựng được hai giao diện tách biệt (Customer Portal và Admin Dashboard) cùng kết nối với một hệ thống Back-end được chia thành các Microservices độc lập để đảm bảo tính mở rộng và chịu tải.

**2. Yêu cầu Kiến trúc Hệ thống (SOA):**

Hệ thống giao tiếp hoàn toàn qua RESTful API chuẩn JSON, bao gồm các node chính:

- **Customer Web Client:** Giao diện mua sắm và đặt lịch dành cho khách hàng.
- **Admin Web Client:** Trang quản trị tổng thể dành cho chủ sân và nhân viên vận hành, tích hợp các dịch vụ báo cáo thống kê phức tạp.
- **Shop Service (Dịch vụ Bán lẻ):** Chịu trách nhiệm về vòng đời sản phẩm vật lý (danh mục, biến thể, tồn kho).
- **Booking Service (Dịch vụ Đặt lịch):** Xử lý logic lưới thời gian, giá tiền theo ca, thuật toán khóa ca (Locking) để chống trùng lịch.

**3. Phân hệ Giao diện Khách hàng (User Frontend):**

- **Luồng E-commerce:** Khách hàng tìm kiếm, lọc sản phẩm theo thương hiệu/giá. Có thể xem chi tiết biến thể (màu sắc, trọng lượng vợt) và thêm vào giỏ hàng.
- **Luồng Booking:** Giao diện hiển thị lịch sân trực quan (Calendar/Grid view). Trạng thái sân (Trống, Đang giữ chỗ, Đã đặt) phải được cập nhật mượt mà. Hệ thống giữ chỗ tạm thời (Hold) trong 10 phút khi khách đưa giờ vào giỏ.
- **Luồng Checkout Hợp nhất:** Giỏ hàng cho phép thanh toán đồng thời cả Sản phẩm vật lý và Ca thuê sân. Khi thanh toán xong, hệ thống điều phối trừ tồn kho ở `Shop Service`, chốt lịch ở `Booking Service` và trả về mã QR Check-in.

**4. Phân hệ Giao diện Quản trị (Admin Dashboard):**

- **Quản lý Hệ thống Sân (Court Management):** CRUD thông tin cụm sân. Khả năng thiết lập giá động (giờ vàng, ngày lễ, cuối tuần). Khóa sân khẩn cấp (bảo trì, sửa chữa lưới/mặt sân).
- **Quản lý Cửa hàng (Inventory & Order):** Nhập/xuất kho thiết bị, theo dõi biến động số lượng. Cập nhật trạng thái đơn hàng E-commerce (Chờ xử lý, Đang giao, Hoàn thành).
- **Hệ thống Báo cáo & Thống kê (Reporting Services):** Bảng điều khiển (Dashboard) trực quan tổng hợp doanh thu theo ngày/tháng, tách bạch rõ ràng nguồn thu từ tiền thuê sân và tiền bán thiết bị. Thống kê tỷ lệ lấp đầy sân (Utilization rate) và top sản phẩm bán chạy nhất.
- **Quản lý Check-in:** Giao diện cho nhân viên trực quầy quét mã QR của khách để xác nhận nhận sân hoặc xuất đồ uống/thuê vợt tại chỗ.

Hệ thống **DemoPick Web**: (1) Thương mại điện tử thiết bị Pickleball, (2) Đặt/thuê sân Pickleball. Kiến trúc SOA/Microservices, tách `Customer Web Client` và `Admin Web Client`, giao tiếp qua REST/JSON.

---

## 2. Nguyên tắc thiết kế tổng thể

- **Domain-Driven**: mỗi service sở hữu dữ liệu riêng (database-per-service), không share DB trực tiếp giữa `Shop Service` và `Booking Service`.
- **Fail-safe by default**: mọi thao tác ghi (write) phải có cơ chế rollback hoặc bù trừ (compensation).
- **Least privilege**: mọi service, mọi user, mọi CI job chỉ có quyền tối thiểu cần thiết.
- **Observable từ ngày đầu**: không thêm logging/metrics sau khi launch — thiết kế cùng lúc với service.
- **Secure by default, không phải "vá sau"**: bảo mật là một phần của Definition of Done, không phải checklist riêng cuối dự án.

---

## 3. Chi tiết kỹ thuật theo từng lớp

### 3.1 Repo Hygiene & Developer Environment (nền tảng — nhỏ nhất nhưng bắt buộc)

- **`.gitignore`** chuẩn cho Node/Java/Python tuỳ stack — đảm bảo `node_modules`, `.env`, `dist`, `.log`, `.DS_Store` không bị commit.
- **`.env.example`** liệt kê đầy đủ biến môi trường cần thiết (không chứa giá trị thật) để dev mới setup nhanh.
- **`.editorconfig`** + **Prettier/ESLint (hoặc tương đương)** thống nhất style code toàn team.
- **Git hooks (Husky/pre-commit framework)**:
    - `pre-commit`: lint-staged, format check, chặn commit nếu có secret bị phát hiện (dùng `gitleaks` hoặc `truffleHog`).
    - `commit-msg`: enforce Conventional Commits (`feat:`, `fix:`, `chore:`...) để tự động sinh changelog.
    - `pre-push`: chạy unit test tối thiểu trước khi push.
- **Branch protection trên GitHub/GitLab**: bắt buộc PR review (tối thiểu 1 approve), chặn force-push vào `main`/`develop`, bắt buộc CI pass trước khi merge.
- **Semantic Versioning** cho các package dùng chung (nếu có monorepo/shared libs).
- **Monorepo vs Polyrepo**: cần quyết định rõ (khuyến nghị monorepo dùng Turborepo/Nx nếu FE+BE nhiều service, giúp CI cache tốt hơn).

### 3.2 Bảo mật mã nguồn & CI/CD (Security Audit Framework — tích hợp bắt buộc)

Đây là phần bạn đã liệt kê — mình hệ thống hoá lại thành **yêu cầu thiết kế bắt buộc**, không phải chỉ để audit code người khác mà là **tiêu chuẩn bắt buộc cho chính pipeline của DemoPick Web**:

**a) Secrets & Data Leak Prevention**

- Không hardcode API key, token, mật khẩu, private key, connection string trong code — bắt buộc qua biến môi trường hoặc secret manager (AWS Secrets Manager / Vault / GitHub Encrypted Secrets).
- Bật secret-scanning tự động trong CI (gitleaks/trufflehog) chạy trên mọi PR và trên toàn bộ lịch sử git định kỳ.
- Rà soát logging: không log header/cookie, không log body request/response chứa thông tin thanh toán hoặc PII; che (mask) số điện thoại, email, số thẻ trong log.
- Không print biến môi trường hoặc dump object đầy đủ trong error handler production (tránh leak qua stack trace).

**b) CI/CD & Build Attack Surface**

- Pin GitHub Actions theo **SHA commit**, không dùng tag nổi (`@v1`) cho action bên thứ ba không rõ nguồn gốc.
- Giới hạn scope permission của `GITHUB_TOKEN` (`permissions: contents: read` mặc định, chỉ mở rộng khi cần).
- Không dùng `curl | bash` trong Dockerfile hoặc script CI để cài đặt phần mềm không rõ nguồn.
- Container: không chạy process với user `root`; dùng multi-stage build để giảm attack surface; scan image bằng Trivy/Grype trước khi push registry.
- Ký (sign) artifact/image bằng Cosign nếu triển khai lên môi trường nhạy cảm.

**c) Dependency & Supply Chain**

- Dùng lockfile (`package-lock.json`/`pnpm-lock.yaml`) và bật `npm audit` / `pip-audit` / Dependabot/Renovate tự động tạo PR vá lỗ hổng.
- Sinh SBOM (Software Bill of Materials) cho mỗi bản release (CycloneDX/Syft).
- Cảnh giác package lạ, ít download, publish gần đây, hoặc có postinstall script đáng ngờ.

**d) Deserialization & File Safety (áp dụng nếu có phần AI/ML — ví dụ gợi ý sản phẩm)**

- Không dùng `pickle`/`eval` với dữ liệu không tin cậy.
- Nếu có model AI (gợi ý sản phẩm, chatbot hỗ trợ), ưu tiên định dạng `.safetensors`, xác minh checksum nguồn model.

**e) Quy trình audit định kỳ**

- Trước mỗi release lớn, chạy audit theo khung: 🔴 Critical (backdoor, RCE, leaked key) → 🟠 Suspicious (dependency lạ, script khó hiểu) → 🟡 Weak practice (thiếu validate, crypto yếu) → ✅ Remediation plan có checklist xác minh sau khi fix.

### 3.3 Chi tiết ERD — `Shop Service` & `Booking Service` (độc lập dữ liệu)

**Shop Service** (tối thiểu các bảng):

- `products` (id, name, brand, category_id, base_price, description, status)
- `product_variants` (id, product_id, color, weight, sku, price_override, stock_qty)
- `categories`, `brands`
- `inventory_transactions` (id, variant_id, type: in/out/adjust, qty, reference_order_id, created_at) — **audit trail bắt buộc**, không cho phép update trực tiếp `stock_qty` mà không qua transaction log.
- `orders`, `order_items`, `order_status_history`
- `carts`, `cart_items` (có `expires_at` cho giỏ hàng tạm)

**Booking Service**:

- `courts` (id, name, location, status: active/maintenance)
- `court_pricing_rules` (id, court_id, day_type: weekday/weekend/holiday, time_range, multiplier/fixed_price)
- `time_slots` hoặc `booking_grid` (id, court_id, date, start_time, end_time, status: available/held/booked)
- `holds` (id, slot_id, session_id/user_id, expires_at) — **bắt buộc TTL 10 phút**, dùng Redis TTL thay vì cron job để đảm bảo tự huỷ chính xác.
- `bookings`, `booking_status_history`
- `checkin_logs` (id, booking_id, checked_in_at, staff_id)

**Nguyên tắc liên kết giữa 2 service**: không dùng foreign key vật lý xuyên service. Liên kết logic qua `reference_id` (ví dụ `unified_order_id`) do một **Order Orchestrator Service** phát hành.

### 3.4 Quy ước thiết kế API

- Versioning: `/api/v1/...`, không breaking change trong cùng version.
- Chuẩn hoá response: `{ data, error, meta }` nhất quán cho mọi endpoint.
- Pagination: `limit`/`offset` hoặc cursor-based cho danh sách sản phẩm/booking lớn.
- **Idempotency-Key header bắt buộc** cho các API tạo đơn hàng/booking để tránh double-submit khi mạng chập chờn.
- Rate limiting theo IP + theo user (đặc biệt endpoint `hold-slot` để chống bot giữ chỗ hàng loạt).
- Auth: JWT access token (short-lived) + refresh token, RBAC rõ ràng (`customer`, `staff`, `admin`, `super_admin`).
- Input validation tầng API Gateway (schema validation - Zod/Joi/Yup) trước khi vào service logic.

**Nhóm API Client (ví dụ):**

- `GET /products`, `GET /products/{id}`, `POST /cart/items`
- `GET /courts/availability?date=...`, `POST /booking/hold`, `POST /booking/confirm`
- `POST /checkout` (unified — xem mục 3.5)
- `GET /orders/{id}/qr-checkin`

**Nhóm API Admin (ví dụ):**

- `POST/PUT/DELETE /admin/courts`, `POST /admin/courts/{id}/lock` (bảo trì khẩn cấp)
- `POST /admin/pricing-rules`
- `GET /admin/reports/revenue?from=&to=&breakdown=court|shop`
- `GET /admin/reports/utilization-rate`
- `PUT /admin/orders/{id}/status`
- `POST /admin/checkin/scan`

### 3.5 Distributed Transaction — Checkout hỗn hợp (quan trọng nhất về nghiệp vụ)

Khuyến nghị **Saga Pattern (Orchestration-based)** thay vì 2-Phase Commit (không phù hợp microservices):

1. `Order Orchestrator Service` nhận request checkout → tạo `order` trạng thái `PENDING`.
2. Gọi `Booking Service.confirmHold(slot_ids)` → nếu fail, hủy toàn bộ, trả lỗi ngay.
3. Gọi `Shop Service.reserveStock(variant_ids, qty)` → nếu fail, gọi **compensating transaction** `Booking Service.releaseHold(slot_ids)`.
4. Gọi `Payment Service.charge(...)` → nếu fail, compensate cả 2 bước trên (release hold + release stock).
5. Nếu tất cả thành công → publish event `order.completed` qua message queue (Kafka/RabbitMQ) → sinh QR check-in bất đồng bộ.
6. **Outbox Pattern**: mỗi service ghi event vào bảng `outbox` cùng transaction local, một worker riêng đẩy event ra message broker — tránh mất event khi service crash giữa chừng.
7. Toàn bộ trạng thái saga lưu lại (`saga_state`) để có thể resume/retry nếu orchestrator restart giữa chừng.

### 3.6 Thanh toán & phạm vi PCI-DSS

- Không tự lưu số thẻ — dùng cổng thanh toán bên thứ ba (VNPay, MoMo, Stripe...) qua tokenization, giảm phạm vi PCI-DSS.
- Webhook từ payment gateway phải verify chữ ký (signature) trước khi xử lý.
- Idempotent xử lý webhook (payment gateway có thể gửi trùng).

### 3.7 Frontend / UI

- Design token: xanh lá nhạt (`primary`), phong cách hiện đại — cần file Figma/ảnh UI mẫu để đồng bộ màu chính xác (bạn đã đề cập sẽ cung cấp).
- Component hệ thống dùng chung giữa Client/Admin (design system riêng, ví dụ Storybook).
- Calendar/Grid đặt sân: cần realtime update (WebSocket/SSE) để tránh 2 khách cùng thấy slot "trống" đã bị người khác giữ.
- Accessibility (a11y): contrast màu, keyboard navigation, ít nhất WCAG AA cho các form quan trọng (checkout, đặt sân).
- Responsive bắt buộc cho Customer Portal (khách đặt sân trên mobile là chủ yếu).

### 3.8 Observability

- Structured logging (JSON) với `trace_id` xuyên suốt request qua nhiều service.
- Distributed tracing (OpenTelemetry + Jaeger/Tempo) — bắt buộc để debug lỗi trong Saga.
- Metrics: tỷ lệ hold hết hạn không convert thành booking, tỷ lệ lỗi checkout theo bước, độ trễ từng service.
- Alerting: cảnh báo khi tỷ lệ lỗi thanh toán > ngưỡng, khi Redis (hold) mất kết nối.

### 3.9 Testing

- Unit test cho business logic (đặc biệt thuật toán locking slot, tính giá động).
- Integration test giữa các service (contract testing — Pact).
- E2E test luồng checkout hỗn hợp (Cypress/Playwright).
- Load test riêng cho `POST /booking/hold` (kịch bản nhiều người cùng bấm 1 giờ vàng cuối tuần) bằng k6/Locust.
- Chaos testing cơ bản: giả lập `Payment Service` timeout để kiểm tra rollback có hoạt động đúng không.

### 3.10 Triển khai & Hạ tầng

- Container hoá từng service (Docker), orchestrate bằng Kubernetes hoặc ECS tuỳ ngân sách.
- Môi trường tách biệt: `dev` → `staging` → `production`, không test trực tiếp trên prod.
- Blue-green hoặc canary deployment cho các service quan trọng (Booking, Payment) để giảm rủi ro khi release.
- Backup database tự động hàng ngày + kiểm thử restore định kỳ (backup không test = không có backup).

### 3.11 Tuân thủ & Bảo vệ dữ liệu

- Tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân (Việt Nam): có chính sách quyền riêng tư rõ ràng, cho phép người dùng yêu cầu xoá dữ liệu.
- Data retention policy: log chứa PII chỉ giữ trong thời gian cần thiết (ví dụ 90 ngày) rồi tự động xoá/archive.

---

## 4. Bảng ưu tiên tổng hợp (từ nhỏ → quan trọng nhất)

| Mức độ | Hạng mục | Vì sao quan trọng |
| --- | --- | --- |
| 1 (nền tảng) | `.gitignore`, `.env.example`, pre-commit hook chặn secret | Ngăn rò rỉ ngay từ commit đầu tiên |
| 2 | Lint/format/CI pipeline cơ bản | Đảm bảo chất lượng code đồng nhất |
| 3 | Secret scanning + dependency scanning trong CI | Chặn lỗ hổng trước khi merge |
| 4 | Thiết kế DB độc lập theo service (ERD) | Nền tảng cho scalability & tránh coupling |
| 5 | Quy ước API (auth, validation, idempotency) | Chống lỗi nghiệp vụ và tấn công cơ bản |
| 6 | Redis TTL cho giữ chỗ (hold) | Trải nghiệm khách hàng + chống deadlock slot |
| 7 | Saga + Outbox cho checkout hỗn hợp | **Xương sống nghiệp vụ** — sai ở đây gây mất tiền/mất lịch |
| 8 | Observability (tracing, alerting) | Không có thì không debug được lỗi phân tán |
| 9 | Container/CI-CD hardening (pin SHA, non-root, image scan) | Chống supply-chain attack |
| 10 | Tuân thủ dữ liệu cá nhân + PCI-DSS scope | Rủi ro pháp lý nếu bỏ qua |

---

## 5. [YÊU CẦU ĐẦU RA] — phần bạn nhận lại từ AI

1. ERD chi tiết (theo mục 3.3) dạng bảng + mô tả quan hệ, cho cả 2 service.
2. Danh sách API đầy đủ (theo mục 3.4), chia Client/Admin, kèm method + mô tả ngắn.
3. Thiết kế chi tiết Saga cho checkout hỗn hợp (theo mục 3.5), có sơ đồ luồng (sequence diagram dạng text/mermaid).
4. Bảng màu & design token dựa trên UI mẫu (khi bạn cung cấp file UI).
5. Security Audit Report ban đầu cho toàn bộ thiết kế đề xuất, theo đúng khung 🔴🟠🟡✅ ở mục 3.2, **trước khi bắt đầu code**.
6. Danh sách chức năng gợi ý bổ sung — **chỉ liệt kê, chờ bạn duyệt, chưa triển khai**.

# DemoPick Web — Prompt Kiến Trúc & Yêu Cầu Kỹ Thuật Toàn Diện (Bản Mở Rộng — Stack Laravel)

> Tài liệu này là bản nâng cấp của prompt gốc bạn đưa ra. Mục tiêu: bổ sung mọi lớp chi tiết — từ những thứ "nhỏ" (repo hygiene, hooks) đến những thứ "lớn" (kiến trúc phân tán, bảo mật, tuân thủ) — để khi đưa cho một AI hoặc một đội dev, họ không bỏ sót bước nào. Cấu trúc đi từ **nền tảng (nhỏ nhất)** lên **nghiệp vụ cốt lõi (quan trọng nhất)**.
> 

> **Stack đã chốt:** Backend là **1 Laravel monolith, chia module nội bộ** (giả lập ranh giới SOA bằng code, không tách hạ tầng). Frontend là **SPA riêng biệt (Vue/React/Next)** gọi vào Laravel qua REST API thuần (không dùng Blade/Inertia). Toàn bộ mục 3.x bên dưới đã được cập nhật theo lựa chọn này.
> 

---

## 0. Cách dùng tài liệu

Đây vẫn là một **prompt** — bạn đưa nguyên văn (hoặc từng phần) cho AI/kiến trúc sư để họ output ra thiết kế thật. Phần `[YÊU CẦU ĐẦU RA]` ở cuối là phần bạn sẽ nhận lại kết quả.

---

## 1. Bối cảnh & Mục tiêu (giữ nguyên từ bản gốc)

Hệ thống **DemoPick Web**: (1) Thương mại điện tử thiết bị Pickleball, (2) Đặt/thuê sân Pickleball. Kiến trúc SOA/Microservices, tách `Customer Web Client` và `Admin Web Client`, giao tiếp qua REST/JSON.

---

## 2. Nguyên tắc thiết kế tổng thể

- **Domain-Driven**: mỗi service sở hữu dữ liệu riêng (database-per-service), không share DB trực tiếp giữa `Shop Service` và `Booking Service`.
- **Fail-safe by default**: mọi thao tác ghi (write) phải có cơ chế rollback hoặc bù trừ (compensation).
- **Least privilege**: mọi service, mọi user, mọi CI job chỉ có quyền tối thiểu cần thiết.
- **Observable từ ngày đầu**: không thêm logging/metrics sau khi launch — thiết kế cùng lúc với service.
- **Secure by default, không phải "vá sau"**: bảo mật là một phần của Definition of Done, không phải checklist riêng cuối dự án.

### 2.1 Cách hiện thực "SOA giả lập" trong 1 Laravel monolith

- **Cấu trúc module theo domain**, không theo loại file (tránh kiểu `app/Http/Controllers`, `app/Models` chung một rổ). Khuyến nghị dùng package **`nwidart/laravel-modules`** hoặc tự tổ chức:
    
    ```
    app/  Modules/    Shop/      Http/Controllers, Http/Requests, Models, Services, Events, Listeners      database/migrations, database/factories      routes/api.php    Booking/      (cấu trúc tương tự)    Order/           <- đóng vai "Order Orchestrator" (mục 3.5)    Shared/           <- DTO, Enum, Exception dùng chung
    ```
    
- **Ranh giới module = ranh giới code, không phải ranh giới hạ tầng**: Module `Shop` không được gọi thẳng Eloquent Model của `Booking` và ngược lại. Giao tiếp giữa module **chỉ qua**: (a) Service class có interface rõ ràng, hoặc (b) Laravel Event/Listener (nội bộ, đồng bộ hoặc queued).
- **Database**: dù chạy chung 1 MySQL/PostgreSQL server, vẫn tách **schema hoặc database riêng** cho từng module (`config/database.php` khai báo nhiều connection: `shop`, `booking`) và mỗi module chỉ migrate/query trong DB của mình. Đây là điểm quan trọng nhất để sau này **tách module ra thành service thật** (nếu cần scale) mà không phải viết lại tầng data.
- **Vì sao chọn hướng này**: launch nhanh hơn, chi phí vận hành thấp hơn nhiều so với multi-service thật, nhưng vẫn giữ được kỷ luật ranh giới để không rơi vào "big ball of mud".

---

## 3. Chi tiết kỹ thuật theo từng lớp

### 3.1 Repo Hygiene & Developer Environment (nền tảng — nhỏ nhất nhưng bắt buộc)

- **2 repo riêng biệt**: `demopick-api` (Laravel) và `demopick-web` (SPA) — vì frontend/backend deploy độc lập, lifecycle khác nhau. Không gộp monorepo trừ khi có lý do CI cache đặc biệt.
- **`.gitignore`**: phía Laravel dùng file `.gitignore` mặc định của `laravel new` (đã chặn `vendor/`, `.env`, `storage/*.key`, `bootstrap/cache`); phía SPA chặn `node_modules`, `.env`, `dist/build`.
- **`.env.example`** cho cả 2 repo, liệt kê đủ biến (Laravel: `DB_*` theo từng connection module, `SANCTUM_STATEFUL_DOMAINS`, `REDIS_*`, `QUEUE_CONNECTION`; SPA: `VITE_API_BASE_URL`...).
- **Code style**:
    - Laravel: **Laravel Pint** (built-in, dựa trên PHP-CS-Fixer) + **Larastan/PHPStan** (tối thiểu level 5) cho static analysis.
    - SPA: ESLint + Prettier theo convention Vue/React đã chọn.
- **Git hooks**:
    - Laravel: dùng **CaptainHook** hoặc **GrumPHP** (tương đương Husky cho PHP) — `pre-commit` chạy `pint --test`, `phpstan analyse`, và secret scan (`gitleaks`).
    - SPA: **Husky + lint-staged** như bình thường.
    - `commit-msg`: enforce Conventional Commits ở cả 2 repo.
    - `pre-push`: chạy `php artisan test` (hoặc `pest`) tối thiểu ở repo Laravel trước khi push.
- **Branch protection trên GitHub/GitLab**: bắt buộc PR review (tối thiểu 1 approve), chặn force-push vào `main`/`develop`, bắt buộc CI pass trước khi merge — áp dụng cho cả 2 repo.
- **Semantic Versioning** cho API (xem mục 3.4) để SPA biết khi nào có breaking change.

### 3.2 Bảo mật mã nguồn & CI/CD (Security Audit Framework — tích hợp bắt buộc)

Đây là phần bạn đã liệt kê — mình hệ thống hoá lại thành **yêu cầu thiết kế bắt buộc**, không phải chỉ để audit code người khác mà là **tiêu chuẩn bắt buộc cho chính pipeline của DemoPick Web**:

**a) Secrets & Data Leak Prevention**

- Không hardcode API key, token, mật khẩu, private key, connection string trong code — bắt buộc qua biến môi trường hoặc secret manager (AWS Secrets Manager / Vault / GitHub Encrypted Secrets).
- Bật secret-scanning tự động trong CI (gitleaks/trufflehog) chạy trên mọi PR và trên toàn bộ lịch sử git định kỳ.
- Rà soát logging: không log header/cookie, không log body request/response chứa thông tin thanh toán hoặc PII; che (mask) số điện thoại, email, số thẻ trong log.
- Không print biến môi trường hoặc dump object đầy đủ trong error handler production (tránh leak qua stack trace).

**b) CI/CD & Build Attack Surface**

- Pin GitHub Actions theo **SHA commit**, không dùng tag nổi (`@v1`) cho action bên thứ ba không rõ nguồn gốc.
- Giới hạn scope permission của `GITHUB_TOKEN` (`permissions: contents: read` mặc định, chỉ mở rộng khi cần).
- Không dùng `curl | bash` trong Dockerfile hoặc script CI để cài đặt phần mềm không rõ nguồn.
- Container: không chạy process với user `root`; dùng multi-stage build để giảm attack surface; scan image bằng Trivy/Grype trước khi push registry.
- Ký (sign) artifact/image bằng Cosign nếu triển khai lên môi trường nhạy cảm.

**c) Dependency & Supply Chain**

- Laravel: commit `composer.lock`, chạy **`composer audit`** (built-in từ Composer 2.4+) trong CI để phát hiện package có CVE đã biết.
- SPA: commit lockfile tương ứng, bật `npm audit`/`pnpm audit`.
- Bật **Dependabot/Renovate** cho cả `composer.json` và `package.json` để tự động tạo PR vá lỗ hổng.
- Theo dõi **Laravel Security Advisories** (laravel.com/docs/releases) — không dùng bản Laravel/PHP đã hết hỗ trợ bảo mật.
- Sinh SBOM (CycloneDX cho PHP: `cyclonedx/cyclonedx-php-composer`) cho mỗi bản release.
- Cảnh giác package lạ, ít download, publish gần đây, hoặc có postinstall/composer script đáng ngờ.

**d) Deserialization & File Safety (áp dụng nếu có phần AI/ML — ví dụ gợi ý sản phẩm)**

- Không dùng `pickle`/`eval` với dữ liệu không tin cậy.
- Nếu có model AI (gợi ý sản phẩm, chatbot hỗ trợ), ưu tiên định dạng `.safetensors`, xác minh checksum nguồn model.

**e) Quy trình audit định kỳ**

- Trước mỗi release lớn, chạy audit theo khung: 🔴 Critical (backdoor, RCE, leaked key) → 🟠 Suspicious (dependency lạ, script khó hiểu) → 🟡 Weak practice (thiếu validate, crypto yếu) → ✅ Remediation plan có checklist xác minh sau khi fix.

### 3.3 Chi tiết ERD — `Shop Service` & `Booking Service` (độc lập dữ liệu)

**Shop Service** (tối thiểu các bảng):

- `products` (id, name, brand, category_id, base_price, description, status)
- `product_variants` (id, product_id, color, weight, sku, price_override, stock_qty)
- `categories`, `brands`
- `inventory_transactions` (id, variant_id, type: in/out/adjust, qty, reference_order_id, created_at) — **audit trail bắt buộc**, không cho phép update trực tiếp `stock_qty` mà không qua transaction log.
- `orders`, `order_items`, `order_status_history`
- `carts`, `cart_items` (có `expires_at` cho giỏ hàng tạm)

**Booking Service**:

- `courts` (id, name, location, status: active/maintenance)
- `court_pricing_rules` (id, court_id, day_type: weekday/weekend/holiday, time_range, multiplier/fixed_price)
- `time_slots` hoặc `booking_grid` (id, court_id, date, start_time, end_time, status: available/held/booked)
- `holds` (id, slot_id, session_id/user_id, expires_at) — **bắt buộc TTL 10 phút**, dùng Redis TTL thay vì cron job để đảm bảo tự huỷ chính xác.
- `bookings`, `booking_status_history`
- `checkin_logs` (id, booking_id, checked_in_at, staff_id)

**Nguyên tắc liên kết giữa 2 service**: không dùng foreign key vật lý xuyên service/module. Liên kết logic qua `reference_id` (ví dụ `unified_order_id`) do module **`Order`** (Order Orchestrator — theo mục 2.1) phát hành.

**Áp dụng trong Laravel:**

- Mỗi module (`Shop`, `Booking`, `Order`) có thư mục `database/migrations` riêng, đăng ký qua `loadMigrationsFrom()` trong `ServiceProvider` của module đó.
- Khai báo connection riêng trong `config/database.php` (`'shop' => [...]`, `'booking' => [...]`) và Model của mỗi module chỉ định `protected $connection = 'shop';` tương ứng — **không Eloquent relationship xuyên connection**.
- Dùng **Eloquent Model + Migration file** làm nguồn sự thật cho schema thay vì ERD vẽ tay riêng — nhưng vẫn nên xuất ERD (dbdiagram.io hoặc `laravel-erd`) để review trước khi viết migration.

### 3.4 Quy ước thiết kế API

- Versioning: `/api/v1/...`, không breaking change trong cùng version.
- Chuẩn hoá response: `{ data, error, meta }` nhất quán cho mọi endpoint.
- Pagination: `limit`/`offset` hoặc cursor-based cho danh sách sản phẩm/booking lớn.
- **Idempotency-Key header bắt buộc** cho các API tạo đơn hàng/booking để tránh double-submit khi mạng chập chờn.
- Rate limiting theo IP + theo user (đặc biệt endpoint `hold-slot` để chống bot giữ chỗ hàng loạt).
- **Auth**: dùng **Laravel Sanctum** ở chế độ **token-based** (không phải cookie/stateful SPA session) vì SPA tách project riêng, khả năng deploy khác domain/subdomain — SPA lưu bearer token, gửi qua header `Authorization`. RBAC qua package **`spatie/laravel-permission`** (`customer`, `staff`, `admin`, `super_admin`).
- Input validation dùng **Form Request classes** riêng cho từng endpoint (`StoreOrderRequest`, `HoldSlotRequest`...) — không validate trong controller.
- Response chuẩn hoá qua **API Resource classes** (`ProductResource`, `BookingResource`) để tách hẳn cấu trúc DB khỏi cấu trúc trả về cho SPA.
- **CORS**: cấu hình `config/cors.php` chỉ cho phép domain SPA thật (production + staging), không để  khi đã bật credentials.
- Rate limiting dùng middleware `throttle:` built-in của Laravel, custom limiter riêng cho `booking/hold` (chặt hơn endpoint thường) qua `RateLimiter::for()`.

**Nhóm API Client (ví dụ):**

- `GET /products`, `GET /products/{id}`, `POST /cart/items`
- `GET /courts/availability?date=...`, `POST /booking/hold`, `POST /booking/confirm`
- `POST /checkout` (unified — xem mục 3.5)
- `GET /orders/{id}/qr-checkin`

**Nhóm API Admin (ví dụ):**

- `POST/PUT/DELETE /admin/courts`, `POST /admin/courts/{id}/lock` (bảo trì khẩn cấp)
- `POST /admin/pricing-rules`
- `GET /admin/reports/revenue?from=&to=&breakdown=court|shop`
- `GET /admin/reports/utilization-rate`
- `PUT /admin/orders/{id}/status`
- `POST /admin/checkin/scan`

### 3.5 Distributed Transaction — Checkout hỗn hợp (quan trọng nhất về nghiệp vụ)

Khuyến nghị **Saga Pattern (Orchestration-based)** thay vì 2-Phase Commit (không phù hợp microservices):

1. `Order Orchestrator Service` nhận request checkout → tạo `order` trạng thái `PENDING`.
2. Gọi `Booking Service.confirmHold(slot_ids)` → nếu fail, hủy toàn bộ, trả lỗi ngay.
3. Gọi `Shop Service.reserveStock(variant_ids, qty)` → nếu fail, gọi **compensating transaction** `Booking Service.releaseHold(slot_ids)`.
4. Gọi `Payment Service.charge(...)` → nếu fail, compensate cả 2 bước trên (release hold + release stock).
5. Nếu tất cả thành công → publish event `order.completed` qua message queue (Kafka/RabbitMQ) → sinh QR check-in bất đồng bộ.
6. **Outbox Pattern**: mỗi service ghi event vào bảng `outbox` cùng transaction local, một worker riêng đẩy event ra message broker — tránh mất event khi service crash giữa chừng.
7. Toàn bộ trạng thái saga lưu lại (`saga_state`) để có thể resume/retry nếu orchestrator restart giữa chừng.

**Áp dụng trong Laravel monolith:**

- Vì mỗi module dùng **connection DB riêng** (mục 3.3), `DB::transaction()` thường của Laravel **không** bọc được cả 2 module trong 1 transaction thật — do đó Saga vẫn cần thiết dù đang chạy monolith (đây chính là lý do nên tách connection ngay từ đầu, để logic Saga viết ra dùng được luôn khi tách service thật sau này).
- Bước gọi giữa module: dùng trực tiếp **Service class** của module kia (đồng bộ, cùng process — nhanh hơn HTTP call thật) cho bước 2-3, nhưng vẫn tổ chức theo đúng thứ tự Saga + compensation ở trên.
- Bước phát `order.completed` và các việc "phụ" (sinh QR, gửi email/notification): dùng **Laravel Event + Queued Listener** (`ShouldQueue`), chạy qua **Redis queue**, giám sát bằng **Laravel Horizon**.
- **Outbox pattern**: thêm bảng `order_outbox_events` trong DB của module `Order`, ghi trong cùng transaction local lúc tạo/update order; một **Scheduled Command** (`php artisan schedule:run` mỗi phút, hoặc queue worker riêng) đọc bảng này và dispatch event thật — đảm bảo không mất event nếu server crash giữa `DB commit` và `dispatch()`.
- `saga_state` lưu trong bảng `orders.status` + bảng `order_saga_logs` (từng bước, timestamp, kết quả) để debug khi cần retry thủ công.

### 3.6 Thanh toán & phạm vi PCI-DSS

- Không tự lưu số thẻ — dùng cổng thanh toán bên thứ ba (VNPay, MoMo, Stripe...) qua tokenization, giảm phạm vi PCI-DSS.
- Webhook từ payment gateway phải verify chữ ký (signature) trước khi xử lý.
- Idempotent xử lý webhook (payment gateway có thể gửi trùng).

### 3.7 Frontend / UI (SPA riêng biệt — Vue/React/Next)

- **2 SPA app riêng** (Customer + Admin) hoặc 1 SPA có route-splitting theo role — quyết định dựa trên mức độ khác biệt UI (Admin có nhiều báo cáo/bảng phức tạp nên thường tách app riêng, deploy riêng, bundle nhẹ hơn).
- Gọi API Laravel qua HTTP client tập trung (axios/fetch wrapper) — 1 nơi xử lý gắn token, refresh token, xử lý lỗi 401 (redirect login) và 429 (rate limit).
- Realtime cho Calendar/Grid đặt sân: dùng **Laravel Echo + Reverb** (hoặc Pusher) — broadcast event `slot.held`/`slot.released` từ module `Booking` để SPA cập nhật trạng thái sân real-time, tránh 2 khách cùng thấy slot "trống" đã bị người khác giữ.
- Design token: xanh lá nhạt (`primary`), phong cách hiện đại — cần file Figma/ảnh UI mẫu để đồng bộ màu chính xác (bạn đã đề cập sẽ cung cấp).
- Component hệ thống dùng chung giữa Client/Admin nếu 2 SPA share code (ví dụ qua package nội bộ hoặc Storybook).
- Accessibility (a11y): contrast màu, keyboard navigation, ít nhất WCAG AA cho các form quan trọng (checkout, đặt sân).
- Responsive bắt buộc cho Customer Portal (khách đặt sân trên mobile là chủ yếu).
- **CSRF**: vì dùng token-based Sanctum (không cookie), không cần CSRF token cho API — nhưng vẫn cần bật CSRF nếu có bất kỳ form nào submit trực tiếp tới Laravel (thường là không, vì SPA thuần).

### 3.8 Observability

- **Logging**: structured JSON log qua Laravel `Log` channel, gắn `trace_id`/`request_id` bằng middleware tự viết, xuyên suốt qua các Job/Listener queued (truyền `trace_id` trong payload job).
- **Laravel Telescope** cho môi trường dev/staging (debug query, job, request) — **tắt hẳn ở production** (rủi ro lộ data nếu để public).
- **Laravel Horizon** để giám sát queue (Redis) — theo dõi job Saga compensation có bị fail/retry liên tục không.
- **Laravel Pulse** hoặc Sentry/Bugsnag cho error tracking + performance ở production.
- Metrics riêng nghiệp vụ: tỷ lệ hold hết hạn không convert thành booking, tỷ lệ lỗi checkout theo bước, độ trễ từng bước Saga — log vào bảng `order_saga_logs` hoặc đẩy qua metrics service (Prometheus + Grafana nếu cần dashboard riêng).
- Alerting: cảnh báo khi tỷ lệ lỗi thanh toán > ngưỡng, khi Redis (hold/queue) mất kết nối.

### 3.9 Testing

- **Pest** (khuyến nghị hơn PHPUnit thuần cho Laravel — cú pháp gọn, vẫn chạy trên PHPUnit) cho unit/feature test.
- Unit test cho business logic (đặc biệt thuật toán locking slot dùng Redis TTL, tính giá động theo `court_pricing_rules`).
- Feature test cho từng API endpoint (dùng `RefreshDatabase` + factory/seeder theo module).
- Test riêng cho từng bước Saga + compensation (giả lập `Shop Service::reserveStock` throw exception → assert `Booking::releaseHold` được gọi).
- E2E test luồng checkout hỗn hợp trên SPA (Cypress/Playwright).
- Load test riêng cho `POST /booking/hold` (kịch bản nhiều người cùng bấm 1 giờ vàng cuối tuần) bằng k6 — vì đây là nơi dễ race-condition nhất.
- Chaos testing cơ bản: giả lập Payment gateway timeout để kiểm tra rollback/compensation hoạt động đúng.

### 3.10 Triển khai & Hạ tầng

- Laravel API: deploy qua **Laravel Forge** (VPS truyền thống) hoặc **Laravel Vapor** (serverless, nếu muốn auto-scale không quản server) — cân nhắc theo ngân sách.
- Cân nhắc **Laravel Octane** (Swoole/RoadRunner) nếu traffic cao, giảm overhead bootstrap framework mỗi request.
- Queue worker (cho Saga/Outbox) chạy qua **Supervisor** (Forge) hoặc managed queue (Vapor + SQS) — đảm bảo worker tự restart khi crash.
- SPA: deploy tách riêng qua Vercel/Netlify (nếu Next.js) hoặc S3+CloudFront (Vue/React build tĩnh) — độc lập hoàn toàn với vòng đời deploy của API.
- Môi trường tách biệt: `dev` → `staging` → `production` cho cả 2 repo, không test trực tiếp trên prod.
- Backup database tự động hàng ngày (riêng từng connection/schema module) + kiểm thử restore định kỳ.

### 3.11 Tuân thủ & Bảo vệ dữ liệu

- Tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân (Việt Nam): có chính sách quyền riêng tư rõ ràng, cho phép người dùng yêu cầu xoá dữ liệu.
- Data retention policy: log chứa PII chỉ giữ trong thời gian cần thiết (ví dụ 90 ngày) rồi tự động xoá/archive.

### 3.12 Danh sách package Laravel đề xuất (tổng hợp)

| Package | Vai trò |
| --- | --- |
| `laravel/sanctum` | Auth token cho SPA + mobile sau này |
| `spatie/laravel-permission` | RBAC (role/permission) |
| `nwidart/laravel-modules` (tuỳ chọn) | Tổ chức module rõ ràng thay vì tự quản |
| `laravel/horizon` | Giám sát queue Redis (Saga, notification) |
| `laravel/telescope` | Debug dev/staging |
| `laravel/pulse` | Metrics performance production |
| `laravel/reverb` hoặc `pusher/pusher-php-server` | Realtime broadcast (slot trạng thái) |
| `larastan/larastan` | Static analysis (PHPStan cho Laravel) |
| `laravel/pint` | Code style (built-in) |
| `pestphp/pest` | Testing |
| `spatie/laravel-query-builder` | Filter/sort API sản phẩm theo query param an toàn |
| `spatie/laravel-medialibrary` | Quản lý ảnh sản phẩm/sân |
| `barryvdh/laravel-cors` (nếu không dùng CORS built-in) | Cấu hình CORS cho SPA |
| `simplesoftwareio/simple-qrcode` hoặc `endroid/qr-code` | Sinh QR check-in |

---

## 4. Bảng ưu tiên tổng hợp (từ nhỏ → quan trọng nhất)

| Mức độ | Hạng mục | Vì sao quan trọng |
| --- | --- | --- |
| 1 (nền tảng) | `.gitignore`, `.env.example`, pre-commit hook chặn secret | Ngăn rò rỉ ngay từ commit đầu tiên |
| 2 | Lint/format/CI pipeline cơ bản | Đảm bảo chất lượng code đồng nhất |
| 3 | Secret scanning + dependency scanning trong CI | Chặn lỗ hổng trước khi merge |
| 4 | Thiết kế DB độc lập theo service (ERD) | Nền tảng cho scalability & tránh coupling |
| 5 | Quy ước API (auth, validation, idempotency) | Chống lỗi nghiệp vụ và tấn công cơ bản |
| 6 | Redis TTL cho giữ chỗ (hold) | Trải nghiệm khách hàng + chống deadlock slot |
| 7 | Saga + Outbox cho checkout hỗn hợp | **Xương sống nghiệp vụ** — sai ở đây gây mất tiền/mất lịch |
| 8 | Observability (tracing, alerting) | Không có thì không debug được lỗi phân tán |
| 9 | Container/CI-CD hardening (pin SHA, non-root, image scan) | Chống supply-chain attack |
| 10 | Tuân thủ dữ liệu cá nhân + PCI-DSS scope | Rủi ro pháp lý nếu bỏ qua |

---

## 5. [YÊU CẦU ĐẦU RA] — phần bạn nhận lại từ AI

1. ERD chi tiết (theo mục 3.3) dạng bảng + mô tả quan hệ, cho cả 2 service.
2. Danh sách API đầy đủ (theo mục 3.4), chia Client/Admin, kèm method + mô tả ngắn.
3. Thiết kế chi tiết Saga cho checkout hỗn hợp (theo mục 3.5), có sơ đồ luồng (sequence diagram dạng text/mermaid).
4. Bảng màu & design token dựa trên UI mẫu (khi bạn cung cấp file UI).
5. Security Audit Report ban đầu cho toàn bộ thiết kế đề xuất, theo đúng khung 🔴🟠🟡✅ ở mục 3.2, **trước khi bắt đầu code**.
6. Danh sách chức năng gợi ý bổ sung — **chỉ liệt kê, chờ bạn duyệt, chưa triển khai**.