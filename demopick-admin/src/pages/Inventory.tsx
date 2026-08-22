import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  Boxes,
  CheckCircle2,
  AlertTriangle,
  History,
  Eye,
  Edit,
  Trash2,
  PlusCircle,
  ShoppingBag,
  Store,
  X,
  Check,
  Coffee,
  ChevronLeft,
  ChevronRight,
  FolderTree,
  Tag,
  Trophy,
  Layers,
  CircleDot,
  Globe,
  Sparkles,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

export interface InventoryProduct {
  id: number;
  name: string;
  category: string;
  brand: string;
  price: number;
  originalPrice: number;
  stock: number;
  status: "active" | "out_of_stock" | "hidden";
  image: string;
  gallery: string[];
  highlights: string[];
  specs: { label: string; value: string }[];
  description: string;
  channel: "all" | "pos_only"; // "all": Web & Quầy POS, "pos_only": Quầy POS
}

export interface InventoryLog {
  id: number;
  productName: string;
  changeQty: number;
  stockAfter: number;
  note: string;
  time: string;
}

export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  iconType: "trophy" | "circle-dot" | "shopping-bag" | "layers" | "tag" | "coffee";
}

export interface BrandItem {
  id: number;
  name: string;
  slug: string;
  origin: string;
  description: string;
}

const initialCategories: CategoryItem[] = [
  {
    id: 1,
    name: "Vợt Pickleball",
    slug: "vot-pickleball",
    description: "Các dòng vợt thi đấu sợi carbon T700, raw carbon, composite đạt chuẩn USAPA Pro.",
    iconType: "trophy",
  },
  {
    id: 2,
    name: "Bóng Pickleball",
    slug: "bong-pickleball",
    description: "Bóng thi đấu ngoài trời 40 lỗ và trong nhà 26 lỗ đạt chuẩn giải đấu quốc tế.",
    iconType: "circle-dot",
  },
  {
    id: 3,
    name: "Phụ kiện & Bao vợt",
    slug: "phu-kien-bao-vot",
    description: "Bao vợt chuyên dụng, balo, băng quấn cán, nón, kính bảo vệ mắt chống lóa.",
    iconType: "shopping-bag",
  },
  {
    id: 4,
    name: "Quần áo & Trang phục",
    slug: "quan-ao-trang-phuc",
    description: "Trang phục thi đấu Pickleball chất liệu dry-fit thoáng khí, co giãn 4 chiều.",
    iconType: "layers",
  },
  {
    id: 5,
    name: "Giày & Tất Thể Thao",
    slug: "giay-tat-the-thao",
    description: "Giày thi đấu Pickleball chuyên dụng đế cao su non bám sân, bảo vệ cổ chân.",
    iconType: "tag",
  },
  {
    id: 6,
    name: "Thiết bị & Dịch vụ cho thuê",
    slug: "thiet-bi-dich-vu-cho-thue",
    description: "Cho thuê vợt tập, máy bắn bóng tự động, cọc lưới di động, giày thi đấu.",
    iconType: "tag",
  },
  {
    id: 7,
    name: "Đồ uống & Đồ ăn",
    slug: "do-uong-do-an",
    description: "Nước khoáng điện giải bù khoáng tức thì, cà phê và đồ ăn nhẹ tại quầy dịch vụ sân.",
    iconType: "coffee",
  },
];

const initialBrands: BrandItem[] = [
  { id: 1, name: "JOOLA", slug: "joola", origin: "Mỹ / Đức", description: "Thương hiệu số 1 thế giới, tài trợ Ben Johns & Anna Bright." },
  { id: 2, name: "Selkirk", slug: "selkirk", origin: "Mỹ (USA)", description: "Dòng vợt Power Air & Vanguard sản xuất thủ công cao cấp tại Mỹ." },
  { id: 3, name: "CRBN", slug: "crbn", origin: "Mỹ (USA)", description: "Công nghệ Raw T700 Carbon Fiber tạo xoáy bóng đỉnh cao." },
  { id: 4, name: "Franklin", slug: "franklin", origin: "Mỹ (USA)", description: "Bóng thi đấu chính thức US Open X-40 và phụ kiện chuyên nghiệp." },
  { id: 5, name: "Gamma", slug: "gamma", origin: "Mỹ (USA)", description: "Phụ kiện thể thao, băng cuốn cán vợt chống trượt hàng đầu." },
  { id: 6, name: "Pocari", slug: "pocari", origin: "Nhật Bản", description: "Thức uống bù điện giải ion hàng đầu thế giới." },
  { id: 7, name: "Aquafina", slug: "aquafina", origin: "Việt Nam (PepsiCo)", description: "Nước uống tinh khiết cao cấp." },
  { id: 8, name: "Babolat", slug: "babolat", origin: "Pháp", description: "Hãng thể thao danh tiếng với các dòng vợt trợ lực toàn diện." },
];

