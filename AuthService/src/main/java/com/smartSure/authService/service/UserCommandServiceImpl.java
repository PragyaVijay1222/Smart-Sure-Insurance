package com.smartSure.authService.service;

import org.modelmapper.ModelMapper;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

import com.smartSure.authService.dto.user.UserRequestDto;
import com.smartSure.authService.dto.user.UserResponseDto;
import com.smartSure.authService.entity.User;
import com.smartSure.authService.exception.UserNotFoundException;
import com.smartSure.authService.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserCommandServiceImpl implements UserCommandService {
    
    private final UserRepository repo;
    private final ModelMapper modelMapper;
    
    @Override
    public UserResponseDto add(UserRequestDto reqDto) {
        User user = repo.findByEmail(reqDto.getEmail())
                .orElseThrow(() -> new UserNotFoundException("This email is not registered"));
        modelMapper.map(reqDto, user);
        repo.save(user);
        return modelMapper.map(user, UserResponseDto.class);
    }
    
    @Override
    @CacheEvict(value = "users", key = "#userId")
    public UserResponseDto update(UserRequestDto reqDto, Long userId) {
        User user = repo.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("This user is not present"));
        modelMapper.map(reqDto, user);
        repo.save(user);
        return modelMapper.map(user, UserResponseDto.class);
    }
    
    @Override
    @CacheEvict(value = "users", key = "#userId")
    public UserResponseDto delete(Long userId) {
        User user = repo.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("This user is not present"));
        repo.deleteById(userId);
        return modelMapper.map(user, UserResponseDto.class);
    }
}
