package com.smartSure.authService.service;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import com.smartSure.authService.dto.address.AddressRequestDto;
import com.smartSure.authService.dto.address.AddressResponseDto;
import com.smartSure.authService.entity.Address;
import com.smartSure.authService.entity.User;
import com.smartSure.authService.exception.AddressNotFoundException;
import com.smartSure.authService.exception.UserNotFoundException;
import com.smartSure.authService.repository.AddressRepository;
import com.smartSure.authService.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
public class AddressCommandServiceImplTest {

    @Mock
    private AddressRepository repo;

    @Mock
    private UserRepository uRepo;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private AddressCommandServiceImpl addressCommandService;

    @Test
    void create_success() {
        AddressRequestDto reqDto = new AddressRequestDto();
        User user = new User();
        Address address = new Address();

        when(uRepo.findById(1L)).thenReturn(Optional.of(user));
        when(modelMapper.map(reqDto, Address.class)).thenReturn(address);
        when(repo.save(address)).thenReturn(address);
        when(uRepo.save(user)).thenReturn(user);
        when(modelMapper.map(address, AddressResponseDto.class)).thenReturn(new AddressResponseDto());

        AddressResponseDto response = addressCommandService.create(reqDto, 1L);

        assertNotNull(response);
        verify(repo).save(address);
        verify(uRepo).save(user);
    }

    @Test
    void create_userNotFound() {
        AddressRequestDto reqDto = new AddressRequestDto();

        when(uRepo.findById(1L)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> addressCommandService.create(reqDto, 1L));
    }

    @Test
    void update_success() {
        AddressRequestDto reqDto = new AddressRequestDto();
        User user = new User();
        Address address = new Address();
        user.setAddress(address);

        when(uRepo.findById(1L)).thenReturn(Optional.of(user));
        doNothing().when(modelMapper).map(reqDto, address);
        when(repo.save(address)).thenReturn(address);
        when(uRepo.save(user)).thenReturn(user);
        when(modelMapper.map(address, AddressResponseDto.class)).thenReturn(new AddressResponseDto());

        AddressResponseDto response = addressCommandService.update(reqDto, 1L);

        assertNotNull(response);
        verify(repo).save(address);
    }

    @Test
    void delete_success() {
        User user = new User();
        Address address = new Address();
        address.setAddressId(101L);
        user.setAddress(address);

        when(uRepo.findById(1L)).thenReturn(Optional.of(user));
        doNothing().when(repo).deleteById(101L);
        when(uRepo.save(user)).thenReturn(user);
        when(modelMapper.map(address, AddressResponseDto.class)).thenReturn(new AddressResponseDto());

        AddressResponseDto response = addressCommandService.delete(1L);

        assertNotNull(response);
        verify(repo).deleteById(101L);
    }
}
