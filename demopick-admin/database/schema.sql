-- ========================================================
-- Cấu hình kết nối tham khảo (dành cho Backend)
-- Tên DB tương ứng với cấu hình của bạn:
-- DB_HOST=localhost
-- DB_PORT=5432
-- DB_NAME=PickleBall
-- DB_USER=RoleBall
-- DB_PASSWORD=PickcleBallDB
-- ========================================================

-- Chạy file này trên pgAdmin 4 để khởi tạo các bảng
-- Lưu ý: Bạn cần tạo database "PickleBall" trước khi chạy script.

-- 1. Bảng Khách hàng (Áp dụng Fixed vs Casual model)
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    customer_code VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE,
    player_level VARCHAR(50) DEFAULT 'NEWBIE', -- Trình độ (NEWBIE, PRO, v.v.)
    customer_type VARCHAR(20) DEFAULT 'CASUAL', -- Loại khách (FIXED, CASUAL)
    total_spent DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng Sân bóng (Pickleball, Tennis, v.v.)
CREATE TABLE IF NOT EXISTS courts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    court_type VARCHAR(50) NOT NULL, -- PICKLEBALL, TENNIS, PADEL
    price_per_hour DECIMAL(15, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'AVAILABLE', -- AVAILABLE, PLAYING, MAINTENANCE
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bảng Đặt Sân (Bookings)
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    court_id INT REFERENCES courts(id),
    customer_id INT REFERENCES customers(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'SCHEDULED', -- SCHEDULED, COMPLETED, CANCELLED
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bảng Danh mục Kho / Dịch vụ POS
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL -- POS (Bán hàng) hoặc INVENTORY (Kho)
);

-- 5. Bảng Sản phẩm (Đồ uống, Thuê vợt, Phụ kiện)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE,
    name VARCHAR(100) NOT NULL,
    category_id INT REFERENCES categories(id),
    type VARCHAR(50), -- DRINKS, RACKETS, ACCESSORIES
    stock INT DEFAULT 0,
    max_stock INT DEFAULT 100,
    price DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Healthy', -- Healthy, Warning, Critical Low
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Bảng Hóa đơn POS (Orders)
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_code VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT REFERENCES customers(id), -- Có thể NULL nếu khách vãng lai mua lẻ
    booking_id INT REFERENCES bookings(id), -- Hóa đơn được gắn liền với 1 lượt đặt sân (Tùy chọn)
    subtotal DECIMAL(15, 2) NOT NULL,
    discount DECIMAL(15, 2) DEFAULT 0.00,
    surcharge DECIMAL(15, 2) DEFAULT 0.00,
    total DECIMAL(15, 2) NOT NULL,
    payment_method VARCHAR(50), -- CASH, TRANSFER
    status VARCHAR(20) DEFAULT 'PAID', -- PAID, PENDING, CANCELLED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Bảng Chi tiết Hóa đơn (Order Items)
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    price_at_time DECIMAL(15, 2) NOT NULL -- Lưu giá trị tiền ngay thời điểm bán để tránh báo cáo bị thay đổi khi giá update
);

-- 8. Bảng Lich sử Kho (Inventory Transactions - Giao dịch Nhập/Mất/Xuất)
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id),
    transaction_type VARCHAR(20), -- IMPORT, EXPORT, POS_DEDUCTION, LOSS
    quantity_changed INT NOT NULL,
    reference_id INT, -- Có thể là Order ID nếu xuất từ POS
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- Tạo Function để tự động cập nhật updated_at
-- ========================================================
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON customers
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();
