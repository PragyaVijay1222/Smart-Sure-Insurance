package com.smartSure.authService.service;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import com.smartSure.authService.dto.address.AddressResponseDto;
import com.smartSure.authService.entity.Address;
import com.smartSure.authService.entity.User;
import com.smartSure.authService.exception.AddressNotFoundException;
import com.smartSure.authService.exception.UserNotFoundException;
import com.smartSure.authService.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
public class AddressQueryServiceImplTest {

    @Mock
    private UserRepository uRepo;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private AddressQueryServiceImpl addressQueryService;

    @Test
    void get_success() {
        User user = new User();
        Address address = new Address();
        user.setAddress(address);

        when(uRepo.findById(1L)).thenReturn(Optional.of(user));
        when(modelMapper.map(address, AddressResponseDto.class)).thenReturn(new AddressResponseDto());

        AddressResponseDto response = addressQueryService.get(1L);

        assertNotNull(response);
    }

    @Test
    void get_userNotFound() {
        when(uRepo.findById(1L)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> addressQueryService.get(1L));
    }

    @Test
    void get_addressNotFound() {
        User user = new User();
        user.setAddress(null);

        when(uRepo.findById(1L)).thenReturn(Optional.of(user));

        assertThrows(AddressNotFoundException.class, () -> addressQueryService.get(1L));
    }
}
