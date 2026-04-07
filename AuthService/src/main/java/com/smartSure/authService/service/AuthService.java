package com.smartSure.authService.service;

import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.smartSure.authService.dto.auth.AuthResponseDto;
import com.smartSure.authService.dto.auth.LoginRequestDto;
import com.smartSure.authService.dto.auth.RegisterRequestDto;
import com.smartSure.authService.dto.messagePayload.EmailMessage;
import com.smartSure.authService.entity.Role;
import com.smartSure.authService.entity.User;
import com.smartSure.authService.messaging.EmailPublisher;
import com.smartSure.authService.repository.UserRepository;
import com.smartSure.authService.security.JwtUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {
	
	private final UserRepository repo;
	private final PasswordEncoder passwordEncoder;
	private final JwtUtil jwtUtil;
	private final ModelMapper modelMapper;
	private final EmailPublisher emailPublisher;
	
	public String register(RegisterRequestDto request) {
		User user = modelMapper.map(request, User.class);
		user.setPassword(passwordEncoder.encode(request.getPassword()));
		Role userRole = Role.valueOf(request.getRole().toUpperCase());
		
		if (userRole == Role.ADMIN) {
			if (!isValidAdminCode(request.getAdminCode())) {
				userRole = Role.CUSTOMER; // Silently fallback to CUSTOMER
			}
		}
		user.setRole(userRole);
		
		if(repo.findByEmail(request.getEmail()).isPresent()) {
			throw new RuntimeException("Email already registered");
		}
		
		repo.save(user);
		
//		RabbitMQ
		
		emailPublisher.sendEmail(
		        new EmailMessage(
		            user.getEmail(),
		            "Welcome to SmartSure",
		            "Your account has been created successfully!"
		        )
		    );
		
		return "User registered successfully";
	}
	
	public AuthResponseDto login(LoginRequestDto request) {
		
		User user = repo.findByEmail(request.getEmail())
				.orElseThrow(() -> new RuntimeException("Student not found"));
		
		if(!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
			throw new RuntimeException("Invalid credentials");
		}
		
//		String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
		String token = jwtUtil.generateToken(user.getUserId(), user.getRole().name());
		
//		RabbitMQ
		
		emailPublisher.sendEmail(
		        new EmailMessage(
		            user.getEmail(),
		            "Login Alert",
		            "You have successfully logged in to Smart Sure."
		        )
		    );
		return new AuthResponseDto(token, user.getEmail(), user.getRole().name());
	}
	
	private boolean isValidAdminCode(String code) {
		if (code == null || code.length() != 10 || !code.matches("\\d{10}")) {
			return false;
		}

		// 1. Prefix must be "55"
		if (!code.startsWith("55")) {
			return false;
		}

		// 2. Year must be between 20 and 30
		int year = Integer.parseInt(code.substring(2, 4));
		if (year < 20 || year > 30) {
			return false;
		}

		// 3. Serial must be between 1000 and 9999
		int serial = Integer.parseInt(code.substring(4, 8));
		if (serial < 1000 || serial > 9999) {
			return false;
		}

		// 4. Check digits must be (sum of digits 1-8) mod 97
		int sum = 0;
		for (int i = 0; i < 8; i++) {
			sum += Character.getNumericValue(code.charAt(i));
		}
		int expectedCheck = sum % 97;
		int actualCheck = Integer.parseInt(code.substring(8, 10));

		return expectedCheck == actualCheck;
	}
}
