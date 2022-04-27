package com.mycompany.myapp.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @Column(name = "profile_name")
    private String profileName;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "is_default")
    private Boolean isDefault;

    @OneToMany(mappedBy = "profile")
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JsonIgnoreProperties(value = { "tags", "profile", "categoru" }, allowSetters = true)
    private Set<Item> items = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

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

    public Long getUserId() {
        return this.userId;
    }

    public Profile userId(Long userId) {
        this.setUserId(userId);
        return this;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
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

    public Set<Item> getItems() {
        return this.items;
    }

    public void setItems(Set<Item> items) {
        if (this.items != null) {
            this.items.forEach(i -> i.setProfile(null));
        }
        if (items != null) {
            items.forEach(i -> i.setProfile(this));
        }
        this.items = items;
    }

    public Profile items(Set<Item> items) {
        this.setItems(items);
        return this;
    }

    public Profile addItem(Item item) {
        this.items.add(item);
        item.setProfile(this);
        return this;
    }

    public Profile removeItem(Item item) {
        this.items.remove(item);
        item.setProfile(null);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

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
            ", userId=" + getUserId() +
            ", isDefault='" + getIsDefault() + "'" +
            "}";
    }
}
