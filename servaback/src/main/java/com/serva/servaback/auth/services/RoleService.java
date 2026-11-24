package com.serva.servaback.auth.services;

import com.serva.servaback.auth.dtos.RoleCreate;
import com.serva.servaback.auth.models.Role;
import com.serva.servaback.auth.repositories.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RoleService {
    private final RoleRepository roleRepository;

    public RoleCreate createRole(RoleCreate role){
        Role newRole = new Role();

        newRole.setName(role.name());
        newRole.setDescription(role.description());

        roleRepository.saveAndFlush(newRole);

        return role;
    }
}