const initialUnifiedProducts: InventoryProduct[] = [
  // --- Online Ecommerce Catalog ---
  {
    id: 1,
    name: "Vợt JOOLA Perseus 3S Carbon 16mm",
    category: "Vợt Pickleball",
    brand: "JOOLA",
    price: 5490000,
    originalPrice: 5990000,
    stock: 15,
    status: "active",
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600",
    gallery: [
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600",
      "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600",
    ],
    highlights: [
      "Cảm biến Carbon T700 3S tối ưu xoáy bóng 33.0%",
      "Bộ xử lý cân bằng trợ lực đỉnh cao cho VĐV Chuyên nghiệp",
      "Thiết kế chống lóa mặt vợt chuẩn USAPA Approved",
    ],
    specs: [
      { label: "Mặt vợt", value: "Carbon Fiber T700 3S" },
      { label: "Độ dày lõi", value: "16mm Reactive Polymer Core" },
      { label: "Trọng lượng", value: "230g (8.1 oz)" },
      { label: "Chiều dài", value: "41.9 cm (16.5 inches)" },
      { label: "Chứng nhận", value: "USAPA Approved thi đấu Đỉnh cao" },
    ],
    description:
      "Vợt JOOLA Perseus 3S Carbon 16mm là dòng vợt thi đấu cao cấp nhất thế giới hiện nay, kết hợp hoàn hảo giữa công nghệ Carbon T700 3S kiểm soát lực đánh sắc nét.",
    channel: "all",
  },
  {
    id: 2,
    name: "Vợt Selkirk Vanguard Power Air Invikta",
    category: "Vợt Pickleball",
    brand: "Selkirk",
    price: 6200000,
    originalPrice: 6800000,
    stock: 8,
    status: "active",
    image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600",
    gallery: ["https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600"],
    highlights: [
      "Thiết kế khe khí Air Dynamic bứt phá tốc độ quất vợt",
      "Công nghệ QuadFlex 4-layer linh hoạt tấn công",
    ],
    specs: [
      { label: "Mặt vợt", value: "Hybrid Carbon Fiber & Fiberglass" },
      { label: "Độ dày lõi", value: "13mm Polymer Core" },
      { label: "Trọng lượng", value: "222g (7.8 oz)" },
    ],
    description:
      "Vợt Selkirk Vanguard Power Air Invikta thiết kế dành cho các tay vợt thiên về lối đánh tấn công uy lực smash mạnh mẽ.",
    channel: "all",
  },
  {
    id: 3,
    name: "Vợt CRBN 1X 16mm Middleweight",
    category: "Vợt Pickleball",
    brand: "CRBN",
    price: 4850000,
    originalPrice: 5200000,
    stock: 0,
    status: "out_of_stock",
    image: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600",
    gallery: ["https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600"],
    highlights: ["Bề mặt nhám Carbon nguyên khối sờ như bọt biển"],
    specs: [{ label: "Mặt vợt", value: "Raw Carbon Fiber Surface" }],
    description: "Dòng vợt CRBN 1X danh tiếng với mặt nhám thô đặc trưng.",
    channel: "all",
  },
  {
    id: 4,
    name: "Hộp 12 Bóng Franklin X-40 Outdoor (Vàng)",
    category: "Bóng Pickleball",
    brand: "Franklin",
    price: 420000,
    originalPrice: 480000,
    stock: 50,
    status: "active",
    image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600",
    gallery: ["https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600"],
    highlights: ["Bóng thi đấu chuẩn chính thức US Open Pickleball"],
    specs: [{ label: "Loại bóng", value: "Outdoor 40 lỗ" }],
    description: "Bóng nảy chuẩn xác bền bỉ dùng trong các giải đấu chuyên nghiệp.",
    channel: "all",
  },
  {
    id: 5,
    name: "Băng Cán Vợt Chống Trượt Joola Overgrip (Hộp 3 Cái)",
    category: "Phụ kiện & Bao vợt",
    brand: "JOOLA",
    price: 150000,
    originalPrice: 180000,
    stock: 35,
    status: "active",
    image: "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=600",
    gallery: ["https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=600"],
    highlights: ["Thấm hút mồ hôi cực êm, độ bám siêu dính"],
    specs: [{ label: "Đóng gói", value: "Hộp 3 cuộn quấn cán" }],
    description: "Băng cuốn cán Joola Overgrip mềm mại thấm hút mồ hôi tay cực tốt.",
    channel: "all",
  },

  // --- Quầy Lễ Tân: Đồ uống & Đồ ăn ---
  {
    id: 7,
    name: "Nước Điện Giải Pocari Sweat 500ml",
    category: "Đồ uống & Đồ ăn",
    brand: "Pocari",
    price: 25000,
    originalPrice: 25000,
    stock: 120,
    status: "active",
    image: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600",
    gallery: [],
    highlights: ["Bù khoáng & ion điện giải tức thì cho VĐV"],
    specs: [{ label: "Dung tích", value: "Chai 500ml" }],
    description: "Nước uống bù khoáng chất khi thi đấu thể thao cường độ cao.",
    channel: "pos_only",
  },
  {
    id: 9,
    name: "Nước Suối Aquafina 500ml",
    category: "Đồ uống & Đồ ăn",
    brand: "Aquafina",
    price: 15000,
    originalPrice: 15000,
    stock: 85,
    status: "active",
    image: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600",
    gallery: [],
    highlights: ["Nước tinh khiết mát lạnh giải khát nhanh"],
    specs: [{ label: "Dung tích", value: "Chai 500ml" }],
    description: "Nước khoáng tinh khiết làm mát tức thì tại quầy sân.",
    channel: "pos_only",
  },
  {
    id: 10,
    name: "Nước Tăng Lực Revive Chanh Muối 500ml",
    category: "Đồ uống & Đồ ăn",
    brand: "Revive",
    price: 20000,
    originalPrice: 20000,
    stock: 60,
    status: "active",
    image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600",
    gallery: [],
    highlights: ["Bù muối khoáng vị chanh tươi mát"],
    specs: [{ label: "Dung tích", value: "Chai 500ml" }],
    description: "Nước giải khát vị chanh muối cho người chơi thể thao.",
    channel: "pos_only",
  },
  {
    id: 11,
    name: "Nước Bò Húc Red Bull Thái Lan (Lon 250ml)",
    category: "Đồ uống & Đồ ăn",
    brand: "Red Bull",
    price: 25000,
    originalPrice: 25000,
    stock: 40,
    status: "active",
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600",
    gallery: [],
    highlights: ["Tăng lực tức thì, tỉnh táo thi đấu"],
    specs: [{ label: "Dung tích", value: "Lon 250ml" }],
    description: "Nước tăng lực nhập khẩu Thái Lan.",
    channel: "pos_only",
  },
  {
    id: 12,
    name: "Xúc Xích Nướng CP Phô Mai (Cây)",
    category: "Đồ uống & Đồ ăn",
    brand: "CP Food",
    price: 20000,
    originalPrice: 20000,
    stock: 30,
    status: "active",
    image: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600",
    gallery: [],
    highlights: ["Xúc xích nướng nóng thơm ngon ngập phô mai"],
    specs: [{ label: "Đóng gói", value: "Cây 70g" }],
    description: "Đồ ăn nhẹ phục vụ nhanh tại quầy sân.",
    channel: "pos_only",
  },
  {
    id: 13,
    name: "Bánh Mì Nóng Giòn Pa-tê Trứng",
    category: "Đồ uống & Đồ ăn",
    brand: "Bếp Sân",
    price: 35000,
    originalPrice: 35000,
    stock: 15,
    status: "active",
    image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600",
    gallery: [],
    highlights: ["Bánh mì nướng giòn rụm kẹp pa-tê trứng nóng hổi"],
    specs: [{ label: "Suất ăn", value: "1 ổ bánh mì đầy đủ" }],
    description: "Bánh mì ăn nhẹ nạp năng lượng nhanh trước và sau trận đấu.",
    channel: "pos_only",
  },

  // --- Quầy Lễ Tân: Thiết bị & Dịch vụ cho thuê ---
  {
    id: 8,
    name: "Dịch Vụ Cho Thuê Vợt Tập JOOLA (30k/giờ)",
    category: "Thiết bị & Dịch vụ cho thuê",
    brand: "JOOLA",
    price: 30000,
    originalPrice: 30000,
    stock: 20,
    status: "active",
    image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600",
    gallery: [],
    highlights: ["Vợt tập JOOLA chuẩn cho người mới tập chơi"],
    specs: [{ label: "Hình thức", value: "Cho thuê theo giờ" }],
    description: "Dịch vụ cho thuê vợt tại quầy sân.",
    channel: "pos_only",
  },
  {
    id: 14,
    name: "Dịch Vụ Cho Thuê Máy Bắn Bóng Tự Động (1h)",
    category: "Thiết bị & Dịch vụ cho thuê",
    brand: "Selkirk",
    price: 120000,
    originalPrice: 120000,
    stock: 4,
    status: "active",
    image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600",
    gallery: [],
    highlights: ["Máy bắn bóng tự động lập trình nhiều góc đánh"],
    specs: [{ label: "Thời lượng", value: "1 giờ / lượt thuê" }],
    description: "Máy bắn bóng tập luyện solo hoặc theo nhóm.",
    channel: "pos_only",
  },
  {
    id: 15,
    name: "Dịch Vụ Cho Thuê Cọc Lưới Di Động (1 ca)",
    category: "Thiết bị & Dịch vụ cho thuê",
    brand: "Franklin",
    price: 50000,
    originalPrice: 50000,
    stock: 6,
    status: "active",
    image: "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=600",
    gallery: [],
    highlights: ["Bộ cọc lưới di động tháo lắp nhanh"],
    specs: [{ label: "Quy cách", value: "Set khung lưới tiêu chuẩn" }],
    description: "Bộ cọc lưới phục vụ thi đấu lưu động hoặc sân tập phụ.",
    channel: "pos_only",
  },
  {
    id: 16,
    name: "Dịch Vụ Cho Thuê Giày Thi Đấu (1 ca)",
    category: "Thiết bị & Dịch vụ cho thuê",
    brand: "Babolat",
    price: 40000,
    originalPrice: 40000,
    stock: 12,
    status: "active",
    image: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600",
    gallery: [],
    highlights: ["Giày đế bám chuyên dụng nhiều size từ 38 đến 44"],
    specs: [{ label: "Phụ kiện", value: "Tặng kèm vớ mới" }],
    description: "Cho thuê giày thi đấu cho khách quên mang giày.",
    channel: "pos_only",
  },
];

const initialLogs: InventoryLog[] = [
  {
    id: 1,
    productName: "Băng Quấn Cán Joola Overgrip (Hộp 3 cuộn)",
    changeQty: 50,
    stockAfter: 50,
    note: "Lễ tân [Phạm Văn Đức] nhập bổ sung 50 hộp quấn cán tại quầy vào lúc 10:15",
    time: "10:15 - 09/02/2026",
  },
  {
    id: 2,
    productName: "Vợt JOOLA Perseus 3S Carbon 16mm",
    changeQty: 5,
    stockAfter: 15,
    note: "Quản trị viên bổ sung +5 vợt vào kho tổng",
    time: "08:30 - 09/02/2026",
  },
];

