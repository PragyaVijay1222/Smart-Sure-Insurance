package com.smartSure.authService.service;

import com.smartSure.authService.dto.address.AddressRequestDto;
import com.smartSure.authService.dto.address.AddressResponseDto;

public interface AddressCommandService {
    AddressResponseDto create(AddressRequestDto reqDto, Long userId);
    AddressResponseDto update(AddressRequestDto reqDto, Long userId);
    AddressResponseDto delete(Long userId);
}
