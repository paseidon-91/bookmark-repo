package com.mycompany.myapp.domain;

import com.fasterxml.jackson.annotation.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A Profile.
 */
@Entity
@Table(name = "profile")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class Profile implements Serializable {

    public static String DEFAULT_PROFILE_NAME = "Default";

    private static final long serialVersionUID = 1L;

    public Profile() {}

    public Profile(String profileName, Boolean isDefault) {
        this.profileName = profileName;
        this.isDefault = isDefault;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @Column(name = "profile_name")
    private String profileName;

    @Column(name = "is_default")
    private Boolean isDefault;

    @OneToMany(mappedBy = "profile")
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JsonIgnoreProperties(value = { "items", "parent", "profile" }, allowSetters = true)
    private Set<Category> categories = new HashSet<>();

    @ManyToOne
    @JsonIgnoreProperties(value = { "profiles", "authorities", "persistentTokens" }, allowSetters = true)
    private User user;

    public Long getId() {
        return this.id;
    }

    public Profile id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getProfileName() {
        return this.profileName;
    }

    public Profile profileName(String profileName) {
        this.setProfileName(profileName);
        return this;
    }

    public void setProfileName(String profileName) {
        this.profileName = profileName;
    }

    public Profile setProfileUser(User user) {
        this.setUser(user);
        return this;
    }

    public Boolean getIsDefault() {
        return this.isDefault;
    }

    public Profile isDefault(Boolean isDefault) {
        this.setIsDefault(isDefault);
        return this;
    }

    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }

    public Set<Category> getCategories() {
        return this.categories;
    }

    public void setCategories(Set<Category> categories) {
        if (this.categories != null) {
            this.categories.forEach(i -> i.setProfile(null));
        }
        if (categories != null) {
            categories.forEach(i -> i.setProfile(this));
        }
        this.categories = categories;
    }

    public Profile categories(Set<Category> categories) {
        this.setCategories(categories);
        return this;
    }

    public Profile addCategory(Category category) {
        this.categories.add(category);
        category.setProfile(this);
        return this;
    }

    public Profile removeCategory(Category category) {
        this.categories.remove(category);
        category.setProfile(null);
        return this;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Profile)) {
            return false;
        }
        return id != null && id.equals(((Profile) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Profile{" +
            "id=" + getId() +
            ", profileName='" + getProfileName() + "'" +
            ", userId=" + getUser() +
            ", isDefault='" + getIsDefault() + "'" +
            "}";
    }
}
