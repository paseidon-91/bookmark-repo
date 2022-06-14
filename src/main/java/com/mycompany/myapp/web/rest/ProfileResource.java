package com.mycompany.myapp.web.rest;

import static com.mycompany.myapp.domain.Category.DEFAULT_CATEGORY_NAME;

import com.mycompany.myapp.domain.Category;
import com.mycompany.myapp.domain.Profile;
import com.mycompany.myapp.domain.User;
import com.mycompany.myapp.repository.ProfileRepository;
import com.mycompany.myapp.service.CategoryService;
import com.mycompany.myapp.service.ProfileService;
import com.mycompany.myapp.service.UserService;
import com.mycompany.myapp.web.rest.errors.BadRequestAlertException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.hibernate.Hibernate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springdoc.api.annotations.ParameterObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.mycompany.myapp.domain.Profile}.
 */
@RestController
@RequestMapping("/api")
public class ProfileResource {

    private final Logger log = LoggerFactory.getLogger(ProfileResource.class);

    private static final String ENTITY_NAME = "profile";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ProfileService profileService;
    private final CategoryService categoryService;
    private final UserService userService;
    private final ProfileRepository profileRepository;

    public ProfileResource(
        ProfileService profileService,
        CategoryService categoryService,
        UserService userService,
        ProfileRepository profileRepository
    ) {
        this.profileService = profileService;
        this.categoryService = categoryService;
        this.userService = userService;
        this.profileRepository = profileRepository;
    }

    /**
     * {@code POST  /profiles} : Create a new profile.
     *
     * @param profile the profile to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new profile, or with status {@code 400 (Bad Request)} if the profile has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/profiles")
    public ResponseEntity<Profile> createProfile(@RequestBody Profile profile) throws URISyntaxException {
        log.debug("REST request to save Profile : {}", profile);
        if (profile.getId() != null) {
            throw new BadRequestAlertException("A new profile cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Profile result = profileService.save(profile);
        categoryService.save(new Category(DEFAULT_CATEGORY_NAME, result));
        return ResponseEntity
            .created(new URI("/api/profiles/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /profiles/:id} : Updates an existing profile.
     *
     * @param id      the id of the profile to save.
     * @param profile the profile to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated profile,
     * or with status {@code 400 (Bad Request)} if the profile is not valid,
     * or with status {@code 500 (Internal Server Error)} if the profile couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/profiles/{id}")
    public ResponseEntity<Profile> updateProfile(@PathVariable(value = "id", required = false) final Long id, @RequestBody Profile profile)
        throws URISyntaxException {
        log.debug("REST request to update Profile : {}, {}", id, profile);
        if (profile.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, profile.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!profileRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        User user = userService.findById(profile.getUser().getId()).orElseThrow();
        Profile oldDefault = profileService.getDefaultProfile(user);
        if (profile.getIsDefault() && !id.equals(oldDefault.getId())) {
            profileService.changeDefaultProfile(profile);
        } else if (!profile.getIsDefault()) {
            throw new RuntimeException("Должен быть хотя бы один профиль по умолчанию");
        }

        Profile result = profileService.update(profile);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, profile.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /profiles/:id} : Partial updates given fields of an existing profile, field will ignore if it is null
     *
     * @param id      the id of the profile to save.
     * @param profile the profile to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated profile,
     * or with status {@code 400 (Bad Request)} if the profile is not valid,
     * or with status {@code 404 (Not Found)} if the profile is not found,
     * or with status {@code 500 (Internal Server Error)} if the profile couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/profiles/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Profile> partialUpdateProfile(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody Profile profile
    ) throws URISyntaxException {
        log.debug("REST request to partial update Profile partially : {}, {}", id, profile);
        if (profile.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, profile.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!profileRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Profile oldDefault = profileService.getDefaultProfile(profile.getUser());
        if (profile.getIsDefault() && !id.equals(oldDefault.getId())) {
            profileService.changeDefaultProfile(profile);
        } else if (!profile.getIsDefault()) {
            throw new RuntimeException("Должен быть хотя бы один профиль по умолчанию");
        }

        Optional<Profile> result = profileService.partialUpdate(profile);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, profile.getId().toString())
        );
    }

    /**
     * {@code GET  /profiles} : get all the profiles.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of profiles in body.
     */
    @GetMapping("/profiles")
    public ResponseEntity<List<Profile>> getAllProfiles(
        @ParameterObject Pageable pageable,
        @RequestParam(required = false, defaultValue = "false") Boolean currentUserOnly
    ) {
        log.debug("REST request to get a page of Profiles");
        Page<Profile> page;
        if (currentUserOnly) {
            page = profileService.findAllForCurrentUser(pageable);
        } else {
            page = profileService.findAll(pageable);
        }
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /profiles/:id} : get the "id" profile.
     *
     * @param id the id of the profile to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the profile, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/profiles/{id}")
    public ResponseEntity<Profile> getProfile(@PathVariable Long id) {
        log.debug("REST request to get Profile : {}", id);
        Optional<Profile> profile = profileService.findOne(id);
        return ResponseUtil.wrapOrNotFound(profile);
    }

    /**
     * {@code GET  /profiles/default} : get default profile.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the profile, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/profiles/default")
    public ResponseEntity<Profile> getDefaultProfile() {
        log.debug("REST request to get default Profile");
        User user = userService.getUserWithAuthorities().orElseThrow();
        Profile profile = profileService.getDefaultProfile(user);
        return ResponseUtil.wrapOrNotFound(Optional.of(profile));
    }

    /**
     * {@code DELETE  /profiles/:id} : delete the "id" profile.
     *
     * @param id the id of the profile to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/profiles/{id}")
    public ResponseEntity<Void> deleteProfile(@PathVariable Long id) {
        log.debug("REST request to delete Profile : {}", id);

        Profile profile = profileService
            .findOne(id)
            .orElseThrow(() -> {
                throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
            });
        if (profile.getUser() == null) throw new BadRequestAlertException(
            "Нельзя удалить профиль без пользователя",
            ENTITY_NAME,
            "is_last"
        );
        if (profileService.checkProfileIsLast(profile.getUser().getLogin())) throw new BadRequestAlertException(
            "У пользователя должен быть хотя бы 1 профиль",
            ENTITY_NAME,
            "is_last"
        );
        if (profile.getIsDefault()) {
            Profile newDefault = profile.getUser().getProfiles().stream().filter(p -> !p.getIsDefault()).findFirst().orElseThrow();
            profileService.changeDefaultProfile(newDefault);
        }
        profileService.delete(id);

        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
