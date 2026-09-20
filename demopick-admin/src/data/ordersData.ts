import { Order, CatalogProduct, OnlineStatusTab, PosCategory } from "@/types/order.types";

export const mockOrders: Order[] = [];

export const masterCatalog: CatalogProduct[] = [
  { id: 201, name: "Vợt Pickleball JOOLA Perseus 3S 16mm Carbon", price: 5490000, category: "Vợt" },
  { id: 202, name: "Vợt Pickleball Franklin Carbon Pro 14mm", price: 2850000, category: "Vợt" },
  { id: 203, name: "Vợt Pickleball CRBN 1X Power Series 16mm", price: 5800000, category: "Vợt" },
  { id: 204, name: "Vợt Pickleball Selkirk Vanguard Power Air", price: 6200000, category: "Vợt" },
  { id: 205, name: "Bóng Pickleball Franklin X-40 (Hộp 4 quả)", price: 180000, category: "Bóng" },
  { id: 206, name: "Hộp 12 Bóng Franklin X-40 Outdoor", price: 420000, category: "Bóng" },
  { id: 207, name: "Quả bóng thi đấu Franklin X-40 Single", price: 45000, category: "Bóng" },
  { id: 208, name: "Băng Cán Vợt JOOLA Pro Grip Chống Trượt", price: 35000, category: "Phụ kiện" },
  { id: 209, name: "Bao vợt Pickleball cao cấp chống sốc", price: 250000, category: "Phụ kiện" },
  { id: 210, name: "Nước Suối Aquafina 500ml", price: 15000, category: "Đồ uống" },
  { id: 211, name: "Nước Điện Giải Pocari Sweat 500ml", price: 25000, category: "Đồ uống" },
  { id: 212, name: "Nước Tăng Lực Revive Chanh Muối 500ml", price: 20000, category: "Đồ uống" },
  { id: 213, name: "Nước Bò Húc Red Bull Thái", price: 25000, category: "Đồ uống" },
  { id: 214, name: "Xúc Xích Nướng CP Phô Mai", price: 20000, category: "Đồ ăn" },
  { id: 215, name: "Bánh Mì Nóng Giòn Pa-tê Trứng", price: 35000, category: "Đồ ăn" },
  { id: 216, name: "Dịch Vụ Thuê Vợt Thi Đấu (1 ca)", price: 50000, category: "Dịch vụ" },
  { id: 217, name: "Dịch Vụ Thuê Máy Bắn Bóng (1 giờ)", price: 120000, category: "Dịch vụ" },
  { id: 218, name: "Phí Thêm Giờ Chơi Sân (30 phút)", price: 90000, category: "Dịch vụ sân" },
];

export const ONLINE_STATUS_TABS: OnlineStatusTab[] = [
  { id: "ALL", label: "Tất cả đơn" },
  { id: "PENDING", label: "Chờ xử lý" },
  { id: "REFUND_PENDING", label: "Chờ hoàn tiền" },
  { id: "READY_TO_PICK", label: "Chờ lấy hàng" },
  { id: "PICKING", label: "Đang lấy hàng" },
  { id: "SHIPPING", label: "Đang giao" },
  { id: "COMPLETED", label: "Thành công" },
  { id: "REFUNDED", label: "Đã hoàn tiền" },
  { id: "RETURNED", label: "Hoàn hàng" },
  { id: "CANCELLED", label: "Đã hủy" },
];

export const POS_SUB_TABS: { id: PosCategory; label: string }[] = [
  { id: "court_service", label: "Tiền sân & Dịch vụ" },
  { id: "retail", label: "Bán lẻ sản phẩm" },
];
