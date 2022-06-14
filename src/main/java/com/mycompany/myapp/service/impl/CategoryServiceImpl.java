package com.mycompany.myapp.service.impl;

import com.mycompany.myapp.domain.Category;
import com.mycompany.myapp.domain.Profile;
import com.mycompany.myapp.repository.CategoryRepository;
import com.mycompany.myapp.service.CategoryService;
import com.mycompany.myapp.web.rest.errors.BadRequestAlertException;
import java.util.Optional;
import java.util.Set;
import org.hibernate.Hibernate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link Category}.
 */
@Service
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final Logger log = LoggerFactory.getLogger(CategoryServiceImpl.class);

    private final CategoryRepository categoryRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public Category save(Category category) {
        log.debug("Request to save Category : {}", category);
        return categoryRepository.save(category);
    }

    @Override
    public Category update(Category category) {
        log.debug("Request to save Category : {}", category);
        // TODO Сделать проверку цикличной
        if (category.getParent() != null && category.getId().equals(category.getParent().getId())) throw new BadRequestAlertException(
            "Неверно указана родительская категория",
            "Категория",
            "category_parent_ex"
        );
        return categoryRepository.save(category);
    }

    @Override
    public Optional<Category> partialUpdate(Category category) {
        log.debug("Request to partially update Category : {}", category);

        return categoryRepository
            .findById(category.getId())
            .map(existingCategory -> {
                if (category.getCategoryName() != null) {
                    existingCategory.setCategoryName(category.getCategoryName());
                }

                return existingCategory;
            })
            .map(categoryRepository::save);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Category> findAll(Pageable pageable) {
        log.debug("Request to get all Categories");
        return categoryRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Category> findOne(Long id) {
        log.debug("Request to get Category : {}", id);
        return categoryRepository.findById(id);
    }

    @Override
    public void delete(Long id) {
        log.debug("Request to delete Category : {}", id);
        categoryRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Category getRootCategory(Profile profile) {
        log.debug("Request to find root category in Profile: {}", profile.getId());
        Category result = null;
        Hibernate.initialize(profile);
        for (Category category : profile.getCategories()) {
            if (category.getParent() == null) {
                if (result == null) result = category; else throw new RuntimeException("Найдено более одной корневой категории");
            }
        }
        return result;
    }

    @Override
    public Set<Category> getListOfChildren(Category category, Set<Category> result) {
        if (category == null) return null;
        result.add(category);
        findOne(category.getId()).orElseThrow();
        for (Category c : categoryRepository.findAllByParent(category)) {
            getListOfChildren(c, result);
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Category> findByProfiles(Pageable pageable, Set<Profile> profiles) {
        log.debug("Request to get all Categories for profiles");
        return categoryRepository.findAllByProfileIn(pageable, profiles);
    }
}
