package com.smartSure.authService.service;

import com.smartSure.authService.dto.pagination.PageResponse;
import com.smartSure.authService.dto.user.UserResponseDto;

public interface UserQueryService {
    UserResponseDto get(Long userId);
    PageResponse<UserResponseDto> getUsers(int page, int size, String sortBy, String direction);
}
