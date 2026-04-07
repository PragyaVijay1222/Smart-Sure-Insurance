package com.smartSure.authService.service;

import com.smartSure.authService.dto.user.UserRequestDto;
import com.smartSure.authService.dto.user.UserResponseDto;

public interface UserCommandService {
    UserResponseDto add(UserRequestDto reqDto);
    UserResponseDto update(UserRequestDto reqDto, Long userId);
    UserResponseDto delete(Long userId);
}
