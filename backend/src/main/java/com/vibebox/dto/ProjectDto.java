package com.vibebox.dto;

public record ProjectDto(
        Long id,
        String name,
        String description,
        long snippetCount
) {
}
