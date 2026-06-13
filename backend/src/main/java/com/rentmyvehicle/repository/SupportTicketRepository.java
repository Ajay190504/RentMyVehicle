package com.rentmyvehicle.repository;

import com.rentmyvehicle.model.SupportTicket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    List<SupportTicket> findByEmailOrderByCreatedAtDesc(String email);
    Page<SupportTicket> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<SupportTicket> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
}
