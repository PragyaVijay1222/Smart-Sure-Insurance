package com.smartSure.authService.service;

import org.modelmapper.ModelMapper;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.smartSure.authService.dto.address.AddressResponseDto;
import com.smartSure.authService.entity.Address;
import com.smartSure.authService.entity.User;
import com.smartSure.authService.exception.AddressNotFoundException;
import com.smartSure.authService.exception.UserNotFoundException;
import com.smartSure.authService.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AddressQueryServiceImpl implements AddressQueryService {
    
    private final UserRepository uRepo;
    private final ModelMapper modelMapper;
    
    @Override
    @Cacheable(value = "address", key = "#userId")
    public AddressResponseDto get(Long userId) {
        User user = uRepo.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User does not exists"));
        Address address = user.getAddress();
        
        if(address == null) throw new AddressNotFoundException("This user does not have any address set yet");
        
        return modelMapper.map(address, AddressResponseDto.class);
    }
}
