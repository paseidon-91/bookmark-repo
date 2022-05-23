package com.mycompany.myapp.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A Tag.
 */
@Entity
@Table(name = "tag")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class Tag implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @Column(name = "tag")
    private String tag;

    @ManyToMany(mappedBy = "tags")
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JsonIgnoreProperties(value = { "tags", "category" }, allowSetters = true)
    private Set<Item> tags = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Tag id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTag() {
        return this.tag;
    }

    public Tag tag(String tag) {
        this.setTag(tag);
        return this;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }

    public Set<Item> getTags() {
        return this.tags;
    }

    public void setTags(Set<Item> items) {
        if (this.tags != null) {
            this.tags.forEach(i -> i.removeTag(this));
        }
        if (items != null) {
            items.forEach(i -> i.addTag(this));
        }
        this.tags = items;
    }

    public Tag tags(Set<Item> items) {
        this.setTags(items);
        return this;
    }

    public Tag addTag(Item item) {
        this.tags.add(item);
        item.getTags().add(this);
        return this;
    }

    public Tag removeTag(Item item) {
        this.tags.remove(item);
        item.getTags().remove(this);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Tag)) {
            return false;
        }
        return id != null && id.equals(((Tag) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Tag{" +
            "id=" + getId() +
            ", tag='" + getTag() + "'" +
            "}";
    }
}
