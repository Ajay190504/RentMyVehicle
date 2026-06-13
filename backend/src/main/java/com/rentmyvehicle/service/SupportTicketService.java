package com.rentmyvehicle.service;

import com.rentmyvehicle.exception.ResourceNotFoundException;
import com.rentmyvehicle.model.SupportTicket;
import com.rentmyvehicle.repository.SupportTicketRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class SupportTicketService {

    private final SupportTicketRepository ticketRepository;

    public SupportTicketService(SupportTicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    public SupportTicket createTicket(SupportTicket ticket) {
        if (ticket.getStatus() == null) {
            ticket.setStatus("PENDING");
        }
        return ticketRepository.save(ticket);
    }

    @Transactional(readOnly = true)
    public List<SupportTicket> getMyTickets(String email) {
        return ticketRepository.findByEmailOrderByCreatedAtDesc(email);
    }

    @Transactional(readOnly = true)
    public Page<SupportTicket> getAllTickets(String status, Pageable pageable) {
        if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
            return ticketRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase(), pageable);
        }
        return ticketRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    public SupportTicket resolveTicket(Long id, String adminResponse) {
        SupportTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Support ticket not found with id: " + id));
        
        ticket.setStatus("RESOLVED");
        ticket.setAdminResponse(adminResponse);
        ticket.setResolvedAt(LocalDateTime.now());
        
        return ticketRepository.save(ticket);
    }
}
