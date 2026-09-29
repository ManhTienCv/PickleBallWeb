package com.demopick.pickleball.modules.order.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/shipping")
public class ShippingController {

    @Value("${ghn.api.url:https://online-gateway.ghn.vn/shiip/public-api/v2}")
    private String ghnApiUrl;

    @Value("${ghn.api.token:}")
    private String ghnApiToken;

    @GetMapping("/provinces")
    public ResponseEntity<Map<String, Object>> getProvinces() {
        List<Map<String, Object>> list = new ArrayList<>();
        list.add(Map.of("ProvinceID", 201, "ProvinceName", "Hà Nội", "Code", "HN"));
        list.add(Map.of("ProvinceID", 202, "ProvinceName", "TP. Hồ Chí Minh", "Code", "HCM"));
        list.add(Map.of("ProvinceID", 203, "ProvinceName", "Đà Nẵng", "Code", "DN"));
        list.add(Map.of("ProvinceID", 204, "ProvinceName", "Hải Phòng", "Code", "HP"));
        list.add(Map.of("ProvinceID", 205, "ProvinceName", "Cần Thơ", "Code", "CT"));
        list.add(Map.of("ProvinceID", 206, "ProvinceName", "Bình Dương", "Code", "BD"));
        list.add(Map.of("ProvinceID", 207, "ProvinceName", "Đồng Nai", "Code", "DNAI"));
        list.add(Map.of("ProvinceID", 208, "ProvinceName", "Quảng Ninh", "Code", "QN"));

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("data", list);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/districts")
    public ResponseEntity<Map<String, Object>> getDistricts(@RequestParam(value = "province_id", defaultValue = "201") Integer provinceId) {
        List<Map<String, Object>> list = new ArrayList<>();
        if (provinceId == 201) { // Hà Nội
            list.add(Map.of("DistrictID", 1485, "DistrictName", "Quận Cầu Giấy", "Code", "1485"));
            list.add(Map.of("DistrictID", 1482, "DistrictName", "Quận Ba Đình", "Code", "1482"));
            list.add(Map.of("DistrictID", 1484, "DistrictName", "Quận Đống Đa", "Code", "1484"));
            list.add(Map.of("DistrictID", 1486, "DistrictName", "Quận Hoàn Kiếm", "Code", "1486"));
            list.add(Map.of("DistrictID", 1488, "DistrictName", "Quận Nam Từ Liêm", "Code", "1488"));
            list.add(Map.of("DistrictID", 1489, "DistrictName", "Quận Bắc Từ Liêm", "Code", "1489"));
        } else {
            list.add(Map.of("DistrictID", 1442, "DistrictName", "Quận 1", "Code", "1442"));
            list.add(Map.of("DistrictID", 1443, "DistrictName", "Quận 3", "Code", "1443"));
            list.add(Map.of("DistrictID", 1444, "DistrictName", "Quận 7", "Code", "1444"));
        }

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("data", list);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/wards")
    public ResponseEntity<Map<String, Object>> getWards(@RequestParam(value = "district_id", defaultValue = "1485") Integer districtId) {
        List<Map<String, Object>> list = new ArrayList<>();
        list.add(Map.of("WardCode", "1A0607", "WardName", "Phường Dịch Vọng"));
        list.add(Map.of("WardCode", "1A0608", "WardName", "Phường Dịch Vọng Hậu"));
        list.add(Map.of("WardCode", "1A0609", "WardName", "Phường Quan Hoa"));
        list.add(Map.of("WardCode", "1A0610", "WardName", "Phường Yên Hòa"));
        list.add(Map.of("WardCode", "1A0611", "WardName", "Phường Trung Hòa"));

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("data", list);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/calculate-fee")
    public ResponseEntity<Map<String, Object>> calculateFee(@RequestBody(required = false) Map<String, Object> payload) {
        Map<String, Object> data = new HashMap<>();
        data.put("shippingFee", 30000);
        data.put("expectedDeliveryTime", "1 - 2 ngày (GHN Express)");

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("data", data);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/tracking/{code}")
    public ResponseEntity<Map<String, Object>> tracking(@PathVariable String code) {
        List<Map<String, Object>> timeline = new ArrayList<>();
        timeline.add(Map.of(
                "status", "picked_up",
                "title", "Đã lấy hàng",
                "time", "Hôm nay, 08:30",
                "location", "Bưu cục GHN Cầu Giấy, Hà Nội",
                "description", "Nhân viên GHN Express đã nhận kiện hàng thể thao Pickleball."
        ));
        timeline.add(Map.of(
                "status", "sorting",
                "title", "Đang phân loại",
                "time", "Hôm nay, 11:45",
                "location", "Kho Phân Loại GHN Mê Linh SOC",
                "description", "Kiện hàng đang được trung chuyển tới bưu cục giao."
        ));
        timeline.add(Map.of(
                "status", "delivering",
                "title", "Đang giao hàng",
                "time", "Hôm nay, 14:15",
                "location", "Bưu cục phát Hà Nội",
                "description", "Shipper GHN đang trên đường giao kiện hàng tới cửa nhà bạn."
        ));

        Map<String, Object> data = new HashMap<>();
        data.put("carrier", "GHN Express");
        data.put("trackingNumber", code);
        data.put("currentStatus", "delivering");
        data.put("timeline", timeline);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("data", data);
        return ResponseEntity.ok(res);
    }
}
