package com.rentmyvehicle.service;

import com.rentmyvehicle.dto.AuthResponse;
import com.rentmyvehicle.dto.LoginRequest;
import com.rentmyvehicle.dto.RegisterRequest;
import com.rentmyvehicle.dto.UserDto;
import com.rentmyvehicle.exception.BadRequestException;
import com.rentmyvehicle.exception.ResourceNotFoundException;
import com.rentmyvehicle.mapper.UserMapper;
import com.rentmyvehicle.model.User;
import com.rentmyvehicle.repository.UserRepository;
import com.rentmyvehicle.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider, AuthenticationManager authenticationManager,
                       UserMapper userMapper, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.authenticationManager = authenticationManager;
        this.userMapper = userMapper;
        this.emailService = emailService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email address already in use.");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new BadRequestException("Phone number already in use.");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(request.getRole())
                .build();

        User savedUser = userRepository.save(user);
        
        // Send async registration email
        emailService.sendRegistrationEmail(savedUser.getEmail(), savedUser.getName(), savedUser.getRole().name());

        String token = tokenProvider.generateToken(savedUser);

        return AuthResponse.builder()
                .token(token)
                .user(userMapper.toDto(savedUser))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String token = tokenProvider.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .user(userMapper.toDto(user))
                .build();
    }

    public UserDto getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return userMapper.toDto(user);
    }

    public boolean checkEmailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    @Transactional
    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public void sendForgotPasswordEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        emailService.sendForgotPasswordEmail(user.getEmail(), user.getName());
    }

    @Transactional
    public UserDto updateProfile(String email, String name, String phone) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (name == null || name.trim().isEmpty()) {
            throw new BadRequestException("Name cannot be empty");
        }
        if (phone == null || phone.trim().isEmpty()) {
            throw new BadRequestException("Phone number cannot be empty");
        }

        // If phone is updated, check uniqueness
        if (!phone.equals(user.getPhone())) {
            if (userRepository.existsByPhone(phone)) {
                throw new BadRequestException("Phone number already in use by another account.");
            }
        }

        user.setName(name);
        user.setPhone(phone);
        User saved = userRepository.save(user);
        return userMapper.toDto(saved);
    }
}
