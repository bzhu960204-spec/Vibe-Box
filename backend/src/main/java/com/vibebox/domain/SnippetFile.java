package com.vibebox.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "snippet_files")
@Getter
@Setter
public class SnippetFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "snippet_id")
    @JsonIgnore
    private Snippet snippet;

    @Column(nullable = false)
    private String path;

    @Column(columnDefinition = "text")
    private String code = "";
}
