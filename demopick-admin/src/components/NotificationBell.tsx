import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Package,
  Truck,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export interface AdminNotification {
  id: string;
  orderCode: string;
  title: string;
  message: string;
  status: string;
  type: 'pending' | 'shipping' | 'completed' | 'return' | 'refund' | 'cancelled' | 'booking';
  createdAt: string;
  isRead: boolean;
  linkUrl: string;
}

const STORAGE_KEY = 'demopick_admin_notifications';
const READ_KEY = 'demopick_admin_read_notifs';

export const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  // Initialize or load notifications from storage
  const loadNotifications = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const readIds = new Set<string>(JSON.parse(localStorage.getItem(READ_KEY) || '[]'));

      if (saved) {
        const parsed: AdminNotification[] = JSON.parse(saved);
        setNotifications(
          parsed.map((n) => ({
            ...n,
            isRead: readIds.has(n.id) ? true : n.isRead,
          }))
        );
        return;
      }

      // Default mock notifications showcasing order status transitions
      const initialNotifs: AdminNotification[] = [
        {
          id: 'notif-1',
          orderCode: 'HD-82918',
          title: 'Đơn hàng mới chờ xử lý',
          message: 'Khách hàng Nguyễn Văn Đức đã đặt đơn hàng mới trị giá 650.000đ.',
          status: 'PENDING',
          type: 'pending',
          createdAt: '5 phút trước',
          isRead: false,
          linkUrl: '/orders?tab=online',
        },
        {
          id: 'notif-2',
          orderCode: 'HD-82914',
          title: 'Đơn hàng chuyển sang Đang giao',
          message: 'Đơn hàng #HD-82914 đã bàn giao cho GHN Express (Mã vận đơn GHN928103).',
          status: 'SHIPPED',
          type: 'shipping',
          createdAt: '15 phút trước',
          isRead: false,
          linkUrl: '/orders?tab=online',
        },
        {
          id: 'notif-3',
          orderCode: 'HD-82910',
          title: 'Yêu cầu Hoàn hàng / Trả hàng',
          message: 'Khách hàng yêu cầu hoàn hàng đơn #HD-82910. Lý do: Đổi kích thước vợt.',
          status: 'RETURN_PENDING',
          type: 'return',
          createdAt: '1 giờ trước',
          isRead: false,
          linkUrl: '/orders?tab=online',
        },
        {
          id: 'notif-4',
          orderCode: 'PK-90218-VIP',
          title: 'Vé đặt sân đã thanh toán',
          message: 'Khách đặt Sân A1 ca 09:30 - 10:30 đã thanh toán MoMo thành công.',
          status: 'PAID',
          type: 'booking',
          createdAt: '2 giờ trước',
          isRead: true,
          linkUrl: '/court-map',
        },
        {
          id: 'notif-5',
          orderCode: 'HD-82912',
          title: 'Giao hàng thành công',
          message: 'Đơn hàng #HD-82912 đã được khách hàng nhận thành công và đối soát.',
          status: 'COMPLETED',
          type: 'completed',
          createdAt: 'Hôm nay 08:30',
          isRead: true,
          linkUrl: '/orders?tab=online',
        },
      ];

      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialNotifs));
      setNotifications(initialNotifs);
    } catch (e) {
      console.warn('Error loading admin notifications', e);
    }
  };

  useEffect(() => {
    loadNotifications();

    // Listen for cross-tab or status updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === 'demopick_orders_admin') {
        loadNotifications();
      }
    };

    const handleCustomStatusChange = () => {
      loadNotifications();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('demopick_order_status_changed', handleCustomStatusChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('demopick_order_status_changed', handleCustomStatusChange);
    };
  }, []);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((n) => !n.isRead);
    }
    return notifications;
  }, [notifications, filter]);

  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    const readIds = updated.map((n) => n.id);
    localStorage.setItem(READ_KEY, JSON.stringify(readIds));

    toast.success('Đã đánh dấu tất cả thông báo là đã đọc');
  };

  const handleItemClick = (notif: AdminNotification) => {
    if (!notif.isRead) {
      const updated = notifications.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n));
      setNotifications(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      const readIds = JSON.parse(localStorage.getItem(READ_KEY) || '[]');
      if (!readIds.includes(notif.id)) {
        readIds.push(notif.id);
        localStorage.setItem(READ_KEY, JSON.stringify(readIds));
      }
    }

    setIsOpen(false);
    if (notif.linkUrl) {
      navigate(notif.linkUrl);
    }
  };

  const handleClearAll = () => {
    setNotifications([]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    localStorage.setItem(READ_KEY, JSON.stringify([]));
    toast.info('Đã xóa tất cả thông báo');
  };

  const getStatusIcon = (type: AdminNotification['type']) => {
    switch (type) {
      case 'return':
        return <RotateCcw className="w-4 h-4 text-purple-600" />;
      case 'refund':
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      case 'shipping':
        return <Truck className="w-4 h-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'booking':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-slate-500" />;
      default:
        return <Package className="w-4 h-4 text-emerald-600" />;
    }
  };

  const getStatusBadgeBg = (type: AdminNotification['type']) => {
    switch (type) {
      case 'return':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'refund':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'shipping':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'booking':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Thông báo hệ thống"
          className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
        >
          <Bell className="w-4.5 h-4.5 text-slate-700" />

          {/* SỐ NỔI SÁNG (GLOWING / PULSING NOTIFICATION BADGE) */}
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center">
              {/* Outer Glowing Pulsating Ring */}
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              {/* Vibrant Glowing Badge Pill */}
              <span className="relative inline-flex items-center justify-center rounded-full h-5 min-w-5 px-1.5 bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 text-[10px] font-black text-white shadow-md shadow-rose-500/60 ring-2 ring-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 p-0 rounded-2xl shadow-2xl border border-slate-200 bg-white overflow-hidden text-xs z-50 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-3.5 bg-[#FAF8F5] border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-sm leading-tight flex items-center gap-1.5">
                <span>Thông báo Đơn hàng</span>
                {unreadCount > 0 && (
                  <Badge className="bg-rose-500 text-white font-black text-[10px] px-1.5 py-0">
                    {unreadCount} mới
                  </Badge>
                )}
              </div>
              <div className="text-[10px] text-slate-400">
                Cập nhật trạng thái đơn hàng & vận chuyển
              </div>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline cursor-pointer"
              title="Đánh dấu tất cả đã đọc"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Đã đọc</span>
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              Tất cả ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                filter === 'unread'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              Chưa đọc ({unreadCount})
            </button>
          </div>

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[10px] text-slate-400 hover:text-rose-600 transition-colors p-1 rounded-md hover:bg-rose-50 cursor-pointer"
              title="Xóa tất cả"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
          {filteredNotifications.length === 0 ? (
            <div className="py-10 px-4 text-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <div className="font-semibold text-xs text-slate-600">
                {filter === 'unread' ? 'Không có thông báo chưa đọc nào' : 'Hộp thông báo đang trống'}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Các sự kiện chuyển trạng thái đơn hàng sẽ hiển thị ở đây.
              </div>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                className={`p-3 transition-colors cursor-pointer flex items-start gap-2.5 hover:bg-slate-50 ${
                  !notif.isRead ? 'bg-emerald-50/40 font-medium' : 'bg-white'
                }`}
              >
                {/* Status Icon */}
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  {getStatusIcon(notif.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="font-bold text-slate-900 text-xs truncate">
                      {notif.title}
                    </span>
                    <Badge variant="outline" className={`text-[9px] px-1.5 py-0 shrink-0 font-mono ${getStatusBadgeBg(notif.type)}`}>
                      #{notif.orderCode}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-2.5 h-2.5" />
                      {notif.createdAt}
                    </span>
                    <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                      Xem đơn <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>

                {/* Unread Glow Dot */}
                {!notif.isRead && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-2 shadow-sm shadow-rose-500" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsOpen(false);
              navigate('/orders?tab=online');
            }}
            className="w-full text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 h-8 rounded-xl cursor-pointer"
          >
            Quản lý tất cả đơn hàng & vận chuyển
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
