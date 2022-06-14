package com.mycompany.myapp.service.impl;

import com.mycompany.myapp.domain.Category;
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
        profileRepository.save(profile);
        if (profile.getUser() == null) {
            User user = userService.getUserWithAuthorities().orElseThrow(UserNotAuthorizedException::new).addProfile(profile);
            userService.save(user);
        }
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
                if (profile.getUser() != null) {
                    existingProfile.setUser(profile.getUser());
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
        log.debug("Request to get all Profiles");
        return profileRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Profile> findAllForCurrentUser(Pageable pageable) {
        final User user = userService.getUserWithAuthorities().orElseThrow(UserNotAuthorizedException::new);
        log.debug("Request to get all Profiles for current user");
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

    @Override
    public boolean checkProfileIsLast(String userLogin) {
        final User user = userService.getUserWithAuthoritiesByLogin(userLogin).orElseThrow(UserNotAuthorizedException::new);
        log.debug("Request to get all Profiles");
        return user.getProfiles() == null || user.getProfiles().size() < 2;
    }

    @Override
    public Profile changeDefaultProfile(Profile newDefaultProfile) {
        User user = userService.findById(newDefaultProfile.getUser().getId()).orElseThrow();
        getDefaultProfile(user).setIsDefault(false);
        newDefaultProfile.setIsDefault(true);
        userService.save(user);
        return newDefaultProfile;
    }

    @Override
    public Profile getDefaultProfile(User user) {
        log.debug("Request to find root profile of User: {}", user.getId());
        Profile result = null;
        for (Profile profile : user.getProfiles()) {
            if (profile.getIsDefault()) {
                if (result == null) result = profile; else throw new RuntimeException("Найдено более одного профиля по умолчанию");
            }
        }
        if (result == null) throw new RuntimeException("Не найдено ни одного профиля по умолчанию");
        return result;
    }
}
