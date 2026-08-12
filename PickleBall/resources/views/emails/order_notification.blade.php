<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ $subject ?? 'Thông Báo Đơn Hàng Pick' }}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #FAF8F5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0F172A;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #FAF8F5;
      padding: 40px 0;
    }
    .main-card {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 24px;
      border: 1px solid #E2E8F0;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
      padding: 32px;
      text-align: center;
    }
    .logo-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .logo-circle {
      width: 36px;
      height: 36px;
      background-color: #27c372;
      border-radius: 50%;
      display: inline-block;
      line-height: 36px;
      color: #ffffff;
      font-weight: 900;
      font-size: 18px;
    }
    .logo-text {
      color: #ffffff;
      font-size: 28px;
      font-weight: 900;
      letter-spacing: 0.5px;
      margin: 0;
    }
    .logo-sub {
      background-color: rgba(39, 195, 114, 0.2);
      color: #27c372;
      border: 1px solid rgba(39, 195, 114, 0.4);
      font-size: 10px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 6px;
      margin-left: 6px;
      vertical-align: middle;
    }
    .banner {
      padding: 24px 32px;
      background-color: #F0FDF4;
      border-bottom: 1px solid #DCFCE7;
      text-align: center;
    }
    .banner-title {
      color: #15803D;
      font-size: 18px;
      font-weight: 800;
      margin: 0 0 6px 0;
    }
    .banner-sub {
      color: #166534;
      font-size: 13px;
      font-weight: 600;
      margin: 0;
    }
    .content {
      padding: 32px;
    }
    .info-box {
      background-color: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      padding: 6px 0;
      border-bottom: 1px border-dashed #E2E8F0;
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
    }
    .item-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 13px;
    }
    .item-table th {
      background-color: #F8FAFC;
      color: #475569;
      font-weight: 700;
      text-align: left;
      padding: 12px;
      border-bottom: 1px solid #E2E8F0;
    }
    .item-table td {
      padding: 12px;
      border-bottom: 1px solid #F1F5F9;
      color: #1E293B;
    }
    .item-name {
      font-weight: 700;
    }
    .total-row {
      font-size: 16px;
      font-weight: 900;
      color: #27c372;
    }
    .cta-btn {
      display: block;
      width: 100%;
      box-sizing: border-box;
      background-color: #27c372;
      color: #ffffff !important;
      text-decoration: none;
      text-align: center;
      font-weight: 800;
      font-size: 15px;
      padding: 14px 24px;
      border-radius: 14px;
      margin-top: 24px;
      box-shadow: 0 4px 12px rgba(39, 195, 114, 0.25);
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
        <h1 class="logo-text">Pickleball</h1>
      </div>

      <!-- Banner -->
      <div class="banner">
        <h2 class="banner-title">{{ $bannerTitle ?? '🛒 XÁC NHẬN ĐƠN HÀNG THÀNH CÔNG' }}</h2>
        <p class="banner-sub">{{ $bannerSub ?? 'Cảm ơn bạn đã mua sắm và đặt dịch vụ tại Pickleball Center!' }}</p>
      </div>

      <!-- Main Body Content -->
      <div class="content">
        <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-top: 0;">
          Xin chào <strong>{{ $customerName ?? 'Quý khách hàng' }}</strong>,
        </p>
        <p style="font-size: 13px; line-height: 1.6; color: #475569;">
          {{ $messageBody ?? 'Cảm ơn bạn đã lựa chọn Pickleball Center. Vui lòng kiểm tra lại thông tin người nhận & địa chỉ vận chuyển bên dưới trước khi đơn hàng được chấp nhận và giao cho đơn vị vận chuyển:' }}
        </p>

        <!-- Order / Notice Details Box -->
        <div class="info-box">
          <div class="info-row">
            <span class="info-label">Mã tham chiếu:</span>
            <span class="info-val">#{{ $orderCode ?? 'PICK-' . rand(10000, 99999) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Thời gian thực hiện:</span>
            <span class="info-val">{{ date('H:i - d/m/Y') }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Địa chỉ nhận tin:</span>
            <span class="info-val">{{ $customerEmail ?? 'nvmtein@gmail.com' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Trạng thái:</span>
            <span class="info-val" style="color: #16a34a;">✓ Hoàn tất thành công</span>
          </div>
        </div>

        @if(!empty($items))
        <!-- Item Breakdown Table -->
        <table class="item-table">
          <thead>
            <tr>
              <th>Sản phẩm / Dịch vụ</th>
              <th style="text-align: center;">SL</th>
              <th style="text-align: right;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            @foreach($items as $item)
            <tr>
              <td class="item-name">{{ $item['name'] }}</td>
              <td style="text-align: center;">{{ $item['qty'] }}</td>
              <td style="text-align: right; font-weight: 700;">{{ number_format($item['price'] * $item['qty']) }}đ</td>
            </tr>
            @endforeach
            <tr class="total-row">
              <td colspan="2" style="font-weight: 900; color: #0F172A;">Tổng thanh toán:</td>
              <td style="text-align: right; font-weight: 900; color: #27c372;">{{ number_format($totalAmount ?? 0) }}đ</td>
            </tr>
          </tbody>
        </table>
        @endif

        <a href="{{ $actionUrl ?? 'http://localhost:5173/orders' }}" class="cta-btn">
          {{ $actionText ?? 'Truy Cập Hệ Thống Pick Web' }} →
        </a>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p><strong>CỤM SÂN PICKLEBALL PICK CENTER</strong></p>
        <p>Số 10 Đường Pickleball, Q. Cầu Giấy, Hà Nội • Hotline: 1900 8899</p>
        <p style="color: #94A3B8; font-size: 11px; margin-top: 8px;">
          Email này được gửi tự động từ hệ thống Pick. Vui lòng không trả lời trực tiếp email này.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
