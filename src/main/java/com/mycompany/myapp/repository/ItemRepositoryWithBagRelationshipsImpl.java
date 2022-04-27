package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Item;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import org.hibernate.annotations.QueryHints;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

/**
 * Utility repository to load bag relationships based on https://vladmihalcea.com/hibernate-multiplebagfetchexception/
 */
public class ItemRepositoryWithBagRelationshipsImpl implements ItemRepositoryWithBagRelationships {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Optional<Item> fetchBagRelationships(Optional<Item> item) {
        return item.map(this::fetchTags);
    }

    @Override
    public Page<Item> fetchBagRelationships(Page<Item> items) {
        return new PageImpl<>(fetchBagRelationships(items.getContent()), items.getPageable(), items.getTotalElements());
    }

    @Override
    public List<Item> fetchBagRelationships(List<Item> items) {
        return Optional.of(items).map(this::fetchTags).orElse(Collections.emptyList());
    }

    Item fetchTags(Item result) {
        return entityManager
            .createQuery("select item from Item item left join fetch item.tags where item is :item", Item.class)
            .setParameter("item", result)
            .setHint(QueryHints.PASS_DISTINCT_THROUGH, false)
            .getSingleResult();
    }

    List<Item> fetchTags(List<Item> items) {
        return entityManager
            .createQuery("select distinct item from Item item left join fetch item.tags where item in :items", Item.class)
            .setParameter("items", items)
            .setHint(QueryHints.PASS_DISTINCT_THROUGH, false)
            .getResultList();
    }
}
