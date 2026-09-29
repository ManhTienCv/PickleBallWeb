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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

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

    public DataInitializer(
            UserRepository userRepository,
            CourtRepository courtRepository,
            TimeSlotRepository timeSlotRepository,
            CategoryRepository categoryRepository,
            BrandRepository brandRepository,
            ProductRepository productRepository,
            ProductVariantRepository productVariantRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.courtRepository = courtRepository;
        this.timeSlotRepository = timeSlotRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
        this.passwordEncoder = passwordEncoder;
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
        if (userRepository.count() == 0) {
            log.info("Khởi tạo tài khoản hệ thống mặc định (Admin, Staff, Customer)...");
            User admin = new User();
            admin.setName("Quản Trị Viên DemoPick");
            admin.setEmail("admin@demopick.vn");
            admin.setPhone("0909888999");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("admin");
            admin.setStatus("active");
            userRepository.save(admin);

            User staff = new User();
            staff.setName("Nhân Viên Lễ Tân DemoPick");
            staff.setEmail("staff@demopick.vn");
            staff.setPhone("0912345678");
            staff.setPassword(passwordEncoder.encode("staff123"));
            staff.setRole("staff");
            staff.setStatus("active");
            userRepository.save(staff);

            User customer = new User();
            customer.setName("Khách Hàng Thân Thiết");
            customer.setEmail("customer@demopick.vn");
            customer.setPhone("0901234567");
            customer.setPassword(passwordEncoder.encode("customer123"));
            customer.setRole("customer");
            customer.setStatus("active");
            userRepository.save(customer);
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
        if (categoryRepository.count() == 0) {
            log.info("Khởi tạo danh mục sản phẩm & thương hiệu...");
            Category cat1 = new Category();
            cat1.setName("Vợt Pickleball");
            cat1.setSlug("vot-pickleball");
            cat1.setDescription("Các dòng vợt thi đấu chuẩn USAPA từ Joola, Selkirk, CRBN.");
            categoryRepository.save(cat1);

            Category cat2 = new Category();
            cat2.setName("Bóng Pickleball");
            cat2.setSlug("bong-pickleball");
            cat2.setDescription("Bóng tập luyện và thi đấu chính hãng.");
            categoryRepository.save(cat2);

            Category cat3 = new Category();
            cat3.setName("Bao & Balo Đựng Vợt");
            cat3.setSlug("balo-tui-dung-vot");
            cat3.setDescription("Túi và balo thể thao thời trang cao cấp.");
            categoryRepository.save(cat3);

            Category cat4 = new Category();
            cat4.setName("Phụ Kiện Sân Đấu");
            cat4.setSlug("phu-kien-san-dau");
            cat4.setDescription("Băng quấn cán, chì trợ lực, khăn lau mồ hôi.");
            categoryRepository.save(cat4);

            Category cat5 = new Category();
            cat5.setName("Đồ Uống & Dịch Vụ POS");
            cat5.setSlug("do-uong-dich-vu-pos");
            cat5.setDescription("Nước khoáng, điện giải Pocari, Revive phục vụ tại quầy.");
            categoryRepository.save(cat5);
        }

        if (brandRepository.count() == 0) {
            Brand b1 = new Brand();
            b1.setName("Joola");
            b1.setSlug("joola");
            brandRepository.save(b1);

            Brand b2 = new Brand();
            b2.setName("Selkirk");
            b2.setSlug("selkirk");
            brandRepository.save(b2);

            Brand b3 = new Brand();
            b3.setName("Franklin");
            b3.setSlug("franklin");
            brandRepository.save(b3);

            Brand b4 = new Brand();
            b4.setName("CRBN");
            b4.setSlug("crbn");
            brandRepository.save(b4);
        }

        if (productRepository.count() == 0) {
            log.info("Khởi tạo sản phẩm mẫu cho cửa hàng...");
            Category paddleCat = categoryRepository.findBySlug("vot-pickleball").orElse(null);
            Brand joolaBrand = brandRepository.findBySlug("joola").orElse(null);

            if (paddleCat != null && joolaBrand != null) {
                Product p1 = new Product();
                p1.setName("Vợt Pickleball Joola Ben Johns Perseus CFS 16");
                p1.setSlug("vot-pickleball-joola-ben-johns-perseus-cfs-16");
                p1.setShortDescription("Dòng vợt cao cấp sở hữu mặt Carbon Friction Surface trợ lực tối đa.");
                p1.setDescription("Vợt Joola Perseus CFS 16mm đem lại khả năng kiểm soát bóng đỉnh cao và lực đánh uy lực.");
                p1.setCategoryId(paddleCat.getId());
                p1.setBrandId(joolaBrand.getId());
                p1.setBasePrice(BigDecimal.valueOf(5690000));
                p1.setStatus("active");
                p1.setIsFeatured(true);
                p1.setImages("[\"/images/pickleball_paddle_joola.jpg\"]");
                productRepository.save(p1);

                ProductVariant v1 = new ProductVariant();
                v1.setProduct(p1);
                v1.setSku("JOOLA-PERSEUS-16");
                v1.setColor("Đen / Carbon");
                v1.setWeight("230g (8.1 oz)");
                v1.setStockQty(25);
                v1.setStatus("active");
                productVariantRepository.save(v1);
            }
        }
    }
}
