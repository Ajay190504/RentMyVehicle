package com.rentmyvehicle.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final ExecutorService executor = Executors.newCachedThreadPool();

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(String to, String subject, String body) {
        executor.submit(() -> {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom("ajaywaghmare190504@gmail.com");
                message.setTo(to);
                message.setSubject(subject);
                message.setText(body);
                mailSender.send(message);
                System.out.println("Email sent successfully to: " + to);
            } catch (Exception e) {
                System.err.println("Failed to send email to: " + to + ". Error: " + e.getMessage());
            }
        });
    }

    public void sendRegistrationEmail(String toEmail, String name, String role) {
        String subject = "Welcome to RentMyVehicle!";
        String body = String.format(
                "Hello %s,\n\n" +
                "Thank you for registering on RentMyVehicle as a %s.\n" +
                "Your account has been successfully created. You can now log in to list your fleet or book premium vehicles.\n\n" +
                "Safe driving,\n" +
                "RentMyVehicle Team",
                name, role.toLowerCase()
        );
        sendEmail(toEmail, subject, body);
    }

    public void sendForgotPasswordEmail(String toEmail, String name) {
        String subject = "RentMyVehicle Password Reset Request";
        String body = String.format(
                "Hello %s,\n\n" +
                "We received a request to reset your password for your RentMyVehicle account.\n" +
                "You can now proceed to the reset password form on the website to complete this request.\n\n" +
                "If you did not request this, you can safely ignore this email.\n\n" +
                "Best regards,\n" +
                "RentMyVehicle Team",
                name
        );
        sendEmail(toEmail, subject, body);
    }

    public void sendSupportTicketConfirmation(String toEmail, String name, String ticketId, String ticketSubject, String messageContent) {
        String subject = "RentMyVehicle Support Ticket Reference #" + ticketId;
        String body = String.format(
                "Hello %s,\n\n" +
                "This is to confirm that we have successfully received your support ticket.\n\n" +
                "Ticket details:\n" +
                "- Ticket Reference ID: #%s\n" +
                "- Subject: %s\n" +
                "- Message: %s\n\n" +
                "Our customer support team is reviewing your query and will reply directly to this email address within 24 hours.\n\n" +
                "Best regards,\n" +
                "RentMyVehicle Team",
                name, ticketId, ticketSubject, messageContent
        );
        sendEmail(toEmail, subject, body);
    }
}
