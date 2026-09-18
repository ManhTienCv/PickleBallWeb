<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác Nhận Đơn Hàng DemoPick Club</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F1F5F9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0F172A;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #F1F5F9;
      padding: 32px 12px;
    }
    .main-card {
      max-width: 620px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 20px;
      border: 1px solid #E2E8F0;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
      padding: 32px 24px;
      text-align: center;
    }
    .logo-container {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
    }
    .logo-badge {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      border-radius: 12px;
      display: inline-block;
      line-height: 40px;
      color: #ffffff;
      font-weight: 900;
      font-size: 20px;
      text-align: center;
    }
    .logo-text {
      color: #ffffff;
      font-size: 26px;
      font-weight: 900;
      letter-spacing: -0.5px;
      margin: 0;
      display: inline-block;
      vertical-align: middle;
    }
    .logo-highlight {
      color: #10B981;
    }
    .banner {
      padding: 24px 32px;
      background-color: #ECFDF5;
      border-bottom: 1px solid #D1FAE5;
      text-align: center;
    }
    .banner-title {
      color: #065F46;
      font-size: 19px;
      font-weight: 800;
      margin: 0 0 6px 0;
    }
    .banner-sub {
      color: #047857;
      font-size: 13px;
      font-weight: 500;
      margin: 0;
    }
    .content {
      padding: 32px;
    }
    .greeting {
      font-size: 15px;
      line-height: 1.6;
      color: #334155;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748B;
      margin: 20px 0 10px 0;
    }
    .info-card {
      background-color: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 14px;
      padding: 16px 20px;
      margin-bottom: 20px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      padding: 6px 0;
      border-bottom: 1px dashed #E2E8F0;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      color: #64748B;
      font-weight: 500;
    }
    .info-val {
      color: #0F172A;
      font-weight: 700;
      text-align: right;
    }
    .status-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 800;
    }
    .status-paid {
      background-color: #DCFCE7;
      color: #15803D;
    }
    .status-cod {
      background-color: #FEF3C7;
      color: #B45309;
    }
    .item-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0 24px 0;
      font-size: 13px;
    }
    .item-table th {
      background-color: #F8FAFC;
      color: #475569;
      font-weight: 700;
      text-align: left;
      padding: 10px 14px;
      border-bottom: 1px solid #E2E8F0;
      border-top: 1px solid #E2E8F0;
    }
    .item-table td {
      padding: 12px 14px;
      border-bottom: 1px solid #F1F5F9;
      color: #1E293B;
    }
    .item-name {
      font-weight: 700;
      color: #0F172A;
    }
    .summary-box {
      background-color: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 14px;
      padding: 16px 20px;
      margin-bottom: 24px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      padding: 6px 0;
      color: #475569;
    }
    .summary-total {
      display: flex;
      justify-content: space-between;
      font-size: 17px;
      font-weight: 900;
      padding-top: 12px;
      margin-top: 6px;
      border-top: 2px solid #CBD5E1;
      color: #0F172A;
    }
    .total-amount {
      color: #10B981;
      font-weight: 900;
    }
    .cta-btn {
      display: block;
      width: 100%;
      box-sizing: border-box;
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: #ffffff !important;
      text-decoration: none;
      text-align: center;
      font-weight: 800;
      font-size: 15px;
      padding: 14px 24px;
      border-radius: 12px;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
    }
    .footer {
      background-color: #F8FAFC;
      padding: 24px 32px;
      border-top: 1px solid #E2E8F0;
      text-align: center;
      font-size: 12px;
      color: #64748B;
    }
    .footer p {
      margin: 4px 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="main-card">
      <!-- Header -->
      <div class="header">
        <div class="logo-container">
          <span class="logo-badge">P</span>
          <span class="logo-text">DemoPick <span class="logo-highlight">Club</span></span>
        </div>
      </div>

      <!-- Banner -->
      <div class="banner">
        <h2 class="banner-title">✓ ĐẶT HÀNG THÀNH CÔNG</h2>
        <p class="banner-sub">Hệ thống đã tiếp nhận đơn hàng của quý khách và đang chuẩn bị kiện hàng.</p>
      </div>

      <!-- Main Body Content -->
      <div class="content">
        <p class="greeting">
          Kính chào <strong>{{ $order['customer_name'] ?? 'Quý khách hàng' }}</strong>,<br>
          Cảm ơn bạn đã tin tưởng và đồng hành cùng DemoPick Club. Dưới đây là thông tin chi tiết hóa đơn điện tử cho đơn hàng của bạn:
        </p>

        <!-- Order Info Card -->
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">Mã đơn hàng:</span>
            <span class="info-val" style="color: #10B981; font-family: monospace; font-size: 15px;">#{{ $order['order_code'] ?? 'MỚI' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Thời gian tạo:</span>
            <span class="info-val">{{ isset($order['created_at']) ? date('H:i - d/m/Y', strtotime($order['created_at'])) : date('H:i - d/m/Y') }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Phương thức thanh toán:</span>
            <span class="info-val">
              @if(in_array(strtolower($order['payment_method'] ?? ''), ['momo', 'bank_transfer', 'vietqr']))
                Online ({{ strtoupper($order['payment_method']) }})
              @else
                Thanh toán khi nhận hàng (COD)
              @endif
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">Trạng thái thanh toán:</span>
            <span class="info-val">
              @if(($order['payment_status'] ?? '') === 'paid')
                <span class="status-badge status-paid">✓ ĐÃ THANH TOÁN</span>
              @else
                <span class="status-badge status-cod">⏳ THU HỘ KHI NHẬN HÀNG</span>
              @endif
            </span>
          </div>
        </div>

        <!-- Shipping Info Card -->
        <div class="section-title">Địa Chỉ & Đơn Vị Giao Hàng</div>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">Người nhận:</span>
            <span class="info-val">{{ $order['customer_name'] ?? 'Khách hàng' }} - {{ $order['customer_phone'] ?? '' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Địa chỉ giao hàng:</span>
            <span class="info-val">{{ $order['shipping_address'] ?? 'Tại cửa hàng' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Đơn vị vận chuyển:</span>
            <span class="info-val" style="color: #D97706; font-weight: 800;">GHN Express (Giao Hàng Nhanh 3PL)</span>
          </div>
        </div>

        <!-- Product Table -->
        <div class="section-title">Chi Tiết Sản Phẩm</div>
        <table class="item-table">
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th style="text-align: center; width: 50px;">SL</th>
              <th style="text-align: right; width: 110px;">Đơn giá</th>
              <th style="text-align: right; width: 120px;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            @foreach(($order['items'] ?? []) as $item)
            @php
              $qty = $item['quantity'] ?? $item['qty'] ?? 1;
              $price = $item['price'] ?? 0;
              $sub = $item['subtotal'] ?? ($price * $qty);
              $itemName = $item['item_name'] ?? $item['name'] ?? 'Sản phẩm Pickleball';
            @endphp
            <tr>
              <td><span class="item-name">{{ $itemName }}</span></td>
              <td style="text-align: center;">{{ $qty }}</td>
              <td style="text-align: right;">{{ number_format($price) }}đ</td>
              <td style="text-align: right; font-weight: 700;">{{ number_format($sub) }}đ</td>
            </tr>
            @endforeach
          </tbody>
        </table>

        <!-- Financial Summary -->
        <div class="summary-box">
          <div class="summary-row">
            <span>Tạm tính tiền hàng:</span>
            <span>{{ number_format($order['subtotal'] ?? 0) }}đ</span>
          </div>
          @if(!empty($order['discount']) && $order['discount'] > 0)
          <div class="summary-row" style="color: #DC2626;">
            <span>Voucher giảm giá ({{ $order['voucher_code'] ?? 'DEMOPICK' }}):</span>
            <span>-{{ number_format($order['discount']) }}đ</span>
          </div>
          @endif
          <div class="summary-row">
            <span>Phí vận chuyển GHN Express:</span>
            <span>+{{ number_format($order['shipping_fee'] ?? 0) }}đ</span>
          </div>
          <div class="summary-total">
            <span>Tổng thanh toán:</span>
            <span class="total-amount">{{ number_format($order['total_amount'] ?? 0) }}đ</span>
          </div>
        </div>

        <a href="http://localhost:5173/orders" class="cta-btn">
          Xem & Quản Lý Đơn Hàng Tại Web →
        </a>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p><strong>CỤM LIÊN HỢP DEMOPICK CLUB & THI ĐẤU QUỐC TẾ</strong></p>
        <p>Địa chỉ: Số 10 Phố Pickleball, Q. Cầu Giấy, Hà Nội • Hotline 24/7: 1900 8899</p>
        <p style="color: #94A3B8; font-size: 11px; margin-top: 10px;">
          Email này được gửi tự động xác nhận giao dịch. Nếu quý khách có bất kỳ thắc mắc nào, vui lòng liên hệ hotline hoặc chat trực tiếp trên website.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
