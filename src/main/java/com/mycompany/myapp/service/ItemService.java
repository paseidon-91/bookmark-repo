package com.mycompany.myapp.service;

import com.mycompany.myapp.domain.Category;
import com.mycompany.myapp.domain.Item;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service Interface for managing {@link Item}.
 */
public interface ItemService {
    /**
     * Save a item.
     *
     * @param item the entity to save.
     * @return the persisted entity.
     */
    Item save(Item item);

    /**
     * Updates a item.
     *
     * @param item the entity to update.
     * @return the persisted entity.
     */
    Item update(Item item);

    /**
     * Partially updates a item.
     *
     * @param item the entity to update partially.
     * @return the persisted entity.
     */
    Optional<Item> partialUpdate(Item item);

    /**
     * Get all the items.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<Item> findAll(Pageable pageable);

    /**
     * Get filtered collection of items.
     *
     * @param pageable   the pagination information.
     * @param category   the category information
     * @param searchText part of string for search in title/description/tags of bookmarks
     * @return the list of entities.
     */
    Page<Item> findByParams(Pageable pageable, Set<Category> categories, String searchText);

    /**
     * Get all the items with eager load of many-to-many relationships.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<Item> findAllWithEagerRelationships(Pageable pageable);

    /**
     * Get filtered collection of items with eager load of many-to-many relationships.
     *
     * @param pageable   the pagination information.
     * @param category   the category information
     * @param searchText part of string for search in title/description/tags of bookmarks
     * @return the list of entities.
     */
    Page<Item> findByParamsWithEagerRelationships(Pageable pageable, Set<Category> categories, String searchText);

    /**
     * Get the "id" item.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<Item> findOne(Long id);

    /**
     * Delete the "id" item.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
