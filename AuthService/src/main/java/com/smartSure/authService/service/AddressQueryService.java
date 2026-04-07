package com.smartSure.authService.service;

import com.smartSure.authService.dto.address.AddressResponseDto;

public interface AddressQueryService {
    AddressResponseDto get(Long userId);
}
