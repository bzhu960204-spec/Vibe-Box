package com.vibebox.dto;

import jakarta.validation.constraints.NotBlank;

public record NameRequest(
        @NotBlank String name
) {
}
