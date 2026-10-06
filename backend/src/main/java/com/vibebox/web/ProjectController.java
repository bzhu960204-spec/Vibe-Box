package com.vibebox.web;

import com.vibebox.domain.Project;
import com.vibebox.dto.ProjectDto;
import com.vibebox.dto.ProjectRequest;
import com.vibebox.repository.ProjectRepository;
import com.vibebox.repository.SnippetRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectRepository repository;
    private final SnippetRepository snippetRepository;

    public ProjectController(ProjectRepository repository, SnippetRepository snippetRepository) {
        this.repository = repository;
        this.snippetRepository = snippetRepository;
    }

    @GetMapping
    public List<ProjectDto> list() {
        return repository.findAll().stream().map(this::toDto).toList();
    }

    @GetMapping("/{id}")
    public ProjectDto get(@PathVariable Long id) {
        Project project = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Project not found: " + id));
        return toDto(project);
    }

    @PostMapping
    public ResponseEntity<ProjectDto> create(@Valid @RequestBody ProjectRequest req) {
        Project project = new Project();
        project.setName(req.name());
        project.setDescription(req.description());
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(repository.save(project)));
    }

    @PutMapping("/{id}")
    public ProjectDto update(@PathVariable Long id, @Valid @RequestBody ProjectRequest req) {
        Project project = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Project not found: " + id));
        project.setName(req.name());
        project.setDescription(req.description());
        return toDto(repository.save(project));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Project not found: " + id);
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private ProjectDto toDto(Project p) {
        return new ProjectDto(p.getId(), p.getName(), p.getDescription(),
                snippetRepository.countByProjectId(p.getId()));
    }
}
