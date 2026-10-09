package br.org.senaipr.sistemaalunos.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import br.org.senaipr.sistemaalunos.dto.LoginRequest;
import br.org.senaipr.sistemaalunos.dto.LoginResponse;
import br.org.senaipr.sistemaalunos.security.JwtService;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(AuthenticationManager authenticationManager, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    /** Lança BadCredentialsException (tratada como 401) se usuário ou senha estiverem incorretos. */
    public LoginResponse autenticar(LoginRequest request) {
        Authentication autenticacao = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password()));

        UserDetails usuario = (UserDetails) autenticacao.getPrincipal();
        String token = jwtService.gerarToken(usuario);
        return new LoginResponse(token, "Bearer", jwtService.getExpiracaoMs(), usuario.getUsername());
    }
}