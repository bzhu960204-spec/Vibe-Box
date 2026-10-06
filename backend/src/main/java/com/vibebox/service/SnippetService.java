package com.vibebox.service;

import com.vibebox.domain.*;
import com.vibebox.dto.SnippetDto;
import com.vibebox.dto.SnippetFileDto;
import com.vibebox.dto.SnippetRequest;
import com.vibebox.repository.CategoryRepository;
import com.vibebox.repository.ProjectRepository;
import com.vibebox.repository.SnippetRepository;
import com.vibebox.repository.TagRepository;
import com.vibebox.web.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SnippetService {

    private final SnippetRepository snippetRepository;
    private final ProjectRepository projectRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;

    public SnippetService(SnippetRepository snippetRepository,
                          ProjectRepository projectRepository,
                          CategoryRepository categoryRepository,
                          TagRepository tagRepository) {
        this.snippetRepository = snippetRepository;
        this.projectRepository = projectRepository;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
    }

    @Transactional(readOnly = true)
    public List<SnippetDto> list(String q, Long projectId, Long categoryId, String tag) {
        String query = (q == null || q.isBlank()) ? null : q.trim();
        String tagName = (tag == null || tag.isBlank()) ? null : tag.trim();
        return snippetRepository.search(query, projectId, categoryId, tagName).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SnippetDto get(Long id) {
        return toDto(findOrThrow(id));
    }

    @Transactional
    public SnippetDto create(SnippetRequest req) {
        Snippet snippet = new Snippet();
        apply(snippet, req);
        snippet.setCreatedAt(Instant.now());
        snippet.setUpdatedAt(Instant.now());
        return toDto(snippetRepository.save(snippet));
    }

    @Transactional
    public SnippetDto update(Long id, SnippetRequest req) {
        Snippet snippet = findOrThrow(id);
        apply(snippet, req);
        snippet.setUpdatedAt(Instant.now());
        return toDto(snippetRepository.save(snippet));
    }

    @Transactional
    public void delete(Long id) {
        Snippet snippet = findOrThrow(id);
        snippetRepository.delete(snippet);
    }

    private Snippet findOrThrow(Long id) {
        return snippetRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Snippet not found: " + id));
    }

    private void apply(Snippet snippet, SnippetRequest req) {
        snippet.setTitle(req.title());
        snippet.setDescription(req.description());
        snippet.setType(parseType(req.type()));
        snippet.setEntryFile(blankToDefault(req.entryFile(), "/App.js"));
        snippet.setDependencies(blankToDefault(req.dependencies(), "{}"));
        snippet.setTemplate(blankToDefault(req.template(), "react"));
        snippet.setNotes(req.notes());
        snippet.setPromptArchive(req.promptArchive());

        snippet.setProject(resolveProject(req.projectId()));
        snippet.setCategory(resolveCategory(req.categoryId()));
        snippet.setTags(resolveTags(req.tags()));

        snippet.getFiles().clear();
        if (req.files() != null) {
            for (SnippetFileDto f : req.files()) {
                if (f.path() == null || f.path().isBlank()) {
                    continue;
                }
                SnippetFile file = new SnippetFile();
                file.setPath(f.path().trim());
                file.setCode(f.code() == null ? "" : f.code());
                snippet.addFile(file);
            }
        }
    }

    private SnippetType parseType(String type) {
        try {
            return SnippetType.valueOf(type.trim().toUpperCase());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid snippet type: " + type);
        }
    }

    private Project resolveProject(Long projectId) {
        if (projectId == null) {
            return null;
        }
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found: " + projectId));
    }

    private Category resolveCategory(Long categoryId) {
        if (categoryId == null) {
            return null;
        }
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new NotFoundException("Category not found: " + categoryId));
    }

    private Set<Tag> resolveTags(List<String> tagNames) {
        if (tagNames == null) {
            return Set.of();
        }
        return tagNames.stream()
                .map(String::trim)
                .filter(name -> !name.isBlank())
                .distinct()
                .map(name -> tagRepository.findByName(name).orElseGet(() -> {
                    Tag tag = new Tag();
                    tag.setName(name);
                    return tagRepository.save(tag);
                }))
                .collect(Collectors.toCollection(java.util.LinkedHashSet::new));
    }

    private String blankToDefault(String value, String fallback) {
        return (value == null || value.isBlank()) ? fallback : value.trim();
    }

    public SnippetDto toDto(Snippet s) {
        List<String> tags = s.getTags().stream().map(Tag::getName).collect(Collectors.toList());
        List<SnippetFileDto> files = s.getFiles().stream()
                .map(f -> new SnippetFileDto(f.getPath(), f.getCode()))
                .collect(Collectors.toList());
        return new SnippetDto(
                s.getId(),
                s.getTitle(),
                s.getDescription(),
                s.getType().name(),
                s.getProject() == null ? null : s.getProject().getId(),
                s.getProject() == null ? null : s.getProject().getName(),
                s.getCategory() == null ? null : s.getCategory().getId(),
                s.getCategory() == null ? null : s.getCategory().getName(),
                s.getEntryFile(),
                s.getDependencies(),
                s.getTemplate(),
                s.getNotes(),
                s.getPromptArchive(),
                tags,
                files,
                s.getCreatedAt(),
                s.getUpdatedAt()
        );
    }
}
