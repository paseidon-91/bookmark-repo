package com.mycompany.myapp.service.impl;

import com.mycompany.myapp.domain.Profile;
import com.mycompany.myapp.domain.User;
import com.mycompany.myapp.repository.ProfileRepository;
import com.mycompany.myapp.security.UserNotAuthorizedException;
import com.mycompany.myapp.service.ProfileService;
import com.mycompany.myapp.service.UserService;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link Profile}.
 */
@Service
@Transactional
public class ProfileServiceImpl implements ProfileService {

    private final Logger log = LoggerFactory.getLogger(ProfileServiceImpl.class);

    private final ProfileRepository profileRepository;
    private final UserService userService;

    public ProfileServiceImpl(ProfileRepository profileRepository, UserService userService) {
        this.profileRepository = profileRepository;
        this.userService = userService;
    }

    @Override
    public Profile save(Profile profile) {
        log.debug("Request to save Profile : {}", profile);
        return profileRepository.save(profile);
    }

    @Override
    public Profile update(Profile profile) {
        log.debug("Request to save Profile : {}", profile);
        return profileRepository.save(profile);
    }

    @Override
    public Optional<Profile> partialUpdate(Profile profile) {
        log.debug("Request to partially update Profile : {}", profile);

        return profileRepository
            .findById(profile.getId())
            .map(existingProfile -> {
                if (profile.getProfileName() != null) {
                    existingProfile.setProfileName(profile.getProfileName());
                }
                if (profile.getUserId() != null) {
                    existingProfile.setUserId(profile.getUserId());
                }
                if (profile.getIsDefault() != null) {
                    existingProfile.setIsDefault(profile.getIsDefault());
                }

                return existingProfile;
            })
            .map(profileRepository::save);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Profile> findAll(Pageable pageable) {
        final User user = userService.getUserWithAuthorities().orElseThrow(UserNotAuthorizedException::new);
        log.debug("Request to get all Profiles");
        // TODO предварительно проверь роль юзера. Возможно, стоит вернуть лишь профили текущего юзера
        return profileRepository.findAllByUserId(pageable, user.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Profile> findOne(Long id) {
        log.debug("Request to get Profile : {}", id);
        return profileRepository.findById(id);
    }

    @Override
    public void delete(Long id) {
        log.debug("Request to delete Profile : {}", id);
        profileRepository.deleteById(id);
    }
}
