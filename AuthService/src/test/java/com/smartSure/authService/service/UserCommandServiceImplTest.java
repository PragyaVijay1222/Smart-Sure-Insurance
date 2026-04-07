package com.smartSure.authService.service;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
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

import com.smartSure.authService.dto.user.UserRequestDto;
import com.smartSure.authService.dto.user.UserResponseDto;
import com.smartSure.authService.entity.User;
import com.smartSure.authService.exception.UserNotFoundException;
import com.smartSure.authService.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
public class UserCommandServiceImplTest {

    @Mock
    private UserRepository repo;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private UserCommandServiceImpl userCommandService;

    @Test
    void add_success() {
        UserRequestDto reqDto = new UserRequestDto();
        reqDto.setEmail("test@gmail.com");
        User user = new User();
        user.setEmail("test@gmail.com");

        when(repo.findByEmail("test@gmail.com")).thenReturn(Optional.of(user));
        doNothing().when(modelMapper).map(reqDto, user);
        when(repo.save(user)).thenReturn(user);
        when(modelMapper.map(user, UserResponseDto.class)).thenReturn(new UserResponseDto());

        UserResponseDto response = userCommandService.add(reqDto);

        assertNotNull(response);
        verify(repo).save(user);
    }

    @Test
    void add_notFound() {
        UserRequestDto reqDto = new UserRequestDto();
        reqDto.setEmail("test@gmail.com");

        when(repo.findByEmail("test@gmail.com")).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userCommandService.add(reqDto));
    }

    @Test
    void update_success() {
        UserRequestDto reqDto = new UserRequestDto();
        User user = new User();
        user.setUserId(1L);

        when(repo.findById(1L)).thenReturn(Optional.of(user));
        doNothing().when(modelMapper).map(reqDto, user);
        when(repo.save(user)).thenReturn(user);
        when(modelMapper.map(user, UserResponseDto.class)).thenReturn(new UserResponseDto());

        UserResponseDto response = userCommandService.update(reqDto, 1L);

        assertNotNull(response);
        verify(repo).save(user);
    }

    @Test
    void delete_success() {
        User user = new User();
        user.setUserId(1L);

        when(repo.findById(1L)).thenReturn(Optional.of(user));
        doNothing().when(repo).deleteById(1L);
        when(modelMapper.map(user, UserResponseDto.class)).thenReturn(new UserResponseDto());

        UserResponseDto response = userCommandService.delete(1L);

        assertNotNull(response);
        verify(repo).deleteById(1L);
    }
}
