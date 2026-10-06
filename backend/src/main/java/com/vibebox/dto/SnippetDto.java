package com.vibebox.dto;

import java.time.Instant;
import java.util.List;

public record SnippetDto(
        Long id,
        String title,
        String description,
        String type,
        Long projectId,
        String projectName,
        Long categoryId,
        String categoryName,
        String entryFile,
        String dependencies,
        String template,
        String notes,
        String promptArchive,
        List<String> tags,
        List<SnippetFileDto> files,
        Instant createdAt,
        Instant updatedAt
) {
}