export default function Inventory() {
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole("admin") || hasRole("super_admin");

  // Main Tab Navigation: "products" vs "categories_brands" (Admin only)
  const [activeMainTab, setActiveMainTab] = useState<"products" | "categories_brands">("products");

  // Search & Filters for Products Tab
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(isAdmin ? "Vợt Pickleball" : "Đồ uống & Đồ ăn");

  useEffect(() => {
    if (!isAdmin) {
      setSelectedCategory("Đồ uống & Đồ ăn");
    } else {
      setSelectedCategory("Vợt Pickleball");
    }
  }, [isAdmin]);

  // Products State (guarantee merge of default counter items)
  const [products, setProducts] = useState<InventoryProduct[]>(() => {
    const saved = localStorage.getItem("demopick_online_products");
    if (!saved) return initialUnifiedProducts;
    try {
      const parsed: InventoryProduct[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map((p) => p.id));
      const missing = initialUnifiedProducts.filter((p) => !existingIds.has(p.id));
      if (missing.length > 0) {
        const merged = [...parsed, ...missing];
        localStorage.setItem("demopick_online_products", JSON.stringify(merged));
        return merged;
      }
      return parsed;
    } catch {
      return initialUnifiedProducts;
    }
  });

  // Categories State
  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    const saved = localStorage.getItem("demopick_categories");
    return saved ? JSON.parse(saved) : initialCategories;
  });

  // Brands State
  const [brands, setBrands] = useState<BrandItem[]>(() => {
    const saved = localStorage.getItem("demopick_brands");
    return saved ? JSON.parse(saved) : initialBrands;
  });

  const [logs, setLogs] = useState<InventoryLog[]>(initialLogs);

  // Quick Restock Modal State (Admin)
  const [restockProduct, setRestockProduct] = useState<InventoryProduct | null>(null);
  const [restockQty, setRestockQty] = useState<number | "">(10);

  // Staff Dedicated Modal State
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [staffModalTab, setStaffModalTab] = useState<"restock" | "new_item">("restock");
  const [selectedStaffProductId, setSelectedStaffProductId] = useState<number | "">("");
  const [staffRestockQty, setStaffRestockQty] = useState<number | "">(10);

  // New Counter Item fields for Staff
  const [newStaffItemName, setNewStaffItemName] = useState("");
  const [newStaffItemCategory, setNewStaffItemCategory] = useState<string>("Đồ uống & Đồ ăn");
  const [newStaffItemBrand, setNewStaffItemBrand] = useState("Quầy sân");
  const [newStaffItemPrice, setNewStaffItemPrice] = useState<number | "">(20000);
  const [newStaffItemStock, setNewStaffItemStock] = useState<number | "">(24);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("demopick_online_products", JSON.stringify(products));
    localStorage.setItem("demopick_categories", JSON.stringify(categories));
    localStorage.setItem("demopick_brands", JSON.stringify(brands));
    localStorage.setItem("demopick_synced_categories", JSON.stringify(categories));
    localStorage.setItem("demopick_synced_brands", JSON.stringify(brands));

    const syncedList = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      price: p.price,
      base_price: p.originalPrice || p.price,
      image_url: p.image,
      short_description: p.description,
      description: p.description,
      in_stock: p.stock > 0,
      item_type: p.channel === "pos_only" ? "drink_food" : "product",
      category: { name: p.category },
      brand: { name: p.brand },
      variants: [
        {
          id: p.id * 100,
          sku: `SKU-${p.id}`,
          price: p.price,
          stock_quantity: p.stock,
        },
      ],
    }));
    localStorage.setItem("demopick_synced_products", JSON.stringify(syncedList));
    window.dispatchEvent(new Event("storage"));
  }, [products, categories, brands]);

  // Product Modal States
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null);
  const [previewProduct, setPreviewProduct] = useState<InventoryProduct | null>(null);

  // Form Tab Switcher: "online" vs "pos"
  const [formProductType, setFormProductType] = useState<"online" | "pos">("online");

  // Form Field States for Products
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Vợt Pickleball");
  const [formBrand, setFormBrand] = useState("JOOLA");
  const [formPrice, setFormPrice] = useState<number | "">(5490000);
  const [formOriginalPrice, setFormOriginalPrice] = useState<number | "">(5990000);
  const [formStock, setFormStock] = useState<number | "">(15);
  const [formImage, setFormImage] = useState("");
  const [formGallery, setFormGallery] = useState<string[]>([]);
  const [newGalleryInput, setNewGalleryInput] = useState("");
  const [formHighlights, setFormHighlights] = useState<string[]>([]);
  const [formSpecs, setFormSpecs] = useState<{ label: string; value: string }[]>([]);
  const [formDescription, setFormDescription] = useState("");

  // Category Modal State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catIconType, setCatIconType] = useState<CategoryItem["iconType"]>("trophy");

  // Brand Modal State
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);
  const [brandName, setBrandName] = useState("");
  const [brandOrigin, setBrandOrigin] = useState("Mỹ (USA)");
  const [brandDesc, setBrandDesc] = useState("");

  // Pagination State (10 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Products filtered by role: Lễ tân only sees Drinks, Foods, and Rentals
  const roleBaseProducts = useMemo(() => {
    if (isAdmin) return products;
    return products.filter(
      (p) =>
        p.category === "Đồ uống & Đồ ăn" ||
        p.category === "Thiết bị & Dịch vụ cho thuê" ||
        p.category.includes("Đồ uống") ||
        p.category.includes("Đồ ăn") ||
        p.category.includes("Thuê") ||
        p.channel === "pos_only"
    );
  }, [isAdmin, products]);

  // Filtered Products based on search and category pill
  const filteredProducts = roleBaseProducts.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());

    let matchCat = true;
    if (!isAdmin) {
      if (selectedCategory === "Đồ uống & Đồ ăn") {
        matchCat = p.category === "Đồ uống & Đồ ăn" || p.category.includes("Đồ uống") || p.category.includes("Đồ ăn");
      } else if (selectedCategory === "Thiết bị & Dịch vụ cho thuê") {
        matchCat = p.category === "Thiết bị & Dịch vụ cho thuê" || p.category.includes("Thuê");
      }
    } else {
      if (selectedCategory === "drinks") {
        matchCat = p.category.includes("Đồ uống") || p.category.includes("Nước") || p.category.includes("Đồ ăn");
      } else if (selectedCategory === "rental") {
        matchCat = p.category.includes("Thuê");
      } else if (selectedCategory === "equipment") {
        matchCat = p.category.includes("Vợt") || p.category.includes("Bóng") || p.category.includes("Phụ kiện");
      } else if (selectedCategory !== "all") {
        matchCat = p.category === selectedCategory;
      }
    }

    return matchSearch && matchCat;
  });

  // Reset to Page 1 when search or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate metrics based on role view
  const totalItemsCount = roleBaseProducts.length;
  const availableStockSum = roleBaseProducts.reduce((acc, p) => acc + (p.stock || 0), 0);
  const outOfStockCount = roleBaseProducts.filter((p) => p.stock <= 0).length;

  // Handlers for Add/Edit Product Modal
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormProductType("online");
    setFormName("");
    setFormCategory(categories[0]?.name || "Vợt Pickleball");
    setFormBrand(brands[0]?.name || "JOOLA");
    setFormPrice("");
    setFormOriginalPrice("");
    setFormStock("");
    setFormImage("https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600");
    setFormGallery([
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600",
      "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600",
    ]);
    setFormHighlights([
      "Cảm biến Carbon T700 3S tối ưu xoáy bóng 33.0%",
      "Bộ xử lý cân bằng trợ lực đỉnh cao cho VĐV Chuyên nghiệp",
    ]);
    setFormSpecs([
      { label: "Mặt vợt", value: "Carbon Fiber T700 3S" },
      { label: "Độ dày lõi", value: "16mm Reactive Polymer Core" },
      { label: "Trọng lượng", value: "230g (8.1 oz)" },
      { label: "Chứng nhận", value: "USAPA Approved" },
    ]);
    setFormDescription(
      "Vợt JOOLA Perseus 3S Carbon 16mm là dòng vợt thi đấu cao cấp nhất thế giới hiện nay, kết hợp hoàn hảo giữa công nghệ Carbon T700 3S kiểm soát lực đánh sắc nét."
    );
    setEditModalOpen(true);
  };

  const handleOpenEditModal = (p: InventoryProduct) => {
    setEditingProduct(p);
    setFormProductType(p.channel === "pos_only" ? "pos" : "online");
    setFormName(p.name);
    setFormCategory(p.category);
    setFormBrand(p.brand);
    setFormPrice(p.price);
    setFormOriginalPrice(p.originalPrice || p.price);
    setFormStock(p.stock);
    setFormImage(p.image);
    setFormGallery(p.gallery && p.gallery.length > 0 ? p.gallery : [p.image]);
    setFormHighlights(p.highlights && p.highlights.length > 0 ? p.highlights : ["Đạt chuẩn thi đấu USAPA"]);
    setFormSpecs(p.specs && p.specs.length > 0 ? p.specs : [{ label: "Chất liệu", value: "Carbon T700" }]);
    setFormDescription(p.description || "");
    setEditModalOpen(true);
  };

  const handleOpenPreviewModal = (p: InventoryProduct) => {
    setPreviewProduct(p);
    setPreviewModalOpen(true);
  };

  const handleDeleteProduct = (id: number, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa mặt hàng "${name}" khỏi kho?`)) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success(`Đã xóa mặt hàng "${name}".`);
    }
  };

  // Auto-select staff product when modal opens
  useEffect(() => {
    if (staffModalOpen) {
      if (!selectedStaffProductId || !roleBaseProducts.some((p) => p.id === selectedStaffProductId)) {
        if (roleBaseProducts.length > 0) {
          setSelectedStaffProductId(roleBaseProducts[0].id);
        }
      }
    }
  }, [staffModalOpen, roleBaseProducts, selectedStaffProductId]);

  // Quick Restock Handler (for Admin or Row shortcut)
  const handleQuickRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProduct) return;
    const addQty = Number(restockQty);
    if (addQty <= 0) return;

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === restockProduct.id) {
          const newStock = p.stock + addQty;
          return { ...p, stock: newStock, status: newStock > 0 ? "active" : "out_of_stock" };
        }
        return p;
      })
    );

    const nowStr = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const actorName = isAdmin ? "Quản trị viên" : `Lễ tân [${user?.name || "Ca trực"}]`;
    const newLog: InventoryLog = {
      id: Date.now(),
      productName: restockProduct.name,
      changeQty: addQty,
      stockAfter: restockProduct.stock + addQty,
      note: `${actorName} nhập bổ sung +${addQty} đơn vị tại quầy vào lúc ${nowStr}`,
      time: `${nowStr} - ${new Date().toLocaleDateString("vi-VN")}`,
    };
    setLogs([newLog, ...logs]);

    toast.success(`Đã cộng thêm +${addQty} vào kho "${restockProduct.name}"!`);
    setRestockProduct(null);
  };

  // Staff Restock Existing Item Handler
  const handleStaffRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = roleBaseProducts.find((p) => p.id === Number(selectedStaffProductId));
    if (!target) {
      toast.error("Vui lòng chọn một mặt hàng quầy.");
      return;
    }
    const addQty = Number(staffRestockQty);
    if (addQty <= 0) {
      toast.error("Vui lòng nhập số lượng hợp lệ (> 0).");
      return;
    }

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === target.id) {
          const newStock = p.stock + addQty;
          return { ...p, stock: newStock, status: newStock > 0 ? "active" : "out_of_stock" };
        }
        return p;
      })
    );

    const nowStr = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const actorName = `Lễ tân [${user?.name || "Ca trực"}]`;
    const newLog: InventoryLog = {
      id: Date.now(),
      productName: target.name,
      changeQty: addQty,
      stockAfter: target.stock + addQty,
      note: `${actorName} nhập bổ sung +${addQty} đơn vị tại quầy vào lúc ${nowStr}`,
      time: `${nowStr} - ${new Date().toLocaleDateString("vi-VN")}`,
    };
    setLogs([newLog, ...logs]);

    toast.success(`Đã cộng thêm +${addQty} vào kho "${target.name}"!`);
    setStaffModalOpen(false);
  };

  // Staff Create New Counter Item Handler
  const handleStaffCreateItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffItemName.trim()) {
      toast.error("Vui lòng nhập tên món hàng quầy.");
      return;
    }
    const priceNum = Number(newStaffItemPrice) || 0;
    const stockNum = Number(newStaffItemStock) || 0;

    const newItem: InventoryProduct = {
      id: Date.now(),
      name: newStaffItemName.trim(),
      category: newStaffItemCategory,
      brand: newStaffItemBrand.trim() || "Quầy sân",
      price: priceNum,
      originalPrice: priceNum,
      stock: stockNum,
      status: stockNum > 0 ? "active" : "out_of_stock",
      image:
        newStaffItemCategory === "Đồ uống & Đồ ăn"
          ? "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600"
          : "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600",
      gallery: [],
      highlights: ["Mặt hàng phục vụ trực tiếp tại quầy"],
      specs: [],
      description: `Mặt hàng ${newStaffItemName.trim()} phục vụ tại quầy dịch vụ sân.`,
      channel: "pos_only",
    };

    setProducts((prev) => [newItem, ...prev]);

    const nowStr = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const actorName = `Lễ tân [${user?.name || "Ca trực"}]`;
    const newLog: InventoryLog = {
      id: Date.now(),
      productName: newItem.name,
      changeQty: stockNum,
      stockAfter: stockNum,
      note: `${actorName} tạo mới mặt hàng quầy và nhập ban đầu +${stockNum} đơn vị vào lúc ${nowStr}`,
      time: `${nowStr} - ${new Date().toLocaleDateString("vi-VN")}`,
    };
    setLogs([newLog, ...logs]);

    toast.success(`Đã thêm mặt hàng "${newItem.name}" với tồn kho ban đầu ${stockNum}!`);
    setStaffModalOpen(false);
    setNewStaffItemName("");
    setNewStaffItemPrice(20000);
    setNewStaffItemStock(24);
  };

  // Form Save Product
  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Vui lòng nhập tên sản phẩm / mặt hàng.");
      return;
    }

    const priceNum = Number(formPrice) || 0;
    const origPriceNum = Number(formOriginalPrice) || priceNum;
    const stockNum = Number(formStock) || 0;
    const resolvedChannel = formProductType === "online" ? "all" : "pos_only";

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === editingProduct.id) {
            return {
              ...p,
              name: formName,
              category: formCategory,
              brand: formBrand,
              price: priceNum,
              originalPrice: origPriceNum,
              stock: stockNum,
              channel: resolvedChannel,
              status: stockNum > 0 ? "active" : "out_of_stock",
              image: formImage || p.image,
              gallery: formGallery.length > 0 ? formGallery : [formImage],
              highlights: formProductType === "online" ? formHighlights.filter((h) => h.trim() !== "") : [],
              specs: formProductType === "online" ? formSpecs.filter((s) => s.label.trim() !== "") : [],
              description: formDescription,
            };
          }
          return p;
        })
      );
      toast.success(`Đã cập nhật sản phẩm "${formName}" thành công!`);
    } else {
      const newProd: InventoryProduct = {
        id: Date.now(),
        name: formName,
        category: formCategory,
        brand: formBrand,
        price: priceNum,
        originalPrice: origPriceNum,
        stock: stockNum,
        channel: resolvedChannel,
        status: stockNum > 0 ? "active" : "out_of_stock",
        image: formImage || "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600",
        gallery: formGallery.length > 0 ? formGallery : [formImage],
        highlights: formProductType === "online" ? formHighlights.filter((h) => h.trim() !== "") : [],
        specs: formProductType === "online" ? formSpecs.filter((s) => s.label.trim() !== "") : [],
        description: formDescription,
      };
      setProducts([newProd, ...products]);
      toast.success(`Đã thêm mới mặt hàng "${formName}" vào hệ thống kho!`);
    }

    setEditModalOpen(false);
  };

  // Category Handlers
  const handleOpenAddCategoryModal = () => {
    setEditingCategory(null);
    setCatName("");
    setCatDesc("");
    setCatIconType("trophy");
    setCategoryModalOpen(true);
  };

  const handleOpenEditCategoryModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatDesc(cat.description);
    setCatIconType(cat.iconType);
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      toast.error("Vui lòng nhập tên danh mục.");
      return;
    }

    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? { ...c, name: catName.trim(), description: catDesc.trim(), iconType: catIconType }
            : c
        )
      );
      toast.success(`Đã cập nhật danh mục "${catName}"!`);
    } else {
      const newCat: CategoryItem = {
        id: Date.now(),
        name: catName.trim(),
        slug: catName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        description: catDesc.trim() || "Phân loại sản phẩm Pickleball chính hãng.",
        iconType: catIconType,
      };
      setCategories([...categories, newCat]);
      toast.success(`Đã thêm danh mục mới "${catName}"!`);
    }
    setCategoryModalOpen(false);
  };

  const handleDeleteCategory = (id: number, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}"? Các sản phẩm thuộc danh mục này sẽ giữ nguyên.`)) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success(`Đã xóa danh mục "${name}".`);
    }
  };

  // Brand Handlers
  const handleOpenAddBrandModal = () => {
    setEditingBrand(null);
    setBrandName("");
    setBrandOrigin("Mỹ (USA)");
    setBrandDesc("");
    setBrandModalOpen(true);
  };

  const handleOpenEditBrandModal = (brand: BrandItem) => {
    setEditingBrand(brand);
    setBrandName(brand.name);
    setBrandOrigin(brand.origin);
    setBrandDesc(brand.description);
    setBrandModalOpen(true);
  };

  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) {
      toast.error("Vui lòng nhập tên thương hiệu / hãng.");
      return;
    }

    if (editingBrand) {
      setBrands((prev) =>
        prev.map((b) =>
          b.id === editingBrand.id
            ? { ...b, name: brandName.trim(), origin: brandOrigin.trim(), description: brandDesc.trim() }
            : b
        )
      );
      toast.success(`Đã cập nhật thương hiệu "${brandName}"!`);
    } else {
      const newBrand: BrandItem = {
        id: Date.now(),
        name: brandName.trim(),
        slug: brandName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        origin: brandOrigin.trim() || "Chính hãng",
        description: brandDesc.trim() || "Thương hiệu thiết bị thể thao Pickleball uy tín.",
      };
      setBrands([...brands, newBrand]);
      toast.success(`Đã thêm thương hiệu mới "${brandName}"!`);
    }
    setBrandModalOpen(false);
  };

  const handleDeleteBrand = (id: number, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa hãng "${name}"?`)) {
      setBrands((prev) => prev.filter((b) => b.id !== id));
      toast.success(`Đã xóa thương hiệu "${name}".`);
    }
  };

  // Helper icon renderer for categories
  const renderCategoryIcon = (type: CategoryItem["iconType"]) => {
    switch (type) {
      case "trophy":
        return <Trophy className="w-5 h-5 text-amber-600" />;
      case "circle-dot":
        return <CircleDot className="w-5 h-5 text-emerald-600" />;
      case "shopping-bag":
        return <ShoppingBag className="w-5 h-5 text-blue-600" />;
      case "layers":
        return <Layers className="w-5 h-5 text-purple-600" />;
      case "tag":
        return <Tag className="w-5 h-5 text-rose-600" />;
      case "coffee":
        return <Coffee className="w-5 h-5 text-amber-700" />;
      default:
        return <Boxes className="w-5 h-5 text-emerald-600" />;
    }
  };

  // Add/Remove Highlights & Specs Handlers
  const handleAddHighlight = () => setFormHighlights([...formHighlights, ""]);
  const handleUpdateHighlight = (idx: number, val: string) => {
    const updated = [...formHighlights];
    updated[idx] = val;
    setFormHighlights(updated);
  };
  const handleRemoveHighlight = (idx: number) =>
    setFormHighlights(formHighlights.filter((_, i) => i !== idx));

  const handleAddSpec = () => setFormSpecs([...formSpecs, { label: "", value: "" }]);
  const handleUpdateSpec = (idx: number, field: "label" | "value", val: string) => {
    const updated = [...formSpecs];
    updated[idx][field] = val;
    setFormSpecs(updated);
  };
  const handleRemoveSpec = (idx: number) => setFormSpecs(formSpecs.filter((_, i) => i !== idx));

  const handleAddGalleryUrl = () => {
    if (newGalleryInput.trim()) {
      setFormGallery([...formGallery, newGalleryInput.trim()]);
      setNewGalleryInput("");
      toast.success("Đã thêm hình ảnh vào Album!");
    }
  };
  const handleRemoveGalleryImage = (idx: number) =>
    setFormGallery(formGallery.filter((_, i) => i !== idx));

  return (
    <AppLayout
      title={isAdmin ? "Quản Lý Kho & Bài Đăng Sản Phẩm" : "Kho Hàng Quầy Dịch Vụ — Lễ Tân"}
      headerRight={
        isAdmin ? (
          <div className="flex items-center gap-2">
            {activeMainTab === "products" ? (
              <Button
                onClick={handleOpenAddModal}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-2 rounded-xl px-5 h-10 shadow-md shadow-emerald-500/20 text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm sản phẩm mới</span>
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleOpenAddCategoryModal}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-1.5 rounded-xl px-4 h-10 shadow-md shadow-emerald-500/20 text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm danh mục</span>
                </Button>
                <Button
                  onClick={handleOpenAddBrandModal}
                  variant="outline"
                  className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 font-medium gap-1.5 rounded-xl px-4 h-10 text-xs"
                >
                  <Plus className="w-4 h-4 text-emerald-600" />
                  <span>Thêm thương hiệu</span>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 py-1.5 px-3 font-semibold text-xs">
              Quyền Lễ tân: Quản lý hàng quầy
            </Badge>
            <Button
              onClick={() => {
                if (roleBaseProducts.length > 0) {
                  setSelectedStaffProductId(roleBaseProducts[0].id);
                }
                setStaffRestockQty(10);
                setStaffModalTab("restock");
                setStaffModalOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold gap-1.5 rounded-xl px-4 h-10 shadow-md shadow-emerald-500/20 text-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nhập Hàng Quầy</span>
            </Button>
          </div>
        )
      }
    >
      <div className="space-y-6 font-sans">
        {/* 🟢 TOP SUB-TAB NAVIGATION (CHỈ HIỂN THỊ CHO ADMIN) */}
        {isAdmin && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveMainTab("products")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors duration-150 border ${activeMainTab === "products"
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-transparent text-slate-600 hover:bg-slate-100 border-transparent font-semibold"
                  }`}
              >
                <Boxes className="w-4 h-4" />
                <span>Danh Sách Sản Phẩm & Tồn Kho ({products.length})</span>
              </button>

              <button
                onClick={() => setActiveMainTab("categories_brands")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors duration-150 border ${activeMainTab === "categories_brands"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-transparent text-slate-600 hover:bg-slate-100 border-transparent font-semibold"
                  }`}
              >
                <FolderTree className="w-4 h-4" />
                <span>Quản Lý Danh Mục & Thương Hiệu ({categories.length} DM • {brands.length} Hãng)</span>
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB 1: DANH SÁCH SẢN PHẨM & TỒN KHO
        ═══════════════════════════════════════════════════════════════ */}
        {activeMainTab === "products" && (
          <div className="space-y-6">
            {/* TOP METRIC CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Card className="p-4 bg-white border-slate-200 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-medium">
                  <Boxes className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium uppercase">
                    {isAdmin ? "Tổng mặt hàng trong kho" : "Mặt hàng phụ trách tại quầy"}
                  </p>
                  <p className="text-xl font-semibold text-slate-900">{totalItemsCount} Mặt hàng</p>
                </div>
              </Card>

              <Card className="p-4 bg-white border-slate-200 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-medium">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium uppercase">Tồn Kho Khả Dụng Tổng</p>
                  <p className="text-xl font-semibold text-emerald-600">{availableStockSum} Đơn vị</p>
                </div>
              </Card>

              <Card className="p-4 bg-white border-slate-200 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-medium">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium uppercase">Cảnh Báo Hết Hàng</p>
                  <p className="text-xl font-semibold text-amber-600">{outOfStockCount} Mặt hàng</p>
                </div>
              </Card>

              <Card className="p-4 bg-white border-slate-200 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-medium">
                  <History className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium uppercase">Nhật Ký Thao Tác Kho</p>
                  <p className="text-xl font-semibold text-slate-900">{logs.length} Giao dịch</p>
                </div>
              </Card>
            </div>

            {/* SEARCH & FILTERS BAR */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder={
                    isAdmin
                      ? "Tìm kiếm tên sản phẩm, thương hiệu hoặc mặt hàng..."
                      : "Tìm kiếm đồ uống, đồ ăn, thiết bị thuê tại quầy..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-xs h-10 border-slate-200/90 bg-[#FAF8F5]/80 font-normal rounded-xl w-full"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500 shrink-0">
                  {isAdmin ? "Phân loại danh mục:" : "Phân loại hàng quầy:"}
                </span>

                {!isAdmin ? (
                  [
                    { id: "Đồ uống & Đồ ăn", label: "Đồ uống & Đồ ăn" },
                    { id: "Thiết bị & Dịch vụ cho thuê", label: "Thiết bị & Dịch vụ cho thuê" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs transition-colors duration-150 shrink-0 font-semibold border ${selectedCategory === cat.id
                        ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 border-transparent"
                        }`}
                    >
                      {cat.label}
                    </button>
                  ))
                ) : (
                  categories.map((c) => ({ id: c.name, label: c.name })).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs transition-colors duration-150 shrink-0 font-semibold border ${selectedCategory === cat.id
                        ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 border-transparent"
                        }`}
                    >
                      {cat.label}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* PRODUCTS TABLE */}
            <Card className="bg-white border-slate-200/90 shadow-sm rounded-2xl overflow-hidden">
              <div className="w-full overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse min-w-[760px]">
                  <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-3 w-16 text-center">HÌNH ẢNH</th>
                      <th className="py-3.5 px-4 min-w-[240px]">TÊN MẶT HÀNG</th>
                      <th className="py-3.5 px-3 w-40 text-center whitespace-nowrap">DANH MỤC</th>
                      <th className="py-3.5 px-4 w-36 text-right whitespace-nowrap">GIÁ NIÊM YẾT</th>
                      <th className="py-3.5 px-4 w-36 text-center whitespace-nowrap">TỒN KHO KHẢ DỤNG</th>
                      <th className="py-3.5 px-4 w-52 text-center whitespace-nowrap">THAO TÁC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                          Không tìm thấy mặt hàng nào phù hợp.
                        </td>
                      </tr>
                    ) : (
                      paginatedProducts.map((p) => {
                        const isOutOfStock = p.stock <= 0;
                        return (
                          <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                            {/* IMAGE */}
                            <td className="py-3.5 px-3 text-center">
                              <div className="w-11 h-11 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 inline-flex items-center justify-center shadow-xs">
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none";
                                  }}
                                />
                              </div>
                            </td>

                            {/* NAME & BRAND */}
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900 line-clamp-1 text-sm">{p.name}</div>
                              <div className="text-xs text-slate-500 font-normal mt-0.5">
                                Thương hiệu: <span className="font-semibold text-slate-700">{p.brand}</span>
                              </div>
                            </td>

                            {/* CATEGORY */}
                            <td className="py-3.5 px-3 text-center whitespace-nowrap">
                              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                                {p.category}
                              </span>
                            </td>

                            {/* PRICE */}
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <span className="font-bold text-slate-900 text-sm">
                                {new Intl.NumberFormat("vi-VN").format(p.price)} đ
                              </span>
                            </td>

                            {/* STOCK BADGE (CLEAN & SPACIOUS) */}
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${isOutOfStock
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  }`}
                              >
                                <span className={`w-2 h-2 rounded-full ${isOutOfStock ? "bg-rose-500" : "bg-emerald-500"}`} />
                                {isOutOfStock ? "Hết hàng (0)" : `Tồn kho: ${p.stock}`}
                              </span>
                            </td>

                            {/* ACTIONS */}
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <div className="inline-flex items-center justify-center gap-2">
                                {!isAdmin ? (
                                  <>
                                    <button
                                      onClick={() => {
                                        setSelectedStaffProductId(p.id);
                                        setStaffRestockQty(10);
                                        setStaffModalTab("restock");
                                        setStaffModalOpen(true);
                                      }}
                                      className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm shadow-emerald-600/20 cursor-pointer whitespace-nowrap"
                                      title="Nhập thêm số lượng vào kho"
                                    >
                                      <PlusCircle className="w-3.5 h-3.5 shrink-0" />
                                      <span>Bổ sung kho</span>
                                    </button>

                                    <button
                                      onClick={() => handleOpenPreviewModal(p)}
                                      className="h-8 px-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                                    >
                                      <Eye className="w-3.5 h-3.5 shrink-0" />
                                      <span>Xem</span>
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => {
                                        setRestockProduct(p);
                                        setRestockQty(10);
                                      }}
                                      className="h-8 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                                      title="Cộng số lượng kho"
                                    >
                                      <PlusCircle className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                                      <span>+ Nhập</span>
                                    </button>
                                    <button
                                      onClick={() => handleOpenPreviewModal(p)}
                                      className="h-8 px-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                                    >
                                      <Eye className="w-3.5 h-3.5 shrink-0" />
                                      <span>Xem</span>
                                    </button>
                                    <button
                                      onClick={() => handleOpenEditModal(p)}
                                      className="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                                    >
                                      <Edit className="w-3.5 h-3.5 shrink-0" />
                                      <span>Sửa</span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProduct(p.id, p.name)}
                                      className="h-8 px-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                      <span>Xóa</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION FOOTER */}
              {filteredProducts.length > 0 && (
                <div className="p-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
                  <div className="text-xs text-slate-500 font-normal">
                    Hiển thị{" "}
                    <span className="font-medium text-slate-800">
                      {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredProducts.length)}
                    </span>{" "}
                    trên tổng số <span className="font-medium text-slate-800">{filteredProducts.length}</span> mặt hàng
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="h-8 px-2.5 text-xs font-normal rounded-lg bg-white border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                      >
                        <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                        Trước
                      </Button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-lg text-xs transition-all flex items-center justify-center ${currentPage === page
                            ? "bg-emerald-600 text-white font-medium shadow-sm shadow-emerald-500/20"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-normal"
                            }`}
                        >
                          {page}
                        </button>
                      ))}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="h-8 px-2.5 text-xs font-normal rounded-lg bg-white border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                      >
                        Sau
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* LOGS SECTION */}
            <Card className="p-4 bg-white border-slate-200/90 shadow-sm rounded-2xl space-y-3">
              <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2 border-b pb-3">
                <History className="h-4 w-4 text-emerald-600" />
                Nhật Ký Nhập Kho & Thao Tác Tự Động Đồng Bộ
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {logs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-900">{log.productName}</span>
                      <Badge className="bg-emerald-600 font-normal">+{log.changeQty}</Badge>
                    </div>
                    <p className="text-slate-600 text-[11px] font-normal">{log.note}</p>
                    <div className="text-[10px] text-slate-400 pt-0.5">{log.time}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB 2: QUẢN LÝ DANH MỤC & THƯƠNG HIỆU (KHỚP CHUẨN ẢNH MẪU 1)
        ═══════════════════════════════════════════════════════════════ */}
        {activeMainTab === "categories_brands" && (
          <div className="space-y-8">
            {/* MỤC 1: QUẢN LÝ DANH MỤC (CATEGORIES) */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <FolderTree className="w-5 h-5 text-emerald-600" />
                    <span>Quản lý Danh mục</span>
                  </h2>

                </div>

                <Button
                  onClick={handleOpenAddCategoryModal}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-1.5 rounded-xl px-4 h-10 shadow-sm text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm danh mục mới</span>
                </Button>
              </div>

              {/* CATEGORIES CARD GRID (KHỚP CHUẨN FORM ẢNH 1) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {categories.map((cat) => {
                  const productCount = products.filter((p) => p.category === cat.name).length;
                  return (
                    <Card
                      key={cat.id}
                      className="p-5 bg-white border border-slate-200/90 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-slate-100 flex items-center justify-center">
                            {renderCategoryIcon(cat.iconType)}
                          </div>
                          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/60">
                            {productCount} sản phẩm
                          </span>
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-900 text-base">{cat.name}</h3>
                          <p className="text-xs text-slate-500 font-normal mt-1 leading-relaxed line-clamp-2">
                            {cat.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-4 mt-3 border-t border-slate-100">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEditCategoryModal(cat)}
                          className="h-8 px-3.5 rounded-xl text-xs font-semibold text-amber-700 bg-amber-50/80 border-amber-200 hover:bg-amber-100 gap-1.5"
                        >
                          <Edit className="w-3.5 h-3.5 text-amber-600" />
                          <span>Sửa</span>
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="h-8 px-3.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50/80 border-rose-200 hover:bg-rose-100 gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Xóa</span>
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* MỤC 2: QUẢN LÝ THƯƠNG HIỆU (BRANDS - GIẢI QUYẾT BÀI TOÁN NHIỀU HÃNG SAU NÀY) */}
            <div className="space-y-4 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-emerald-600" />
                    <span>Quản lý Thương hiệu (Brands)</span>
                  </h2>
                </div>

                <Button
                  onClick={handleOpenAddBrandModal}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-medium gap-1.5 rounded-xl px-4 h-10 shadow-sm text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm thương hiệu mới</span>
                </Button>
              </div>

              {/* BRANDS CARD GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {brands.map((brand) => {
                  const brandProductCount = products.filter(
                    (p) => p.brand.toLowerCase() === brand.name.toLowerCase()
                  ).length;
                  return (
                    <Card
                      key={brand.id}
                      className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                            {brand.origin}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500">
                            {brandProductCount} SP
                          </span>
                        </div>

                        <div>
                          <h4 className="font-extrabold text-slate-900 text-base tracking-wide uppercase">
                            {brand.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-normal line-clamp-2 mt-0.5 leading-tight">
                            {brand.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditBrandModal(brand)}
                          className="h-7 px-2 text-[11px] text-amber-700 hover:bg-amber-50"
                        >
                          <Edit className="w-3 h-3 mr-1 text-amber-600" />
                          Sửa
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBrand(brand.id, brand.name)}
                          className="h-7 px-2 text-[11px] text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3 h-3 mr-1 text-rose-600" />
                          Xóa
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          MODAL: THÊM / SỬA DANH MỤC (CATEGORY DIALOG)
      ═══════════════════════════════════════════════════════════════ */}
      <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-6 border border-slate-200 font-sans shadow-2xl">
          <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
            <DialogHeader>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                <FolderTree className="w-5 h-5" />
              </div>
              <DialogTitle className="text-base font-bold text-slate-900">
                {editingCategory ? "Chỉnh Sửa Danh Mục" : "Thêm Danh Mục Mới"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 font-normal">
                Danh mục sẽ tự động đồng bộ sang Form nhập sản phẩm & Thanh lọc sản phẩm trên Website.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <Label className="font-semibold text-slate-800 text-xs">Tên Danh Mục (*):</Label>
                <Input
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Ví dụ: Vợt Pickleball, Giày thể thao..."
                  className="h-10 text-xs font-normal rounded-xl border-slate-200"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-slate-800 text-xs">Loại Biểu Tượng (Icon):</Label>
                <select
                  value={catIconType}
                  onChange={(e) => setCatIconType(e.target.value as CategoryItem["iconType"])}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs bg-white font-normal focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="trophy">🏆 Cúp Thể Thao (Vợt / Giải đấu)</option>
                  <option value="circle-dot">🎾 Quả Bóng (Bóng thi đấu)</option>
                  <option value="shopping-bag">🛍️ Túi Đựng / Balo (Phụ kiện)</option>
                  <option value="layers">👕 Trang Phục / Quần Áo</option>
                  <option value="tag">🏷️ Thẻ Nhãn / Giày Thể Thao</option>
                  <option value="coffee">☕ Đồ Uống & Đồ Ăn</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-slate-800 text-xs">Mô Tả Danh Mục:</Label>
                <textarea
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Mô tả tóm tắt đặc điểm của nhóm sản phẩm này..."
                  className="w-full h-20 p-3 border border-slate-200 rounded-xl text-xs font-normal focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-slate-100 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCategoryModalOpen(false)}
                className="h-9 px-4 rounded-xl text-xs font-normal"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="h-9 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs"
              >
                {editingCategory ? "Lưu Cập Nhật" : "Tạo Danh Mục"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════
          MODAL: THÊM / SỬA THƯƠNG HIỆU (BRAND DIALOG)
      ═══════════════════════════════════════════════════════════════ */}
      <Dialog open={brandModalOpen} onOpenChange={setBrandModalOpen}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-6 border border-slate-200 font-sans shadow-2xl">
          <form onSubmit={handleSaveBrand} className="space-y-4 text-xs">
            <DialogHeader>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                <Tag className="w-5 h-5" />
              </div>
              <DialogTitle className="text-base font-bold text-slate-900">
                {editingBrand ? "Chỉnh Sửa Thương Hiệu" : "Thêm Hãng / Thương Hiệu Mới"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 font-normal">
                Hãng mới sẽ xuất hiện trong Form thêm sản phẩm & Cột bộ lọc đa chọn thương hiệu trên Web.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <Label className="font-semibold text-slate-800 text-xs">Tên Hãng / Thương Hiệu (*):</Label>
                <Input
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Ví dụ: Diadem, Babolat, Wilson, Adidas..."
                  className="h-10 text-xs font-normal rounded-xl border-slate-200"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-slate-800 text-xs">Quốc Gia / Xuất Xứ:</Label>
                <Input
                  value={brandOrigin}
                  onChange={(e) => setBrandOrigin(e.target.value)}
                  placeholder="Ví dụ: Mỹ (USA), Đức, Pháp, Nhật Bản..."
                  className="h-10 text-xs font-normal rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-slate-800 text-xs">Mô Tả Thương Hiệu:</Label>
                <textarea
                  value={brandDesc}
                  onChange={(e) => setBrandDesc(e.target.value)}
                  placeholder="Thông tin giới thiệu về thương hiệu này..."
                  className="w-full h-20 p-3 border border-slate-200 rounded-xl text-xs font-normal focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-slate-100 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setBrandModalOpen(false)}
                className="h-9 px-4 rounded-xl text-xs font-normal"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="h-9 px-5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs"
              >
                {editingBrand ? "Lưu Cập Nhật" : "Tạo Hãng Mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════
          STAFF DEDICATED DIALOG: RESTOCK OR ADD NEW COUNTER ITEM
      ═══════════════════════════════════════════════════════════════ */}
      <Dialog open={staffModalOpen} onOpenChange={setStaffModalOpen}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-6 border border-slate-200 font-sans shadow-2xl">
          <DialogHeader>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
              <PlusCircle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-base font-bold text-slate-900">
              Quản Lý Hàng Hóa Quầy Lễ Tân
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-normal">
              Bổ sung số lượng tồn kho hoặc thêm món mới phục vụ tại quầy.
            </DialogDescription>
          </DialogHeader>

          {/* TAB SWITCHER */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setStaffModalTab("restock")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${staffModalTab === "restock"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
                }`}
            >
              Bổ sung số lượng
            </button>
            <button
              type="button"
              onClick={() => setStaffModalTab("new_item")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${staffModalTab === "new_item"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
                }`}
            >
              + Thêm món quầy mới
            </button>
          </div>

          {staffModalTab === "restock" ? (
            <form onSubmit={handleStaffRestockSubmit} className="space-y-4 text-xs pt-1">
              <div className="space-y-1.5">
                <Label className="font-semibold text-slate-800 text-xs">Chọn Mặt Hàng Cần Nhập Thêm (*):</Label>
                <select
                  value={selectedStaffProductId || ""}
                  onChange={(e) => setSelectedStaffProductId(Number(e.target.value))}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  {roleBaseProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Hiện có: {p.stock}) — {p.category}
                    </option>
                  ))}
                </select>
              </div>

              {(() => {
                const target = roleBaseProducts.find((p) => p.id === Number(selectedStaffProductId));
                if (!target) return null;
                return (
                  <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 text-emerald-900 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span>Tồn kho hiện tại:</span>
                      <strong className="text-sm font-bold text-emerald-700">{target.stock} đơn vị</strong>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-emerald-200/50">
                      <span>Tồn sau khi nhập:</span>
                      <strong className="text-sm font-bold text-slate-900">
                        {target.stock + (Number(staffRestockQty) || 0)} đơn vị
                      </strong>
                    </div>
                  </div>
                );
              })()}

              <div className="space-y-2">
                <Label className="font-semibold text-slate-800 text-xs">Số Lượng Nhập Thêm Vào Kho (*):</Label>
                <Input
                  type="number"
                  min={1}
                  value={staffRestockQty}
                  onChange={(e) => setStaffRestockQty(e.target.value === "" ? "" : Number(e.target.value))}
                  className="font-bold text-base text-emerald-700 h-10 rounded-xl border-slate-200"
                  required
                />

                {/* Quick Add Presets */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-400 font-medium">Nhập nhanh:</span>
                  {[5, 10, 24, 50, 100].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setStaffRestockQty(qty)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${staffRestockQty === qty
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                    >
                      +{qty}
                    </button>
                  ))}
                </div>
              </div>

              <DialogFooter className="pt-3 border-t border-slate-100 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStaffModalOpen(false)}
                  className="h-9 px-4 rounded-xl text-xs font-medium border-slate-300"
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  className="h-9 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs shadow-md shadow-emerald-500/20"
                >
                  Xác Nhận Nhập Kho
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <form onSubmit={handleStaffCreateItemSubmit} className="space-y-3.5 text-xs pt-1">
              <div className="space-y-1.5">
                <Label className="font-semibold text-slate-800 text-xs">Tên Món Hàng Quầy (*):</Label>
                <Input
                  value={newStaffItemName}
                  onChange={(e) => setNewStaffItemName(e.target.value)}
                  placeholder="Ví dụ: Nước dừa tươi, Bánh sừng bò, Thuê khăn tắm..."
                  className="h-10 text-xs font-normal rounded-xl border-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="font-semibold text-slate-800 text-xs">Phân Loại:</Label>
                  <select
                    value={newStaffItemCategory}
                    onChange={(e) => setNewStaffItemCategory(e.target.value)}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Đồ uống & Đồ ăn">Đồ uống & Đồ ăn</option>
                    <option value="Thiết bị & Dịch vụ cho thuê">Thiết bị cho thuê</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="font-semibold text-slate-800 text-xs">Hãng / Nguồn Cung:</Label>
                  <Input
                    value={newStaffItemBrand}
                    onChange={(e) => setNewStaffItemBrand(e.target.value)}
                    placeholder="Quầy sân / Nhà cung cấp"
                    className="h-10 text-xs font-normal rounded-xl border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="font-semibold text-slate-800 text-xs">Giá Bán Tại Quầy (đ):</Label>
                  <Input
                    type="number"
                    min={0}
                    step={1000}
                    value={newStaffItemPrice}
                    onChange={(e) => setNewStaffItemPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    className="h-10 text-xs font-bold text-slate-900 rounded-xl border-slate-200"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-semibold text-slate-800 text-xs">Số Lượng Nhập Ban Đầu:</Label>
                  <Input
                    type="number"
                    min={1}
                    value={newStaffItemStock}
                    onChange={(e) => setNewStaffItemStock(e.target.value === "" ? "" : Number(e.target.value))}
                    className="h-10 text-xs font-bold text-emerald-700 rounded-xl border-slate-200"
                    required
                  />
                </div>
              </div>

              <DialogFooter className="pt-3 border-t border-slate-100 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStaffModalOpen(false)}
                  className="h-9 px-4 rounded-xl text-xs font-medium border-slate-300"
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  className="h-9 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs shadow-md shadow-emerald-500/20"
                >
                  Tạo Món & Nhập Kho
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════
          QUICK RESTOCK DIALOG (ADMIN)
      ═══════════════════════════════════════════════════════════════ */}
      <Dialog open={!!restockProduct} onOpenChange={() => setRestockProduct(null)}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-6 border border-slate-200 font-sans shadow-2xl">
          {restockProduct && (
            <form onSubmit={handleQuickRestockSubmit} className="space-y-4 text-xs">
              <DialogHeader>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                  <PlusCircle className="h-5 w-5" />
                </div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  Nhập Bổ Sung Tồn Kho
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 font-normal">
                  Cập nhật số lượng mặt hàng: <strong className="font-medium text-slate-800">{restockProduct.name}</strong>
                </DialogDescription>
              </DialogHeader>

              <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 text-emerald-900 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span>Tồn kho hiện tại:</span>
                  <strong className="text-sm font-bold text-emerald-700">{restockProduct.stock} đơn vị</strong>
                </div>
                <div className="flex justify-between items-center text-xs pt-1 border-t border-emerald-200/50">
                  <span>Tồn sau khi nhập:</span>
                  <strong className="text-sm font-bold text-slate-900">
                    {restockProduct.stock + (Number(restockQty) || 0)} đơn vị
                  </strong>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-slate-800 text-xs">Số Lượng Nhập Thêm Vào Kho (*):</Label>
                <Input
                  type="number"
                  min={1}
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value === "" ? "" : Number(e.target.value))}
                  className="font-bold text-base text-emerald-700 h-10 rounded-xl border-slate-200"
                  required
                />

                {/* Quick Add Presets */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-400 font-medium">Nhập nhanh:</span>
                  {[5, 10, 24, 50, 100].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setRestockQty(qty)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${restockQty === qty
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                    >
                      +{qty}
                    </button>
                  ))}
                </div>
              </div>

              <DialogFooter className="pt-3 border-t border-slate-100 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRestockProduct(null)}
                  className="h-9 px-4 rounded-xl text-xs font-medium border-slate-300"
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  className="h-9 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs shadow-md shadow-emerald-500/20"
                >
                  Xác Nhận Nhập Kho
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════
          ADD / EDIT PRODUCT MODAL (ĐỌC CATEGORY VÀ BRAND ĐỘNG)
      ═══════════════════════════════════════════════════════════════ */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto p-6 rounded-3xl border border-slate-200 font-sans shadow-2xl">
          <form onSubmit={handleSaveProductForm} className="space-y-5 text-xs">
            <DialogHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-lg font-semibold text-slate-900">
                    {editingProduct ? "Chỉnh Sửa Mặt Hàng Kho" : "Thêm Mặt Hàng Mới Vào Kho"}
                  </DialogTitle>
                  <DialogDescription className="font-normal text-slate-500 text-xs mt-0.5">
                    Hệ thống sẽ đồng bộ thông tin và tồn kho ngay lập tức giữa Website & Quầy POS.
                  </DialogDescription>
                </div>
              </div>

              {/* FORM TAB SWITCHER */}
              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setFormProductType("online")}
                  className={`px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-2 ${formProductType === "online"
                    ? "bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-500/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 font-normal"
                    }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Sản Phẩm Đăng Bán Online & Quầy (Vợt, bóng, phụ kiện...)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormProductType("pos")}
                  className={`px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-2 ${formProductType === "pos"
                    ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 font-normal"
                    }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Dịch Vụ Bán Tại Quầy (Đồ uống, thuê sân...)</span>
                </button>
              </div>
            </DialogHeader>

            {/* TAB CONTENT: ONLINE PRODUCTS */}
            {formProductType === "online" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="font-semibold text-slate-800">Tên Sản Phẩm (*):</Label>
                    <Input
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Ví dụ: Vợt JOOLA Perseus 3S Carbon 16mm"
                      className="font-normal text-xs h-10 border-slate-200 rounded-xl"
                      required
                    />
                  </div>

                  {/* DYNAMIC CATEGORY DROPDOWN */}
                  <div className="space-y-1.5">
                    <Label className="font-semibold text-slate-800">Danh Mục Sản Phẩm:</Label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs bg-white font-normal focus:ring-2 focus:ring-emerald-500"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* DYNAMIC BRAND DROPDOWN */}
                  <div className="space-y-1.5">
                    <Label className="font-semibold text-slate-800">Hãng Sản Xuất / Thương Hiệu:</Label>
                    <select
                      value={formBrand}
                      onChange={(e) => setFormBrand(e.target.value)}
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs bg-white font-normal focus:ring-2 focus:ring-emerald-500"
                    >
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.name}>
                          {brand.name} ({brand.origin})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-semibold text-slate-800">Giá Bán Niêm Yết (VNĐ) (*):</Label>
                    <Input
                      type="number"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="5490000"
                      className="font-normal text-xs h-10 border-slate-200 rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-semibold text-slate-800">Giá Gốc / Giá Gạch (VNĐ):</Label>
                    <Input
                      type="number"
                      value={formOriginalPrice}
                      onChange={(e) => setFormOriginalPrice(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="5990000"
                      className="font-normal text-xs h-10 border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-semibold text-slate-800">Số Lượng Tồn Kho Ban Đầu (*):</Label>
                    <Input
                      type="number"
                      value={formStock}
                      onChange={(e) => setFormStock(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="15"
                      className="font-normal text-xs h-10 border-slate-200 rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="font-semibold text-slate-800">Link Ảnh Đại Diện Chính (URL):</Label>
                    <Input
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      placeholder="https://..."
                      className="font-normal text-xs h-10 border-slate-200 rounded-xl"
                      required
                    />
                  </div>
                </div>

                {/* GALLERY URLS */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <Label className="font-semibold text-slate-800">Album Ảnh Chi Tiết Sản Phẩm:</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newGalleryInput}
                      onChange={(e) => setNewGalleryInput(e.target.value)}
                      placeholder="Nhập link ảnh phụ và bấm Thêm..."
                      className="text-xs h-9 border-slate-200 rounded-xl"
                    />
                    <Button
                      type="button"
                      onClick={handleAddGalleryUrl}
                      className="bg-slate-800 hover:bg-slate-700 text-white text-xs h-9 px-3 rounded-xl"
                    >
                      + Thêm Ảnh
                    </Button>
                  </div>

                  {formGallery.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {formGallery.map((g, idx) => (
                        <div key={idx} className="relative group">
                          <img src={g} alt="" className="w-14 h-14 rounded-lg object-cover border" />
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(idx)}
                            className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5 shadow hover:bg-rose-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* HIGHLIGHTS */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold text-slate-800">Đặc Điểm Nổi Bật (Highlights):</Label>
                    <button
                      type="button"
                      onClick={handleAddHighlight}
                      className="text-[11px] text-emerald-700 hover:underline font-medium"
                    >
                      + Thêm dòng nổi bật
                    </button>
                  </div>
                  {formHighlights.map((hl, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={hl}
                        onChange={(e) => handleUpdateHighlight(idx, e.target.value)}
                        placeholder="Ví dụ: Cảm biến Carbon T700 3S xoáy bóng 33%..."
                        className="text-xs h-8 border-slate-200 rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveHighlight(idx)}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* SPECS */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold text-slate-800">Thông Số Kỹ Thuật (Specs):</Label>
                    <button
                      type="button"
                      onClick={handleAddSpec}
                      className="text-[11px] text-emerald-700 hover:underline font-medium"
                    >
                      + Thêm thông số
                    </button>
                  </div>
                  {formSpecs.map((spec, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={spec.label}
                        onChange={(e) => handleUpdateSpec(idx, "label", e.target.value)}
                        placeholder="Tên thông số (vd: Mặt vợt)"
                        className="text-xs h-8 w-1/3 border-slate-200 rounded-xl"
                      />
                      <Input
                        value={spec.value}
                        onChange={(e) => handleUpdateSpec(idx, "value", e.target.value)}
                        placeholder="Giá trị (vd: Carbon Fiber T700 3S)"
                        className="text-xs h-8 w-2/3 border-slate-200 rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(idx)}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* DESCRIPTION */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <Label className="font-semibold text-slate-800">Bài Viết Giới Thiệu & Mô Tả Chi Tiết:</Label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Nhập nội dung bài viết chi tiết để khách hàng xem trên trang Web..."
                    className="w-full h-24 p-3 border border-slate-200 rounded-xl text-xs font-normal focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* TAB CONTENT: POS ONLY */}
            {formProductType === "pos" && (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 text-xs">
                  Mặt hàng này chỉ hiển thị tại <strong>Máy Bán Hàng Lễ Tân (POS)</strong> cho các dịch vụ ăn uống và thuê trang thiết bị.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="font-semibold text-slate-800">Tên Mặt Hàng / Dịch Vụ (*):</Label>
                    <Input
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Ví dụ: Băng Quấn Cán Vợt Wilson Pro"
                      className="font-normal text-xs h-10 border-slate-200 rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-semibold text-slate-800">Phân Loại Dịch Vụ:</Label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs bg-white font-normal"
                    >
                      <option value="Đồ uống & Đồ ăn">Đồ uống & Đồ ăn</option>
                      <option value="Phụ kiện & Bao vợt">Phụ kiện & Bao vợt</option>
                      <option value="Bóng Pickleball">Bóng Pickleball</option>
                      <option value="Thuê vợt & máy">Thuê vợt & máy tập</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-semibold text-slate-800">Giá Bán Lễ Tân (VNĐ) (*):</Label>
                    <Input
                      type="number"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="20000"
                      className="font-normal text-xs h-10 border-slate-200 rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-semibold text-slate-800">Số Lượng Tồn Sẵn Tại Quầy (*):</Label>
                    <Input
                      type="number"
                      value={formStock}
                      onChange={(e) => setFormStock(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="100"
                      className="font-normal text-xs h-10 border-slate-200 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="font-semibold text-slate-800">Ghi Chú Đơn Vị Tính / Quy Cách:</Label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Ghi chú quy cách đóng gói (Lốc 6 chai, chai 500ml...)"
                    className="w-full h-20 p-3 border border-slate-200 rounded-xl text-xs font-normal focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* MODAL FOOTER */}
            <DialogFooter className="pt-4 border-t border-slate-100 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditModalOpen(false)}
                className="font-normal text-xs h-10 px-5 rounded-xl border-slate-300"
              >
                Hủy bỏ
              </Button>

              <Button
                type="submit"
                className={`font-medium text-xs h-10 px-7 rounded-xl text-white shadow-md ${formProductType === "online"
                  ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
                  : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20"
                  }`}
              >
                {editingProduct ? "Lưu Cập Nhật Mặt Hàng" : "Thêm Mặt Hàng Vào Kho"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════
          PREVIEW DIALOG
      ═══════════════════════════════════════════════════════════════ */}
      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent className="max-w-2xl bg-white max-h-[85vh] overflow-y-auto p-6 rounded-3xl border border-slate-200 font-sans">
          {previewProduct && (
            <div className="space-y-5 text-xs">
              <DialogHeader className="border-b pb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-200 font-normal">
                    {previewProduct.category}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] font-normal">Hãng: {previewProduct.brand}</Badge>
                </div>
                <DialogTitle className="text-lg font-semibold text-slate-900 mt-1">
                  {previewProduct.name}
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <img src={previewProduct.image} alt={previewProduct.name} className="w-full h-52 rounded-2xl object-cover border" />
                  <div className="flex gap-2 overflow-x-auto">
                    {previewProduct.gallery?.map((g, idx) => (
                      <img key={idx} src={g} alt="" className="w-12 h-12 rounded-lg object-cover border shrink-0" />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Giá bán niêm yết:</span>
                    <span className="text-xl font-semibold text-emerald-700">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(previewProduct.price)}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border space-y-1">
                    <div className="font-medium text-slate-900">Tình trạng tồn kho:</div>
                    <p className="text-emerald-700 font-semibold text-sm">
                      {previewProduct.stock > 0 ? `Còn hàng (${previewProduct.stock} sản phẩm)` : "Hết hàng"}
                    </p>
                  </div>

                  {previewProduct.highlights?.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="font-medium text-slate-900">Đặc điểm nổi bật:</div>
                      <ul className="space-y-1 text-slate-600 font-normal">
                        {previewProduct.highlights.map((hl, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{hl}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {previewProduct.specs?.length > 0 && (
                <div className="space-y-2 pt-3 border-t">
                  <h4 className="font-medium text-slate-900 text-sm">Thông số kỹ thuật chi tiết</h4>
                  <div className="border rounded-xl overflow-hidden divide-y">
                    {previewProduct.specs.map((s, idx) => (
                      <div key={idx} className="grid grid-cols-12 p-2.5 bg-slate-50/50">
                        <span className="col-span-5 font-medium text-slate-700">{s.label}</span>
                        <span className="col-span-7 font-normal text-slate-900">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {previewProduct.description && (
                <div className="space-y-2 pt-3 border-t">
                  <h4 className="font-medium text-slate-900 text-sm">Bài viết mô tả sản phẩm</h4>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border font-normal">
                    {previewProduct.description}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
