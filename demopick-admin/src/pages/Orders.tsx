import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { Search, RefreshCw, Calendar } from "lucide-react";
import { toast } from "sonner";

import {
  Order,
  OrderStatus,
  PosCategory,
  BackendOrder,
  BackendOrderItem,
} from "@/types/order.types";
import { mockOrders, masterCatalog, ONLINE_STATUS_TABS, POS_SUB_TABS } from "@/data/ordersData";
import { shippingService, ShippingCarrier, ShippingOrderInfo } from "@/services/shipping.service";
import { notificationService } from "@/services/notification.service";

import { OnlineOrdersTable } from "@/components/orders/OnlineOrdersTable";
import { PosOrdersTable } from "@/components/orders/PosOrdersTable";
import { OrderShippingDialog } from "@/components/orders/OrderShippingDialog";
import { OrderShippingLabelDialog } from "@/components/orders/OrderShippingLabelDialog";
import { OrderTrackingDialog } from "@/components/orders/OrderTrackingDialog";
import { OrderDetailDialog } from "@/components/orders/OrderDetailDialog";
import { OrderEditPosDialog } from "@/components/orders/OrderEditPosDialog";
import { OrderReceiptDialog } from "@/components/orders/OrderReceiptDialog";

export default function Orders() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const userRoles = user?.roles || [];
  const isStaffOnly =
    userRoles.includes("staff") &&
    !userRoles.includes("super_admin") &&
    !userRoles.includes("admin");

  const [viewMode, setViewMode] = useState<"online" | "pos">(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (tab === "pos") return "pos";
    return "online";
  });
  const [posSubFilter, setPosSubFilter] = useState<PosCategory>("court_service");
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const [onlineStatusFilter, setOnlineStatusFilter] = useState<string>("ALL");
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "pos") {
      setViewMode("pos");
      setStatusFilter("PAID");
    } else if (tab === "online") {
      if (isStaffOnly) {
        setViewMode("pos");
        setStatusFilter("PAID");
      } else {
        setViewMode("online");
        setStatusFilter("PENDING");
      }
    }
  }, [searchParams, isStaffOnly]);

  // Enforce staff restrictions
  useEffect(() => {
    if (isStaffOnly && viewMode === "online") {
      setViewMode("pos");
      setStatusFilter("PAID");
    }
  }, [isStaffOnly, viewMode]);

  const [search, setSearch] = useState("");
  const [datePeriod, setDatePeriod] = useState("today");
  const [customDate, setCustomDate] = useState("2026-08-09");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const [ordersList, setOrdersList] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem("demopick_orders_admin");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasCam = parsed.some((o: Order) => o.code.startsWith("CAM-"));
          if (!hasCam) {
            return [...mockOrders.filter((m) => m.code.startsWith("CAM-")), ...parsed];
          }
          return parsed;
        }
      }
      return mockOrders;
    } catch (err) {
      console.warn("Failed to load saved admin orders from localStorage:", err);
      return mockOrders;
    }
  });

  useEffect(() => {
    localStorage.setItem("demopick_orders_admin", JSON.stringify(ordersList));
  }, [ordersList]);

  // Sync orders in realtime when updated via localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "demopick_orders_admin" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setOrdersList(parsed);
          }
        } catch (err) {
          console.warn("Realtime storage sync failed:", err);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch and merge backend orders
  const fetchBackendOrders = async (showToast = false) => {
    setIsRefreshing(true);
    try {
      const res = await api.get<{ success: boolean; data: BackendOrder[] }>("/orders");
      const backendOrders = res.data?.data;
      if (Array.isArray(backendOrders) && backendOrders.length > 0) {
        setOrdersList((prevList) => {
          const map = new Map<string, Order>();
          prevList.forEach((o) => map.set(o.code, o));

          backendOrders.forEach((bOrder) => {
            const code = bOrder.order_code || bOrder.code;
            if (!code) return;

            const isPaid = bOrder.payment_status === "paid" || bOrder.status === "confirmed";
            const mappedStatus: OrderStatus = isPaid ? "PAID" : "PENDING";
            const mappedMethod =
              bOrder.payment_method === "momo"
                ? "MoMo"
                : bOrder.payment_method === "cod"
                ? "COD"
                : "VietQR";

            const existing = map.get(code);
            if (existing) {
              map.set(code, {
                ...existing,
                status: isPaid ? "PAID" : existing.status,
                paymentMethod: mappedMethod,
                totalAmount: bOrder.total_amount || existing.totalAmount,
                customerPhone: bOrder.customer_phone || existing.customerPhone,
                shippingAddress: bOrder.shipping_address || existing.shippingAddress,
              });
            } else {
              const dateObj = bOrder.created_at ? new Date(bOrder.created_at) : new Date();
              const dateStr = dateObj.toISOString().split("T")[0];
              const timeStr = dateObj.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

              map.set(code, {
                code,
                customerName: bOrder.customer_name || "Khách hàng Online",
                customerPhone: bOrder.customer_phone || "",
                staffName: "Hệ thống Tự Động Online",
                type: "Đặt Sân Online",
                totalAmount: bOrder.total_amount || 0,
                paymentMethod: mappedMethod,
                status: mappedStatus,
                createdAt: `${dateStr} ${timeStr}`,
                dateStr,
                shippingAddress: bOrder.shipping_address || "",
                shippingCarrier: "GHN",
                shippingFee: bOrder.shipping_fee || 0,
                items: Array.isArray(bOrder.items)
                  ? bOrder.items.map((it: BackendOrderItem, idx: number) => ({
                      id: it.id || idx + 1,
                      name: it.item_name || it.name || "Sản phẩm",
                      qty: it.quantity || it.qty || 1,
                      price: it.price || 0,
                    }))
                  : [],
              });
            }
          });

          return Array.from(map.values());
        });

        if (showToast) {
          toast.success("Đã đồng bộ đơn hàng từ máy chủ thành công!");
        }
      } else if (showToast) {
        toast.info("Dữ liệu đơn hàng đã ở trạng thái mới nhất.");
      }
    } catch (err) {
      console.warn("Backend orders sync error:", err);
      if (showToast) {
        toast.error("Không thể kết nối máy chủ để đồng bộ.");
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBackendOrders();
  }, []);

  const handleManualRefresh = () => {
    fetchBackendOrders(true);
  };

  const handleAdminCancelOrder = async (orderCode: string) => {
    const reason = window.prompt("Nhập lý do hủy đơn hàng (Admin):", "Khách hàng yêu cầu hủy / Hết hàng");
    if (reason === null) return;

    try {
      toast.info(`Đang xử lý hủy đơn hàng #${orderCode}...`);
      await api.post(`/admin/orders/${orderCode}/cancel`, { reason });
      toast.success(`Đã hủy thành công đơn hàng #${orderCode}!`);
      setOrdersList((prev) =>
        prev.map((o) => (o.code === orderCode ? { ...o, status: "REFUNDED" } : o))
      );
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Không thể hủy đơn hàng.");
      } else {
        toast.error("Không thể hủy đơn hàng.");
      }
    }
  };

  // MODAL STATES
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [printReceiptOrder, setPrintReceiptOrder] = useState<Order | null>(null);

  // LOGISTICS MODAL STATES
  const [createShippingModalOrder, setCreateShippingModalOrder] = useState<Order | null>(null);
  const [selectedCarrier, setSelectedCarrier] = useState<ShippingCarrier>("GHN");
  const [shippingWeightGram, setShippingWeightGram] = useState(650);
  const [customDeliveryNote, setCustomDeliveryNote] = useState(
    "Cho xem hàng, không thử / Hàng thể thao cao cấp"
  );

  const [printShippingLabelInfo, setPrintShippingLabelInfo] = useState<ShippingOrderInfo | null>(null);
  const [trackingModalInfo, setTrackingModalInfo] = useState<ShippingOrderInfo | null>(null);

  // EXECUTE CREATE MOCK SHIPPING ORDER
  const handleCreateShippingSubmit = () => {
    if (!createShippingModalOrder) return;

    const itemsText = createShippingModalOrder.items.map((i) => `${i.qty}x ${i.name}`).join(", ");
    const { fee } = shippingService.calculateShippingFee(
      createShippingModalOrder.shippingAddress || "Hà Nội",
      shippingWeightGram,
      selectedCarrier,
      createShippingModalOrder.totalAmount
    );

    const shippingInfo = shippingService.createShippingOrder({
      orderCode: createShippingModalOrder.code,
      carrier: selectedCarrier,
      receiverName: createShippingModalOrder.customerName,
      receiverAddress: createShippingModalOrder.shippingAddress || "Việt Nam",
      receiverPhone: createShippingModalOrder.customerPhone || "",
      itemsSummary: itemsText,
      weightGram: shippingWeightGram,
      shippingFee: fee,
      codAmount: createShippingModalOrder.paymentMethod === "COD" ? createShippingModalOrder.totalAmount : 0,
      paymentMethod: createShippingModalOrder.paymentMethod,
      deliveryNote: customDeliveryNote,
    });

    const updatedOrders = ordersList.map((o) =>
      o.code === createShippingModalOrder.code
        ? {
            ...o,
            status: "SHIPPED" as const,
            shippingCarrier: selectedCarrier,
            trackingNumber: shippingInfo.trackingNumber,
            shippingFee: fee,
          }
        : o
    );
    setOrdersList(updatedOrders);

    notificationService.sendOrderShippedNotice({
      orderCode: createShippingModalOrder.code,
      customerName: createShippingModalOrder.customerName,
      shippingAddress: createShippingModalOrder.shippingAddress || "Việt Nam",
      totalAmount: createShippingModalOrder.totalAmount,
    });

    toast.success(`Đã tạo vận đơn ${selectedCarrier} thành công! Mã: ${shippingInfo.trackingNumber}`);
    setCreateShippingModalOrder(null);
    setPrintShippingLabelInfo(shippingInfo);
  };

  // 1-CLICK DISPATCH: GHN EXPRESS
  const handleOneClickGHNDispatch = (order: Order) => {
    try {
      toast.info(`Đang kích hoạt 1-Click GHN Express cho đơn #${order.code}...`);
      const itemsText = order.items.map((i) => `${i.qty}x ${i.name}`).join(", ");
      const { fee } = shippingService.calculateShippingFee(
        order.shippingAddress || "Hà Nội",
        650,
        "GHN",
        order.totalAmount
      );

      const shippingInfo = shippingService.createShippingOrder({
        orderCode: order.code,
        carrier: "GHN",
        receiverName: order.customerName,
        receiverAddress: order.shippingAddress || "Việt Nam",
        receiverPhone: order.customerPhone || "",
        itemsSummary: itemsText,
        weightGram: 650,
        shippingFee: fee,
        codAmount: order.paymentMethod === "COD" ? order.totalAmount : 0,
        paymentMethod: order.paymentMethod,
        deliveryNote: "Đơn hàng Pickleball 1-Click GHN Express / Cho kiểm tra hàng",
      });

      const updatedOrders = ordersList.map((o) =>
        o.code === order.code
          ? {
              ...o,
              status: "SHIPPED" as const,
              shippingCarrier: "GHN" as const,
              trackingNumber: shippingInfo.trackingNumber,
              shippingFee: fee,
            }
          : o
      );
      setOrdersList(updatedOrders);

      notificationService.sendOrderShippedNotice({
        orderCode: order.code,
        customerName: order.customerName,
        shippingAddress: order.shippingAddress || "Việt Nam",
        totalAmount: order.totalAmount,
      });

      toast.success(`Đã bàn giao đơn #${order.code} cho GHN Express! Mã: ${shippingInfo.trackingNumber}`);
      setPrintShippingLabelInfo(shippingInfo);
    } catch {
      toast.error("Không thể tạo vận đơn GHN Express. Vui lòng thử lại!");
    }
  };

  // ADVANCE TRACKING STAGE SIMULATION
  const handleAdvanceTracking = (trackingNumber: string) => {
    const updated = shippingService.advanceTrackingStage(trackingNumber);
    if (updated) {
      setTrackingModalInfo({ ...updated });
      if (updated.isCompleted) {
        setOrdersList((prev) =>
          prev.map((o) =>
            o.trackingNumber === trackingNumber || o.code === updated.orderCode
              ? { ...o, status: "COMPLETED" }
              : o
          )
        );
        toast.success(`Đơn hàng #${updated.orderCode} đã được giao thành công!`);
      } else {
        toast.info(`Đã chuyển bước: ${updated.timeline[0]?.title}`);
      }
    }
  };

  const handleCompleteTracking = (trackingNumber: string) => {
    const res = shippingService.setTrackingStage(trackingNumber, 5);
    if (res) {
      setTrackingModalInfo({ ...res });
      setOrdersList((prev) =>
        prev.map((o) =>
          o.trackingNumber === trackingNumber || o.code === res.orderCode
            ? { ...o, status: "COMPLETED" }
            : o
        )
      );
      toast.success("Đã hoàn tất toàn bộ hành trình giao hàng!");
    }
  };

  const handleOpenTrackingModal = (order: Order) => {
    const key = order.trackingNumber || order.code;
    let info = shippingService.getShippingInfo(key);
    if (!info) {
      const itemsText = order.items.map((i) => `${i.qty}x ${i.name}`).join(", ");
      info = shippingService.createShippingOrder({
        orderCode: order.code,
        carrier: order.shippingCarrier || "GHN",
        receiverName: order.customerName,
        receiverAddress: order.shippingAddress || "Việt Nam",
        receiverPhone: order.customerPhone || "",
        itemsSummary: itemsText,
        weightGram: 650,
        codAmount: order.paymentMethod === "COD" ? order.totalAmount : 0,
        paymentMethod: order.paymentMethod,
      });
      if (order.status === "COMPLETED") {
        info = shippingService.setTrackingStage(info.trackingNumber, 5);
      } else if (order.status === "SHIPPED") {
        info = shippingService.setTrackingStage(info.trackingNumber, 3);
      }
    }
    setTrackingModalInfo(info);
  };

  const handleOpenPrintShippingLabel = (order: Order) => {
    const key = order.trackingNumber || order.code;
    let info = shippingService.getShippingInfo(key);
    if (!info) {
      const itemsText = order.items.map((i) => `${i.qty}x ${i.name}`).join(", ");
      info = shippingService.createShippingOrder({
        orderCode: order.code,
        carrier: order.shippingCarrier || "GHN",
        receiverName: order.customerName,
        receiverAddress: order.shippingAddress || "Việt Nam",
        receiverPhone: order.customerPhone || "",
        itemsSummary: itemsText,
      });
    }
    setPrintShippingLabelInfo(info);
  };

  const handleOpenEdit = (order: Order) => {
    setEditingOrder({ ...order, items: [...order.items] });
  };

  const handlePrint = (order: Order) => {
    setPrintReceiptOrder(order);
  };

  const onlineOrders = useMemo(() => {
    return ordersList.filter(
      (o) =>
        o.type === "Đặt Sân Online" ||
        o.type === "Đặt Sân & Thiết Bị" ||
        o.type === "Online" ||
        o.type === "online"
    );
  }, [ordersList]);

  const onlineCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: 0,
      PENDING: 0,
      READY_TO_PICK: 0,
      PICKING: 0,
      SHIPPING: 0,
      COMPLETED: 0,
      RETURNED: 0,
      CANCELLED: 0,
    };

    onlineOrders.forEach((o) => {
      counts.ALL++;
      const st = o.status;
      if (st === "PENDING" || st === "CHỜ_THANH_TOÁN" || st === "PAID" || st === "CONFIRMED") counts.PENDING++;
      else if (st === "READY_TO_PICK") counts.READY_TO_PICK++;
      else if (st === "PICKING") counts.PICKING++;
      else if (st === "SHIPPED" || st === "SHIPPING") counts.SHIPPING++;
      else if (st === "COMPLETED") counts.COMPLETED++;
      else if (st === "RETURNED") counts.RETURNED++;
      else if (st === "CANCELLED" || st === "REFUNDED") counts.CANCELLED++;
    });

    return counts;
  }, [onlineOrders]);

  const isOrderPaid = (order: Order) => {
    if (order.paymentStatus === "PAID") return true;
    if (order.paymentStatus === "PENDING") return false;
    if (order.paymentStatus === "REFUNDED") return false;
    if (order.status === "PAID" || order.status === "COMPLETED") return true;
    if (order.paymentMethod === "VietQR" && order.status !== "REFUNDED" && order.status !== "CANCELLED") return true;
    if (
      order.paymentMethod === "MoMo" &&
      (order.status === "SHIPPED" || order.status === "SHIPPING" || order.status === "COMPLETED")
    )
      return true;
    return false;
  };

  const getStatusLabel = (st: string) => {
    switch (st) {
      case "PENDING":
        return "Chờ xử lý";
      case "READY_TO_PICK":
        return "Chờ lấy hàng";
      case "PICKING":
        return "Đang lấy hàng";
      case "SHIPPED":
      case "SHIPPING":
        return "Đang giao";
      case "COMPLETED":
        return "Thành công";
      case "RETURNED":
        return "Hoàn hàng";
      case "CANCELLED":
      case "REFUNDED":
        return "Đã hủy";
      default:
        return st;
    }
  };

  const handleUpdateOrderStatus = (orderCode: string, newStatus: OrderStatus) => {
    const target = ordersList.find((o) => o.code === orderCode);
    if (!target) return;

    if (newStatus === "CANCELLED" || newStatus === "REFUNDED") {
      if (target.status === "SHIPPED" || target.status === "SHIPPING" || target.status === "COMPLETED") {
        toast.error("🔒 Đơn hàng đang giao hoặc đã hoàn thành, hệ thống khóa hủy đơn!");
        return;
      }
      handleAdminCancelOrder(orderCode);
      return;
    }

    setOrdersList((prev) =>
      prev.map((o) => {
        if (o.code === orderCode) {
          return {
            ...o,
            status: newStatus,
            paymentStatus: newStatus === "COMPLETED" && o.paymentMethod === "COD" ? "PAID" : o.paymentStatus,
          };
        }
        return o;
      })
    );
    toast.success(`Đã cập nhật trạng thái đơn #${orderCode} sang "${getStatusLabel(newStatus)}"!`);
  };

  const filteredOrders = useMemo(() => {
    return ordersList.filter((order) => {
      const isOnlineType =
        order.type === "Đặt Sân Online" ||
        order.type === "Đặt Sân & Thiết Bị" ||
        order.type === "Online" ||
        order.type === "online";
      const isModeMatch = viewMode === "online" ? isOnlineType : order.type === "POS Quầy";
      if (!isModeMatch) return false;

      if (viewMode === "pos") {
        const matchesPosSub = order.posCategory === posSubFilter;
        const matchesStatus = order.status === statusFilter;
        const matchesSearch =
          order.code.toLowerCase().includes(search.toLowerCase()) ||
          order.customerName.toLowerCase().includes(search.toLowerCase()) ||
          order.staffName.toLowerCase().includes(search.toLowerCase()) ||
          (order.courtInfo?.courtName && order.courtInfo.courtName.toLowerCase().includes(search.toLowerCase()));

        let matchesDate = true;
        if (datePeriod === "today") matchesDate = order.dateStr === "2026-08-09";
        else if (datePeriod === "yesterday") matchesDate = order.dateStr === "2026-08-08";
        else if (datePeriod === "custom") matchesDate = order.dateStr === customDate;

        return matchesPosSub && matchesStatus && matchesSearch && matchesDate;
      }

      // viewMode === "online"
      let matchesStatus = true;
      if (onlineStatusFilter === "ALL") {
        matchesStatus = true;
      } else if (onlineStatusFilter === "PENDING") {
        matchesStatus =
          order.status === "PENDING" ||
          order.status === "CHỜ_THANH_TOÁN" ||
          order.status === "PAID" ||
          order.status === "CONFIRMED";
      } else if (onlineStatusFilter === "READY_TO_PICK") {
        matchesStatus = order.status === "READY_TO_PICK";
      } else if (onlineStatusFilter === "PICKING") {
        matchesStatus = order.status === "PICKING";
      } else if (onlineStatusFilter === "SHIPPING") {
        matchesStatus = order.status === "SHIPPED" || order.status === "SHIPPING";
      } else if (onlineStatusFilter === "COMPLETED") {
        matchesStatus = order.status === "COMPLETED";
      } else if (onlineStatusFilter === "RETURNED") {
        matchesStatus = order.status === "RETURNED";
      } else if (onlineStatusFilter === "CANCELLED") {
        matchesStatus = order.status === "CANCELLED" || order.status === "REFUNDED";
      }

      const matchesPayment = paymentFilter === "ALL" || order.paymentMethod === paymentFilter;

      const matchesSearch =
        order.code.toLowerCase().includes(search.toLowerCase()) ||
        order.customerName.toLowerCase().includes(search.toLowerCase()) ||
        (order.customerPhone && order.customerPhone.includes(search)) ||
        (order.trackingNumber && order.trackingNumber.toLowerCase().includes(search.toLowerCase()));

      return matchesStatus && matchesPayment && matchesSearch;
    });
  }, [
    ordersList,
    viewMode,
    posSubFilter,
    statusFilter,
    search,
    datePeriod,
    customDate,
    onlineStatusFilter,
    paymentFilter,
  ]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const handleSaveEditAndReprint = () => {
    if (!editingOrder) return;
    const updatedList = ordersList.map((o) => (o.code === editingOrder.code ? editingOrder : o));
    setOrdersList(updatedList);
    toast.success(`Đã cập nhật chỉnh sửa đơn hàng #${editingOrder.code}!`);
    setPrintReceiptOrder(editingOrder);
    setEditingOrder(null);
  };

  return (
    <AppLayout
      title={viewMode === "online" ? "Quản Lý Đơn Hàng Online & Vận Chuyển 3PL" : "Quản Lý Hóa Đơn Bán Hàng POS Quầy"}
    >
      <div className="space-y-6 font-sans">
        {/* ONLINE ORDERS VIEW */}
        {viewMode === "online" && (
          <div className="space-y-4">
            {/* Top Header & Refresh */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý Đơn hàng & Vận chuyển</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Xử lý vòng đời đơn hàng, đồng bộ vận chuyển GHN Express và đối soát thanh toán ({onlineOrders.length} đơn).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="h-10 px-4 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold text-xs gap-2 shadow-sm cursor-pointer"
                  title="Làm mới danh sách từ máy chủ"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-600" : "text-slate-600"}`} />
                  <span>Làm mới danh sách</span>
                </Button>
              </div>
            </div>

            {/* 8 Capsule Filter Tabs */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
              {ONLINE_STATUS_TABS.map((tab) => {
                const isActive = onlineStatusFilter === tab.id;
                const count = onlineCounts[tab.id] || 0;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setOnlineStatusFilter(tab.id);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-2 cursor-pointer ${
                      isActive
                        ? "bg-slate-900 text-white shadow-sm border border-slate-900"
                        : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90 shadow-sm"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        isActive ? "bg-slate-700 text-slate-100" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Bar & Payment Filter */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-sm">
              <div className="relative w-full sm:flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Tìm theo mã đơn, tên khách, số điện thoại, mã GHN..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 text-xs h-10 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-colors"
                />
              </div>

              <div className="relative w-full sm:w-52 shrink-0">
                <select
                  value={paymentFilter}
                  onChange={(e) => {
                    setPaymentFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-10 px-3 pr-8 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                >
                  <option value="ALL">Tất cả thanh toán</option>
                  <option value="MoMo">Ví MoMo</option>
                  <option value="VietQR">VietQR</option>
                  <option value="COD">Tiền mặt (COD)</option>
                  <option value="Cổng Online">Cổng Online</option>
                </select>
              </div>
            </div>

            {/* ONLINE ORDERS TABLE */}
            <OnlineOrdersTable
              orders={paginatedOrders}
              onUpdateStatus={handleUpdateOrderStatus}
              onDispatchGHN={handleOneClickGHNDispatch}
              onOpenTrackingModal={handleOpenTrackingModal}
              onOpenPrintShippingLabel={handleOpenPrintShippingLabel}
              onSelectOrder={setSelectedOrder}
              isOrderPaid={isOrderPaid}
            />
          </div>
        )}

        {/* POS QUẦY VIEW */}
        {viewMode === "pos" && (
          <div className="space-y-4">
            {/* Header & Date Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-500 mr-1">Thời gian:</span>
                {[
                  { id: "today", label: "Hôm nay" },
                  { id: "yesterday", label: "Hôm qua" },
                  { id: "custom", label: "Tùy chọn ngày" },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setDatePeriod(p.id);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-150 border ${
                      datePeriod === p.id
                        ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
                {datePeriod === "custom" && (
                  <div className="flex items-center gap-1.5 ml-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <Input
                      type="date"
                      value={customDate}
                      onChange={(e) => {
                        setCustomDate(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="h-8 text-xs font-bold w-36 rounded-lg border-slate-200"
                    />
                  </div>
                )}
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Tìm mã HĐ, tên khách, nhân viên, tên sân..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 text-xs h-9 rounded-xl border-slate-200"
                />
              </div>
            </div>

            {/* POS SUB TABS */}
            <div className="flex items-center gap-2 border-t pt-3 flex-wrap">
              <span className="text-xs font-bold text-slate-500 mr-1">Phân loại hóa đơn:</span>
              {POS_SUB_TABS.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => {
                    setPosSubFilter(sub.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-150 border ${
                    posSubFilter === sub.id
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 border-transparent"
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* STATUS TABS */}
            <div className="flex items-center gap-2 border-t pt-3 flex-wrap">
              <span className="text-xs font-bold text-slate-500 mr-1">Trạng thái:</span>
              {[
                { id: "PAID", label: "Đã thanh toán" },
                { id: "REFUNDED", label: "Đã hoàn tiền" },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => {
                    setStatusFilter(st.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-150 border ${
                    statusFilter === st.id
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* POS ORDERS TABLE */}
            <PosOrdersTable
              orders={paginatedOrders}
              totalCount={filteredOrders.length}
              onViewOrder={setSelectedOrder}
              onEditOrder={handleOpenEdit}
              onPrintReceipt={handlePrint}
            />
          </div>
        )}

        {/* PAGINATION */}
        <div className="flex items-center justify-between pt-2 text-xs">
          <span className="text-slate-500 font-medium">
            Hiển thị {paginatedOrders.length} / {filteredOrders.length} đơn
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8 rounded-xl font-bold"
            >
              Trang trước
            </Button>
            <span className="font-bold text-slate-900 px-2">
              {currentPage} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 rounded-xl font-bold"
            >
              Trang tiếp
            </Button>
          </div>
        </div>

        {/* 6 MODAL DIALOGS */}
        <OrderShippingDialog
          order={createShippingModalOrder}
          isOpen={!!createShippingModalOrder}
          onClose={() => setCreateShippingModalOrder(null)}
          selectedCarrier={selectedCarrier}
          setSelectedCarrier={setSelectedCarrier}
          shippingWeightGram={shippingWeightGram}
          setShippingWeightGram={setShippingWeightGram}
          customDeliveryNote={customDeliveryNote}
          setCustomDeliveryNote={setCustomDeliveryNote}
          onSubmit={handleCreateShippingSubmit}
        />

        <OrderShippingLabelDialog
          shippingLabelInfo={printShippingLabelInfo}
          isOpen={!!printShippingLabelInfo}
          onClose={() => setPrintShippingLabelInfo(null)}
        />

        <OrderTrackingDialog
          trackingInfo={trackingModalInfo}
          isOpen={!!trackingModalInfo}
          onClose={() => setTrackingModalInfo(null)}
          onAdvanceStage={handleAdvanceTracking}
          onCompleteStage={handleCompleteTracking}
        />

        <OrderDetailDialog
          order={selectedOrder}
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onDispatchGHN={handleOneClickGHNDispatch}
        />

        <OrderEditPosDialog
          editingOrder={editingOrder}
          isOpen={!!editingOrder}
          onClose={() => setEditingOrder(null)}
          onSave={handleSaveEditAndReprint}
          catalog={masterCatalog}
          setEditingOrder={setEditingOrder}
        />

        <OrderReceiptDialog
          receiptOrder={printReceiptOrder}
          isOpen={!!printReceiptOrder}
          onClose={() => setPrintReceiptOrder(null)}
        />
      </div>
    </AppLayout>
  );
}
