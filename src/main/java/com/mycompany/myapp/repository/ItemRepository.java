package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Category;
import com.mycompany.myapp.domain.Item;
import com.mycompany.myapp.domain.Profile;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Item entity.
 */
@Repository
public interface ItemRepository extends ItemRepositoryWithBagRelationships, JpaRepository<Item, Long> {
    default Optional<Item> findOneWithEagerRelationships(Long id) {
        return this.fetchBagRelationships(this.findById(id));
    }

    default List<Item> findAllWithEagerRelationships() {
        return this.fetchBagRelationships(this.findAll());
    }

    default Page<Item> findAllWithEagerRelationships(Pageable pageable) {
        return this.fetchBagRelationships(this.findAll(pageable));
    }

    // todo сделать поиск не только по Title но и в Tags и Description
    @Query(
        "select i from Item i " +
        "where (:profile is null or :profile is not null and i.profile = :profile) " +
        "and (:category is null or :category is not null and i.categoru = :category) " +
        "and lower(i.title) like lower(concat('%', :searchText,'%'))"
    )
    Page<Item> findByParams(
        Pageable pageable,
        @Param("profile") Profile profile,
        @Param("category") Category category,
        @Param("searchText") String searchText
    );

    // todo сделать поиск не только по Title но и в Tags и Description
    default Page<Item> findByParamsWithEagerRelationships(Pageable pageable, Profile profile, Category category, String searchText) {
        return this.fetchBagRelationships(this.findByParams(pageable, profile, category, searchText));
    }
}