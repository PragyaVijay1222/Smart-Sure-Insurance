package com.smartSure.authService.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import com.smartSure.authService.dto.pagination.PageResponse;
import com.smartSure.authService.dto.user.UserResponseDto;
import com.smartSure.authService.entity.User;
import com.smartSure.authService.exception.UserNotFoundException;
import com.smartSure.authService.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
public class UserQueryServiceImplTest {

    @Mock
    private UserRepository repo;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private UserQueryServiceImpl userQueryService;

    @Test
    void get_success() {
        User user = new User();
        user.setUserId(1L);

        when(repo.findById(1L)).thenReturn(Optional.of(user));
        when(modelMapper.map(user, UserResponseDto.class)).thenReturn(new UserResponseDto());

        UserResponseDto response = userQueryService.get(1L);

        assertNotNull(response);
    }

    @Test
    void get_notFound() {
        when(repo.findById(1L)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userQueryService.get(1L));
    }

    @Test
    void getUsers_success() {
        User user = new User();
        Page<User> userPage = new PageImpl<>(Collections.singletonList(user));

        Pageable pageable = PageRequest.of(0, 5, Sort.by("id").ascending());

        when(repo.findAll(any(Pageable.class))).thenReturn(userPage);
        when(modelMapper.map(user, UserResponseDto.class)).thenReturn(new UserResponseDto());

        PageResponse<UserResponseDto> response = userQueryService.getUsers(0, 5, "id", "asc");

        assertNotNull(response);
        assertEquals(1, response.getContent().size());
    }
}
