package com.demopick.pickleball.common.config;

import com.demopick.pickleball.modules.booking.entity.Court;
import com.demopick.pickleball.modules.booking.entity.TimeSlot;
import com.demopick.pickleball.modules.booking.repository.CourtRepository;
import com.demopick.pickleball.modules.booking.repository.TimeSlotRepository;
import com.demopick.pickleball.modules.shop.entity.Brand;
import com.demopick.pickleball.modules.shop.entity.Category;
import com.demopick.pickleball.modules.shop.entity.Product;
import com.demopick.pickleball.modules.shop.entity.ProductVariant;
import com.demopick.pickleball.modules.shop.repository.BrandRepository;
import com.demopick.pickleball.modules.shop.repository.CategoryRepository;
import com.demopick.pickleball.modules.shop.repository.ProductRepository;
import com.demopick.pickleball.modules.shop.repository.ProductVariantRepository;
import com.demopick.pickleball.modules.user.entity.User;
import com.demopick.pickleball.modules.user.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.Optional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final CourtRepository courtRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    public DataInitializer(
            UserRepository userRepository,
            CourtRepository courtRepository,
            TimeSlotRepository timeSlotRepository,
            CategoryRepository categoryRepository,
            BrandRepository brandRepository,
            ProductRepository productRepository,
            ProductVariantRepository productVariantRepository,
            PasswordEncoder passwordEncoder,
            ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.courtRepository = courtRepository;
        this.timeSlotRepository = timeSlotRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
        this.passwordEncoder = passwordEncoder;
        this.objectMapper = objectMapper;
    }

    @Override
    public void run(String... args) {
        try {
            seedUsers();
            seedCourtsAndTimeSlots();
            seedShopData();
        } catch (Exception ex) {
            log.warn("Database initialization completed with notice: {}", ex.getMessage());
        }
    }

    private void seedUsers() {
        log.info("Kiểm tra và đồng bộ tài khoản hệ thống mặc định (Admin, Staff, Customer)...");
        Optional<User> adminOpt = userRepository.findByEmail("admin@demopick.vn");
        if (adminOpt.isEmpty()) {
            User admin = new User();
            admin.setName("Quản Trị Viên DemoPick");
            admin.setEmail("admin@demopick.vn");
            admin.setPhone("0909888999");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("admin");
            admin.setStatus("active");
            userRepository.save(admin);
            log.info("Đã tạo mới tài khoản quản trị admin@demopick.vn / admin123");
        } else {
            User admin = adminOpt.get();
            admin.setRole("admin");
            admin.setStatus("active");
            admin.setPassword(passwordEncoder.encode("admin123"));
            userRepository.save(admin);
            log.info("Đã đồng bộ mật khẩu tài khoản admin@demopick.vn / admin123");
        }

        Optional<User> staffOpt = userRepository.findByEmail("staff@demopick.vn");
        if (staffOpt.isEmpty()) {
            User staff = new User();
            staff.setName("Nhân Viên Lễ Tân DemoPick");
            staff.setEmail("staff@demopick.vn");
            staff.setPhone("0912345678");
            staff.setPassword(passwordEncoder.encode("staff123"));
            staff.setRole("staff");
            staff.setStatus("active");
            userRepository.save(staff);
            log.info("Đã tạo mới tài khoản nhân viên staff@demopick.vn / staff123");
        } else {
            User staff = staffOpt.get();
            staff.setRole("staff");
            staff.setStatus("active");
            staff.setPassword(passwordEncoder.encode("staff123"));
            userRepository.save(staff);
            log.info("Đã đồng bộ mật khẩu tài khoản staff@demopick.vn / staff123");
        }

        Optional<User> customerOpt = userRepository.findByEmail("customer@demopick.vn");
        if (customerOpt.isEmpty()) {
            User customer = new User();
            customer.setName("Khách Hàng Thân Thiết");
            customer.setEmail("customer@demopick.vn");
            customer.setPhone("0901234567");
            customer.setPassword(passwordEncoder.encode("customer123"));
            customer.setRole("customer");
            customer.setStatus("active");
            userRepository.save(customer);
            log.info("Đã tạo mới tài khoản khách hàng customer@demopick.vn / customer123");
        }
    }

    private void seedCourtsAndTimeSlots() {
        log.info("Kiểm tra và đồng bộ danh sách 8 sân Pickleball chuẩn thi đấu (A1-A2, B1-B2, C1-C2, D1-D2)...");

        // Danh sách định nghĩa 8 sân chuẩn
        List<Court> seedList = new ArrayList<>();

        Court c1 = new Court();
        c1.setCode("A1");
        c1.setName("Sân Pickleball A1");
        c1.setSurfaceType("Trong Nhà • Tiêu Chuẩn Pro");
        c1.setLocation("Khu A - Sân Trong Nhà");
        c1.setStatus("active");
        c1.setDescription("Mặt thảm Cushion Master 8 lớp đạt chuẩn USAPA, điều hòa 24/7 và hệ thống đèn LED chống lóa.");
        c1.setImageUrl("/images/pickleball_court.jpg");
        seedList.add(c1);

        Court c2 = new Court();
        c2.setCode("A2");
        c2.setName("Sân Pickleball A2");
        c2.setSurfaceType("Trong Nhà • Tiêu Chuẩn Pro");
        c2.setLocation("Khu A - Sân Trong Nhà");
        c2.setStatus("active");
        c2.setDescription("Mặt thảm Cushion Master chuẩn thi đấu quốc tế, tích hợp camera bắt vạch biên.");
        c2.setImageUrl("/images/pickleball_court_indoor.jpg");
        seedList.add(c2);

        Court c3 = new Court();
        c3.setCode("B1");
        c3.setName("Sân Pickleball B1");
        c3.setSurfaceType("Ngoài Trời • Mái Vòm Che");
        c3.setLocation("Khu B - Sân Mái Vòm");
        c3.setStatus("active");
        c3.setDescription("Sân ngoài trời có mái vòm thông minh che nắng mưa, gió tự nhiên thoáng mát.");
        c3.setImageUrl("/images/pickleball_court_outdoor.jpg");
        seedList.add(c3);

        Court c4 = new Court();
        c4.setCode("B2");
        c4.setName("Sân Pickleball B2");
        c4.setSurfaceType("Ngoài Trời • Mái Vòm Che");
        c4.setLocation("Khu B - Sân Mái Vòm");
        c4.setStatus("active");
        c4.setDescription("Mặt sân thoáng rộng có khu vực khán đài mini, thích hợp giao lưu CLB.");
        c4.setImageUrl("/images/pickleball_court.jpg");
        seedList.add(c4);

        Court c5 = new Court();
        c5.setCode("C1");
        c5.setName("Sân Pickleball C1 (VIP)");
        c5.setSurfaceType("Tiêu Chuẩn Pro VIP");
        c5.setLocation("Khu C - VIP Center");
        c5.setStatus("active");
        c5.setDescription("Sân trung tâm VIP có sofa nghỉ riêng, tủ lạnh mini phục vụ nước suối & khăn lạnh miễn phí.");
        c5.setImageUrl("/images/pickleball_match.jpg");
        seedList.add(c5);

        Court c6 = new Court();
        c6.setCode("C2");
        c6.setName("Sân Pickleball C2 (VIP)");
        c6.setSurfaceType("Tiêu Chuẩn Pro VIP");
        c6.setLocation("Khu C - VIP Center");
        c6.setStatus("active");
        c6.setDescription("Sân VIP riêng tư cách âm, trang bị ghế massage thư giãn và dàn âm thanh bluetooth cá nhân.");
        c6.setImageUrl("/images/pickleball_court_indoor.jpg");
        seedList.add(c6);

        Court c7 = new Court();
        c7.setCode("D1");
        c7.setName("Sân Pickleball D1");
        c7.setSurfaceType("Tiêu Chuẩn Pro");
        c7.setLocation("Khu D - Sân Mở Rộng");
        c7.setStatus("active");
        c7.setDescription("Sân tiêu chuẩn thi đấu trang bị mặt sân chống lóa và hệ thống đèn chiếu sáng công nghệ cao.");
        c7.setImageUrl("/images/pickleball_court_outdoor.jpg");
        seedList.add(c7);

        Court c8 = new Court();
        c8.setCode("D2");
        c8.setName("Sân Pickleball D2");
        c8.setSurfaceType("Tiêu Chuẩn Pro");
        c8.setLocation("Khu D - Sân Mở Rộng");
        c8.setStatus("active");
        c8.setDescription("Sân mặt thảm êm ái, độ đàn hồi chuẩn thi đấu giúp bảo vệ tốt cổ chân và đầu gối vận động viên.");
        c8.setImageUrl("/images/pickleball_court.jpg");
        seedList.add(c8);

        // Khởi tạo từng sân nếu chưa có trong DB (tương thích cả DB mới lẫn DB cũ thiếu sân D)
        for (Court sc : seedList) {
            boolean exists = courtRepository.findByCode(sc.getCode()).isPresent()
                || courtRepository.findByCode("COURT_" + sc.getCode()).isPresent()
                || courtRepository.findByCode("COURT_" + sc.getCode() + "_VIP").isPresent();
            if (!exists) {
                courtRepository.save(sc);
                log.info("Đã bổ sung sân mới: {} ({})", sc.getName(), sc.getCode());
            }
        }

        // Tạo TimeSlots cho tất cả các sân từ hôm nay và 7 ngày tiếp theo nếu chưa có
        LocalDate today = LocalDate.now();
        List<Court> allCourts = courtRepository.findByDeletedAtIsNullOrderByCodeAsc();
        List<TimeSlot> slotsToSave = new ArrayList<>();

        for (int dayOffset = 0; dayOffset <= 7; dayOffset++) {
            LocalDate date = today.plusDays(dayOffset);
            for (Court court : allCourts) {
                if (timeSlotRepository.findByCourtIdAndDateOrderByStartTimeAsc(court.getId(), date).isEmpty()) {
                    for (int hour = 5; hour <= 21; hour++) {
                        TimeSlot slot = new TimeSlot();
                        slot.setCourtId(court.getId());
                        slot.setDate(date);
                        slot.setStartTime(LocalTime.of(hour, 0));
                        slot.setEndTime(LocalTime.of(hour + 1, 0));

                        boolean isVip = court.getName().contains("VIP") || court.getCode().startsWith("C");
                        boolean isPeak = hour >= 17;
                        BigDecimal price;
                        if (isVip) {
                            price = isPeak ? BigDecimal.valueOf(220000) : BigDecimal.valueOf(180000);
                        } else {
                            price = isPeak ? BigDecimal.valueOf(180000) : BigDecimal.valueOf(140000);
                        }
                        slot.setPrice(price);
                        slot.setStatus("available");
                        slotsToSave.add(slot);
                    }
                }
            }
        }
        if (!slotsToSave.isEmpty()) {
            timeSlotRepository.saveAll(slotsToSave);
            log.info("Đã đồng bộ bổ sung {} khung giờ (TimeSlots) cho các sân.", slotsToSave.size());
        }
    }

    private void seedShopData() {
        // 1. Khởi tạo danh mục chuẩn nếu chưa có
        List<String[]> standardCategories = List.of(
            new String[]{"vot-pickleball", "Vợt Pickleball", "Các dòng vợt thi đấu chuẩn USAPA từ Joola, Selkirk, CRBN."},
            new String[]{"bong-pickleball", "Bóng Pickleball", "Bóng tập luyện và thi đấu chính hãng."},
            new String[]{"phu-kien-bao-vot", "Phụ kiện & Bao vợt", "Bao vợt, balo và phụ kiện thi đấu chuyên nghiệp."},
            new String[]{"quan-ao-trang-phuc", "Quần áo & Trang phục", "Trang phục thi đấu Pickleball thoáng khí dry-fit."},
            new String[]{"do-uong-do-an", "Đồ uống & Đồ ăn", "Nước khoáng, điện giải Pocari, Revive và đồ ăn nhẹ phục vụ tại quầy."},
            new String[]{"thiet-bi-dich-vu-cho-thue", "Thiết bị & Dịch vụ cho thuê", "Cho thuê vợt tập, máy bắn bóng tự động."}
        );
        for (String[] catInfo : standardCategories) {
            if (categoryRepository.findBySlug(catInfo[0]).isEmpty()) {
                Category cat = new Category();
                cat.setSlug(catInfo[0]);
                cat.setName(catInfo[1]);
                cat.setDescription(catInfo[2]);
                cat.setIsActive(true);
                categoryRepository.save(cat);
            }
        }

        // 2. Đồng bộ danh mục 42 sản phẩm và đồ uống POS nếu số lượng dưới 30
        if (productRepository.count() < 30) {
            log.info("Bắt đầu khởi tạo đồng bộ toàn bộ 42 sản phẩm và menu đồ uống POS từ catalog.json...");
            try (InputStream is = getClass().getResourceAsStream("/data/catalog.json")) {
                if (is != null) {
                    JsonNode root = objectMapper.readTree(is);
                    if (root.isArray()) {
                        int addedCount = 0;
                        for (JsonNode node : root) {
                            String slug = node.path("slug").asText();
                            if (productRepository.findBySlugAndDeletedAtIsNull(slug).isPresent()) {
                                continue;
                            }

                            // Category
                            JsonNode catNode = node.path("category");
                            String catSlug = catNode.path("slug").asText("vot-pickleball");
                            String catName = catNode.path("name").asText("Vợt Pickleball");
                            Category cat = categoryRepository.findBySlug(catSlug).orElseGet(() -> {
                                Category newCat = new Category();
                                newCat.setName(catName);
                                newCat.setSlug(catSlug);
                                newCat.setIsActive(true);
                                return categoryRepository.save(newCat);
                            });

                            // Brand
                            JsonNode brandNode = node.path("brand");
                            String brandSlug = brandNode.path("slug").asText("joola");
                            String brandName = brandNode.path("name").asText("JOOLA");
                            Brand brand = brandRepository.findBySlug(brandSlug).orElseGet(() -> {
                                Brand newBrand = new Brand();
                                newBrand.setName(brandName);
                                newBrand.setSlug(brandSlug);
                                newBrand.setIsActive(true);
                                return brandRepository.save(newBrand);
                            });

                            Product prod = new Product();
                            prod.setName(node.path("name").asText());
                            prod.setSlug(slug);
                            prod.setShortDescription(node.path("short_description").asText(node.path("name").asText()));
                            prod.setDescription(node.path("description").asText());
                            prod.setCategoryId(cat.getId());
                            prod.setBrandId(brand.getId());
                            BigDecimal price = BigDecimal.valueOf(node.path("base_price").asDouble(node.path("price").asDouble(0.0)));
                            prod.setBasePrice(price);
                            prod.setStatus("active");
                            prod.setIsFeatured(node.path("is_featured").asBoolean(true));
                            prod.setItemType(node.path("item_type").asText("product"));
                            String img = node.path("image_url").asText("/images/pickleball_paddle_joola.jpg");
                            prod.setImages("[\"" + img + "\"]");
                            productRepository.save(prod);

                            // Variants
                            JsonNode variantsNode = node.path("variants");
                            if (variantsNode.isArray() && variantsNode.size() > 0) {
                                for (JsonNode vn : variantsNode) {
                                    ProductVariant v = new ProductVariant();
                                    v.setProduct(prod);
                                    v.setSku(vn.path("sku").asText("SKU-" + prod.getId()));
                                    v.setColor(vn.path("color").asText("Tiêu chuẩn"));
                                    v.setWeight(vn.path("weight").asText("Tiêu chuẩn"));
                                    v.setStockQty(vn.path("stock_quantity").asInt(50));
                                    v.setPriceOverride(BigDecimal.valueOf(vn.path("price").asDouble(price.doubleValue())));
                                    v.setStatus("active");
                                    productVariantRepository.save(v);
                                }
                            } else {
                                ProductVariant v = new ProductVariant();
                                v.setProduct(prod);
                                v.setSku("SKU-" + prod.getId());
                                v.setColor("Tiêu chuẩn");
                                v.setWeight("Tiêu chuẩn");
                                v.setStockQty(50);
                                v.setPriceOverride(price);
                                v.setStatus("active");
                                productVariantRepository.save(v);
                            }
                            addedCount++;
                        }
                        log.info("Đã đồng bộ bổ sung thành công {} sản phẩm và menu đồ uống POS vào cơ sở dữ liệu.", addedCount);
                    }
                } else {
                    log.warn("Không tìm thấy file /data/catalog.json trong resources.");
                }
            } catch (Exception e) {
                log.error("Lỗi khi khởi tạo danh mục catalog.json: {}", e.getMessage(), e);
            }
        }
    }
}
