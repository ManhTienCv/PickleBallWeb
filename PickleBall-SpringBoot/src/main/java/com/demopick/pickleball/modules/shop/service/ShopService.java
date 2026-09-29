package com.demopick.pickleball.modules.shop.service;

import com.demopick.pickleball.common.exception.ApiException;
import com.demopick.pickleball.modules.shop.entity.Brand;
import com.demopick.pickleball.modules.shop.entity.Category;
import com.demopick.pickleball.modules.shop.entity.Product;
import com.demopick.pickleball.modules.shop.repository.BrandRepository;
import com.demopick.pickleball.modules.shop.repository.CategoryRepository;
import com.demopick.pickleball.modules.shop.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ShopService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;

    public ShopService(ProductRepository productRepository, CategoryRepository categoryRepository, BrandRepository brandRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
    }

    public List<Product> getProducts(Long categoryId) {
        if (categoryId != null) {
            return productRepository.findByCategoryIdAndDeletedAtIsNull(categoryId);
        }
        return productRepository.findByStatusAndDeletedAtIsNullOrderByIdDesc("active");
    }

    public Product getProductBySlug(String slug) {
        return productRepository.findBySlugAndDeletedAtIsNull(slug)
                .orElseThrow(() -> new ApiException("Không tìm thấy sản phẩm.", HttpStatus.NOT_FOUND));
    }

    public List<Category> getCategories() {
        return categoryRepository.findByIsActiveTrueOrderBySortOrderAsc();
    }

    public List<Brand> getBrands() {
        return brandRepository.findByIsActiveTrueOrderByNameAsc();
    }
}
