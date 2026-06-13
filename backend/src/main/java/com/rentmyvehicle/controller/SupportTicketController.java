package com.rentmyvehicle.controller;

import com.rentmyvehicle.dto.ApiResponse;
import com.rentmyvehicle.exception.BadRequestException;
import com.rentmyvehicle.model.SupportTicket;
import com.rentmyvehicle.model.User;
import com.rentmyvehicle.repository.UserRepository;
import com.rentmyvehicle.service.EmailService;
import com.rentmyvehicle.service.SupportTicketService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class SupportTicketController {

    private final SupportTicketService ticketService;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public SupportTicketController(SupportTicketService ticketService, UserRepository userRepository, EmailService emailService) {
        this.ticketService = ticketService;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @PostMapping("/support/tickets")
    public ResponseEntity<ApiResponse<SupportTicket>> createTicket(
            @RequestBody SupportTicket ticket,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        if (userDetails != null) {
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new BadRequestException("User not found"));
            ticket.setEmail(user.getEmail());
            ticket.setName(user.getName());
            ticket.setRole(user.getRole().name());
            if (ticket.getPhone() == null) {
                ticket.setPhone(user.getPhone());
            }
        } else {
            ticket.setRole("GUEST");
            if (ticket.getEmail() == null || ticket.getName() == null) {
                throw new BadRequestException("Name and Email are required for guest support tickets.");
            }
        }

        if (ticket.getSubject() == null || ticket.getSubject().trim().isEmpty() ||
                ticket.getMessage() == null || ticket.getMessage().trim().isEmpty() ||
                ticket.getCategory() == null || ticket.getCategory().trim().isEmpty()) {
            throw new BadRequestException("Subject, category, and message are required.");
        }

        SupportTicket created = ticketService.createTicket(ticket);
        emailService.sendSupportTicketConfirmation(
                created.getEmail(),
                created.getName(),
                created.getId().toString(),
                created.getSubject(),
                created.getMessage()
        );
        return ResponseEntity.ok(ApiResponse.success("Support ticket submitted successfully", created));
    }

    @GetMapping("/support/my-tickets")
    public ResponseEntity<ApiResponse<List<SupportTicket>>> getMyTickets(
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        List<SupportTicket> tickets = ticketService.getMyTickets(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("User support tickets fetched successfully", tickets));
    }

    @GetMapping("/admin/support/tickets")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<SupportTicket>>> getAdminTickets(
            @RequestParam(required = false) String status,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<SupportTicket> tickets = ticketService.getAllTickets(status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Admin support tickets fetched successfully", tickets));
    }

    @PatchMapping("/admin/support/tickets/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SupportTicket>> resolveTicket(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String adminResponse = body.get("adminResponse");
        if (adminResponse == null || adminResponse.trim().isEmpty()) {
            throw new BadRequestException("Admin response cannot be empty when resolving a ticket.");
        }
        SupportTicket resolved = ticketService.resolveTicket(id, adminResponse);
        return ResponseEntity.ok(ApiResponse.success("Support ticket resolved successfully", resolved));
    }
}
