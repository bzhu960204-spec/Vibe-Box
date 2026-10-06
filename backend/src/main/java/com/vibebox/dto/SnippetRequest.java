package com.vibebox.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record SnippetRequest(
        @NotBlank String title,
        String description,
        @NotNull String type,
        Long projectId,
        Long categoryId,
        String entryFile,
        String dependencies,
        String template,
        String notes,
        String promptArchive,
        List<String> tags,
        @Valid List<SnippetFileDto> files
) {
}
