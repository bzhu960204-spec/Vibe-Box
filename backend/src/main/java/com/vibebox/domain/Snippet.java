package com.vibebox.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "snippets")
@Getter
@Setter
public class Snippet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SnippetType type = SnippetType.COMPONENT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false)
    private String entryFile = "/App.js";

    // JSON string of npm dependencies, e.g. {"lodash":"^4.17.21"}
    @Column(columnDefinition = "text")
    private String dependencies = "{}";

    @Column(nullable = false)
    private String template = "react";

    @Column(columnDefinition = "text")
    private String notes;

    @Column(columnDefinition = "text")
    private String promptArchive;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "snippet_tags",
            joinColumns = @JoinColumn(name = "snippet_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new LinkedHashSet<>();

    @OneToMany(mappedBy = "snippet", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<SnippetFile> files = new ArrayList<>();

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    public void addFile(SnippetFile file) {
        file.setSnippet(this);
        this.files.add(file);
    }
}
