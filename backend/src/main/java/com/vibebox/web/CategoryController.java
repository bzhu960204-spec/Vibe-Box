package com.vibebox.web;

import com.vibebox.domain.Category;
import com.vibebox.dto.NameRequest;
import com.vibebox.dto.NamedDto;
import com.vibebox.repository.CategoryRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryRepository repository;

    public CategoryController(CategoryRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<NamedDto> list() {
        return repository.findAll().stream()
                .map(c -> new NamedDto(c.getId(), c.getName()))
                .toList();
    }

    @PostMapping
    public ResponseEntity<NamedDto> create(@Valid @RequestBody NameRequest req) {
        Category category = repository.findByName(req.name().trim()).orElseGet(() -> {
            Category c = new Category();
            c.setName(req.name().trim());
            return repository.save(c);
        });
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new NamedDto(category.getId(), category.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Category not found: " + id);
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
