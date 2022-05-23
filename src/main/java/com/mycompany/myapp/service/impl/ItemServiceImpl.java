package com.mycompany.myapp.service.impl;

import com.mycompany.myapp.domain.Category;
import com.mycompany.myapp.domain.Item;
import com.mycompany.myapp.domain.Profile;
import com.mycompany.myapp.repository.ItemRepository;
import com.mycompany.myapp.service.ItemService;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link Item}.
 */
@Service
@Transactional
public class ItemServiceImpl implements ItemService {

    private final Logger log = LoggerFactory.getLogger(ItemServiceImpl.class);

    private final ItemRepository itemRepository;

    public ItemServiceImpl(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    @Override
    public Item save(Item item) {
        log.debug("Request to save Item : {}", item);
        return itemRepository.save(item);
    }

    @Override
    public Item update(Item item) {
        log.debug("Request to save Item : {}", item);
        return itemRepository.save(item);
    }

    @Override
    public Optional<Item> partialUpdate(Item item) {
        log.debug("Request to partially update Item : {}", item);

        return itemRepository
            .findById(item.getId())
            .map(existingItem -> {
                if (item.getTitle() != null) {
                    existingItem.setTitle(item.getTitle());
                }
                if (item.getDescription() != null) {
                    existingItem.setDescription(item.getDescription());
                }
                if (item.getType() != null) {
                    existingItem.setType(item.getType());
                }
                if (item.getContent() != null) {
                    existingItem.setContent(item.getContent());
                }

                return existingItem;
            })
            .map(itemRepository::save);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Item> findAll(Pageable pageable) {
        log.debug("Request to get all Items");
        return itemRepository.findAll(pageable);
    }

    @Override
    public Page<Item> findByParams(Pageable pageable, Profile profile, Category category, String searchText) {
        log.debug("Request to get filtered Items collection");
        return itemRepository.findByParams(pageable, profile, category, searchText);
    }

    public Page<Item> findAllWithEagerRelationships(Pageable pageable) {
        return itemRepository.findAllWithEagerRelationships(pageable);
    }

    @Override
    public Page<Item> findByParamsWithEagerRelationships(Pageable pageable, Profile profile, Category category, String searchText) {
        return itemRepository.findByParamsWithEagerRelationships(pageable, profile, category, searchText);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Item> findOne(Long id) {
        log.debug("Request to get Item : {}", id);
        return itemRepository.findOneWithEagerRelationships(id);
    }

    @Override
    public void delete(Long id) {
        log.debug("Request to delete Item : {}", id);
        itemRepository.deleteById(id);
    }
}
