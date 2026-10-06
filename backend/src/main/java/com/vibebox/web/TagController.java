package com.vibebox.web;

import com.vibebox.domain.Tag;
import com.vibebox.dto.NameRequest;
import com.vibebox.dto.NamedDto;
import com.vibebox.repository.TagRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
public class TagController {

    private final TagRepository repository;

    public TagController(TagRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<NamedDto> list() {
        return repository.findAll().stream()
                .map(t -> new NamedDto(t.getId(), t.getName()))
                .toList();
    }

    @PostMapping
    public ResponseEntity<NamedDto> create(@Valid @RequestBody NameRequest req) {
        Tag tag = repository.findByName(req.name().trim()).orElseGet(() -> {
            Tag t = new Tag();
            t.setName(req.name().trim());
            return repository.save(t);
        });
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new NamedDto(tag.getId(), tag.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Tag not found: " + id);
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
