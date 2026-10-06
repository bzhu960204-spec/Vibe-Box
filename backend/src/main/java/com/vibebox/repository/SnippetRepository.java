package com.vibebox.repository;

import com.vibebox.domain.Snippet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SnippetRepository extends JpaRepository<Snippet, Long> {

    @Query("""
            select distinct s from Snippet s
            left join s.tags t
            where (:q is null
                   or lower(s.title) like lower(concat('%', :q, '%'))
                   or lower(s.description) like lower(concat('%', :q, '%')))
              and (:projectId is null or s.project.id = :projectId)
              and (:categoryId is null or s.category.id = :categoryId)
              and (:tag is null or lower(t.name) = lower(:tag))
            order by s.updatedAt desc
            """)
    List<Snippet> search(@Param("q") String q,
                         @Param("projectId") Long projectId,
                         @Param("categoryId") Long categoryId,
                         @Param("tag") String tag);

    long countByProjectId(Long projectId);
}
