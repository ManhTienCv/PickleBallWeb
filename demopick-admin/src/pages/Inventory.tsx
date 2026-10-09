import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { adminService } from "@/services/admin.service";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CategoryFormModal } from "@/components/inventory/modals/CategoryFormModal";
import { BrandFormModal } from "@/components/inventory/modals/BrandFormModal";
import { QuickRestockModal } from "@/components/inventory/modals/QuickRestockModal";
import { StaffCounterModal } from "@/components/inventory/modals/StaffCounterModal";
import { ProductFormModal } from "@/components/inventory/modals/ProductFormModal";
import { ProductPreviewModal } from "@/components/inventory/modals/ProductPreviewModal";
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
  X,
  Coffee,
  ChevronLeft,
  ChevronRight,
  FolderTree,
  Tag,
  Trophy,
  Layers,
  CircleDot,
} from "lucide-react";
import { toast } from "sonner";
import { formatNumberWithDots } from "@/lib/utils";

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

import {
  initialCategories,
  initialBrands,
  initialUnifiedProducts,
} from '@/data/mockInventory';
const initialLogs: InventoryLog[] = [];

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

  // Products State
  const [products, setProducts] = useState<InventoryProduct[]>(() => {
    const saved = localStorage.getItem("demopick_online_products_v3");
    if (!saved) return initialUnifiedProducts;
    try {
      const parsed: InventoryProduct[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Chỉ xóa cache cũ nếu còn sót link ảnh unsplash hỏng
        if (parsed.some((p: any) => (p.image || "").includes("unsplash"))) {
          localStorage.removeItem("demopick_online_products_v3");
          return initialUnifiedProducts;
        }
        return parsed;
      }
      return initialUnifiedProducts;
    } catch {
      return initialUnifiedProducts;
    }
  });

  // Fetch real products from backend database
  useEffect(() => {
    adminService.getProducts().then((apiProducts) => {
      if (apiProducts && Array.isArray(apiProducts) && apiProducts.length > 0) {
        const mapped: InventoryProduct[] = apiProducts.map((p: any) => ({
          id: p.id,
          name: p.name,
          category: p.category?.name || "Vợt Pickleball",
          brand: p.brand?.name || "DemoPick",
          price: Number(p.price) || 0,
          originalPrice: Number(p.base_price || p.price) || 0,
          stock: p.stock_quantity ?? (p.variants?.[0]?.stock_quantity ?? (p.variants?.[0]?.stock_qty ?? 50)),
          status: p.in_stock ? "active" : "inactive",
          image: p.image_url || "/images/pickleball_paddle_joola.jpg",
          gallery: [p.image_url || "/images/pickleball_paddle_joola.jpg"],
          highlights: [p.short_description || "Sản phẩm Pickleball chất lượng cao"],
          specs: [],
          description: p.description || p.short_description || "",
          channel: "all",
        }));
        if (mapped.length >= 30) {
          setProducts(mapped);
          localStorage.setItem("demopick_online_products_v3", JSON.stringify(mapped));
        } else {
          const mappedIds = new Set(mapped.map((m) => m.id));
          const merged = [...mapped, ...initialUnifiedProducts.filter((u) => !mappedIds.has(u.id))];
          setProducts(merged);
          localStorage.setItem("demopick_online_products_v3", JSON.stringify(merged));
        }
      }
    });
  }, []);

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

  // Sync to localStorage với bộ đệm bảo vệ tràn hạn mức QuotaExceededError
  useEffect(() => {
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
      item_type: p.category === "Đồ uống & Đồ ăn" ? "drink_food" : (p.category === "Thiết bị & Dịch vụ cho thuê" ? "rental" : (p.channel === "pos_only" ? "drink_food" : "product")),
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

    try {
      localStorage.setItem("demopick_online_products_v3", JSON.stringify(products));
      localStorage.setItem("demopick_categories", JSON.stringify(categories));
      localStorage.setItem("demopick_brands", JSON.stringify(brands));
      localStorage.setItem("demopick_synced_categories", JSON.stringify(categories));
      localStorage.setItem("demopick_synced_brands", JSON.stringify(brands));
      localStorage.setItem("demopick_synced_products_v3", JSON.stringify(syncedList));
    } catch (err: any) {
      if (err?.name === "QuotaExceededError" || err?.code === 22) {
        console.warn("[LocalStorage] QuotaExceededError: Đạt giới hạn bộ nhớ cục bộ, tự động bảo vệ dữ liệu sản phẩm.");
      }
    }
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
  const getCatName = (p: any): string => {
    if (!p) return "";
    if (typeof p.category === "string") return p.category;
    if (p.category && typeof p.category.name === "string") return p.category.name;
    return "";
  };

  const roleBaseProducts = useMemo(() => {
    if (isAdmin) return products;
    return products.filter((p) => {
      const cat = getCatName(p);
      return (
        cat === "Đồ uống & Đồ ăn" ||
        cat === "Thiết bị & Dịch vụ cho thuê" ||
        cat.includes("Đồ uống") ||
        cat.includes("Đồ ăn") ||
        cat.includes("Thuê") ||
        p.channel === "pos_only"
      );
    });
  }, [isAdmin, products]);

  // Filtered Products based on search and category pill
  const filteredProducts = roleBaseProducts.filter((p) => {
    const pName = (p.name || "").toLowerCase();
    const pBrand = (p.brand || "").toLowerCase();
    const sQuery = searchQuery.toLowerCase();
    const matchSearch = pName.includes(sQuery) || pBrand.includes(sQuery);

    const cat = getCatName(p);
    let matchCat = true;
    if (!isAdmin) {
      if (selectedCategory === "Đồ uống & Đồ ăn") {
        matchCat = cat === "Đồ uống & Đồ ăn" || cat.includes("Đồ uống") || cat.includes("Đồ ăn");
      } else if (selectedCategory === "Thiết bị & Dịch vụ cho thuê") {
        matchCat = cat === "Thiết bị & Dịch vụ cho thuê" || cat.includes("Thuê");
      }
    } else {
      if (selectedCategory === "drinks") {
        matchCat = cat.includes("Đồ uống") || cat.includes("Nước") || cat.includes("Đồ ăn");
      } else if (selectedCategory === "rental") {
        matchCat = cat.includes("Thuê");
      } else if (selectedCategory === "equipment") {
        matchCat = cat.includes("Vợt") || cat.includes("Bóng") || cat.includes("Phụ kiện");
      } else if (selectedCategory !== "all") {
        matchCat = cat === selectedCategory;
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
    setFormImage("");
    setFormGallery([]);
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
          ? "/images/pocari_sweat_500ml.jpg"
          : "/images/pickleball_paddle_balls.jpg",
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

    if (formProductType === "online" && !formImage.trim()) {
      toast.error("Vui lòng tải lên ảnh đại diện chính (Cover Image) cho sản phẩm!");
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
        image:
          formImage ||
          (formProductType === "pos"
            ? (formCategory === "Đồ uống & Đồ ăn" ? "/images/pocari_sweat_500ml.jpg" : "/images/pickleball_balls_yellow.jpg")
            : "/images/pickleball_paddle_joola.jpg"),
        gallery: formGallery.length > 0 ? formGallery : (formImage ? [formImage] : []),
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



  return (
    <AppLayout
      title={isAdmin ? "Quản Lý Kho & Bài Đăng Sản Phẩm" : "Kho Hàng Quầy Dịch Vụ — Lễ Tân"}
      headerRight={
        isAdmin ? (
          activeMainTab === "products" ? (
            <div className="flex items-center gap-2">
              <Button
                onClick={handleOpenAddModal}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-2 rounded-xl px-5 h-10 shadow-md shadow-emerald-500/20 text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm sản phẩm mới</span>
              </Button>
            </div>
          ) : null
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
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20"
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
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20"
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
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20"
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
                                      className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-sm shadow-emerald-600/20 cursor-pointer whitespace-nowrap"
                                      title="Nhập thêm số lượng vào kho"
                                    >
                                      <PlusCircle className="w-3.5 h-3.5 shrink-0" />
                                      <span>Bổ sung kho</span>
                                    </button>

                                    <button
                                      onClick={() => handleOpenPreviewModal(p)}
                                      className="h-8 px-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
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
                                      <span>Nhập</span>
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
                          className={`w-8 h-8 rounded-lg text-xs transition-colors flex items-center justify-center border ${currentPage === page
                            ? "bg-emerald-600 text-white font-medium border-emerald-600 shadow-sm shadow-emerald-500/20"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 font-normal"
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
      {/* MODAL: THÊM / SỬA DANH MỤC */}
      <CategoryFormModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        editingCategory={editingCategory}
        catName={catName}
        setCatName={setCatName}
        catIconType={catIconType}
        setCatIconType={setCatIconType}
        catDesc={catDesc}
        setCatDesc={setCatDesc}
        onSubmit={handleSaveCategory}
      />

      {/* MODAL: THÊM / SỬA THƯƠNG HIỆU */}
      <BrandFormModal
        isOpen={brandModalOpen}
        onClose={() => setBrandModalOpen(false)}
        editingBrand={editingBrand}
        brandName={brandName}
        setBrandName={setBrandName}
        brandOrigin={brandOrigin}
        setBrandOrigin={setBrandOrigin}
        brandDesc={brandDesc}
        setBrandDesc={setBrandDesc}
        onSubmit={handleSaveBrand}
      />

      {/* MODAL RIÊNG BIỆT DÀNH CHO NHÂN VIÊN: NHẬP HÀNG QUẦY / TẠO MẶT HÀNG NHẸ */}
      <StaffCounterModal
        isOpen={staffModalOpen}
        onClose={() => setStaffModalOpen(false)}
        staffModalTab={staffModalTab}
        setStaffModalTab={setStaffModalTab}
        roleBaseProducts={roleBaseProducts}
        selectedStaffProductId={selectedStaffProductId as number | null}
        setSelectedStaffProductId={(id) => setSelectedStaffProductId(id)}
        staffRestockQty={staffRestockQty}
        setStaffRestockQty={setStaffRestockQty}
        onRestockSubmit={handleStaffRestockSubmit}
        newStaffItemName={newStaffItemName}
        setNewStaffItemName={setNewStaffItemName}
        newStaffItemCategory={newStaffItemCategory}
        setNewStaffItemCategory={setNewStaffItemCategory}
        newStaffItemBrand={newStaffItemBrand}
        setNewStaffItemBrand={setNewStaffItemBrand}
        newStaffItemPrice={newStaffItemPrice}
        setNewStaffItemPrice={setNewStaffItemPrice}
        newStaffItemStock={newStaffItemStock}
        setNewStaffItemStock={setNewStaffItemStock}
        onCreateItemSubmit={handleStaffCreateItemSubmit}
      />

      {/* MODAL: NHẬP NHANH SỐ LƯỢNG KHO */}
      <QuickRestockModal
        product={restockProduct}
        isOpen={!!restockProduct}
        onClose={() => setRestockProduct(null)}
        restockQty={restockQty}
        setRestockQty={setRestockQty}
        onSubmit={handleQuickRestockSubmit}
      />

      {/* MODAL: THÊM / CHỈNH SỬA SẢN PHẨM TOÀN DIỆN */}
      <ProductFormModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        editingProduct={editingProduct}
        categories={categories}
        brands={brands}
        formProductType={formProductType}
        setFormProductType={setFormProductType}
        formName={formName}
        setFormName={setFormName}
        formCategory={formCategory}
        setFormCategory={setFormCategory}
        formBrand={formBrand}
        setFormBrand={setFormBrand}
        formPrice={formPrice}
        setFormPrice={setFormPrice}
        formOriginalPrice={formOriginalPrice}
        setFormOriginalPrice={setFormOriginalPrice}
        formStock={formStock}
        setFormStock={setFormStock}
        formImage={formImage}
        setFormImage={setFormImage}
        formGallery={formGallery}
        setFormGallery={setFormGallery}
        formHighlights={formHighlights}
        setFormHighlights={setFormHighlights}
        formSpecs={formSpecs}
        setFormSpecs={setFormSpecs}
        formDescription={formDescription}
        setFormDescription={setFormDescription}
        onSubmit={handleSaveProductForm}
      />

      {/* MODAL: XEM TRƯỚC SẢN PHẨM */}
      <ProductPreviewModal
        product={previewProduct}
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
      />
    </AppLayout>
  );
}