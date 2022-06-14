package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Category;
import com.mycompany.myapp.domain.Item;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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

    @Query(
        nativeQuery = true,
        value = "select * from bookmark.item i " +
        "where i.category_id in :categories  " +
        "and (lower(i.title) like lower(concat('%', :searchText,'%')) " +
        "or exists(select null from bookmark.tag t join bookmark.rel_item_tag it on t.id = it.tag_id " +
        "       where it.item_id = i.id and lower(t.tag) like lower(concat('%', :searchText,'%')))) "
    )
    Page<Item> findByParams(Pageable pageable, @Param("categories") Set<Category> categories, @Param("searchText") String searchText);

    @Query(
        nativeQuery = true,
        value = "select * from bookmark.item i " +
        "where lower(i.title) like lower(concat('%', :searchText,'%')) " +
        "or exists(select null from bookmark.tag t join bookmark.rel_item_tag it on t.id = it.tag_id " +
        "       where it.item_id = i.id and lower(t.tag) like lower(concat('%', :searchText,'%')))"
    )
    Page<Item> findByParams(Pageable pageable, @Param("searchText") String searchText);

    default Page<Item> findByParamsWithEagerRelationships(Pageable pageable, Set<Category> categories, String searchText) {
        return this.fetchBagRelationships(this.findByParams(pageable, categories, searchText));
    }

    default Page<Item> findByParamsWithEagerRelationships(Pageable pageable, String searchText) {
        return this.fetchBagRelationships(this.findByParams(pageable, searchText));
    }
}
