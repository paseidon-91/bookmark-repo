package com.mycompany.myapp.service;

import com.mycompany.myapp.domain.Profile;
import com.mycompany.myapp.domain.User;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service Interface for managing {@link Profile}.
 */
public interface ProfileService {
    /**
     * Save a profile.
     *
     * @param profile the entity to save.
     * @return the persisted entity.
     */
    Profile save(Profile profile);

    /**
     * Updates a profile.
     *
     * @param profile the entity to update.
     * @return the persisted entity.
     */
    Profile update(Profile profile);

    /**
     * Partially updates a profile.
     *
     * @param profile the entity to update partially.
     * @return the persisted entity.
     */
    Optional<Profile> partialUpdate(Profile profile);

    /**
     * Get all the profiles.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<Profile> findAll(Pageable pageable);

    /**
     * Get all the profiles for current user.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<Profile> findAllForCurrentUser(Pageable pageable);

    /**
     * Get the "id" profile.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<Profile> findOne(Long id);

    /**
     * Delete the "id" profile.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);

    /**
     * Check existing another profiles for current user
     * @return
     */
    boolean checkProfileIsLast(String userLogin);

    /**
     * Check existing another profiles for current user
     * @return
     */
    Profile changeDefaultProfile(Profile newDefaultProfile);

    Profile getDefaultProfile(User user);
}
