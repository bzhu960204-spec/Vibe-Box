package com.vibebox.web;

import com.vibebox.dto.SnippetDto;
import com.vibebox.dto.SnippetRequest;
import com.vibebox.service.SnippetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/snippets")
public class SnippetController {

    private final SnippetService service;

    public SnippetController(SnippetService service) {
        this.service = service;
    }

    @GetMapping
    public List<SnippetDto> list(@RequestParam(required = false) String q,
                                @RequestParam(required = false) Long projectId,
                                @RequestParam(required = false) Long categoryId,
                                @RequestParam(required = false) String tag) {
        return service.list(q, projectId, categoryId, tag);
    }

    @GetMapping("/{id}")
    public SnippetDto get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    public ResponseEntity<SnippetDto> create(@Valid @RequestBody SnippetRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @PutMapping("/{id}")
    public SnippetDto update(@PathVariable Long id, @Valid @RequestBody SnippetRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
