package com.agriguid.config;

import com.agriguid.repository.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(UserRepository userRepository) {
        return username -> userRepository.findByUsername(username)
                .map(user -> org.springframework.security.core.userdetails.User
                        .withUsername(user.getUsername())
                        .password(user.getPassword())
                        .authorities("ROLE_" + user.getRole().name())
                        .disabled(!Boolean.TRUE.equals(user.getIsActive()))
                        .build())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())   // Integrates CorsConfigurationSource bean
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setContentType("application/json");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getOutputStream().println("{\"error\": \"Full authentication is required to access this resource\"}");
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setContentType("application/json");
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.getOutputStream().println("{\"error\": \"Access denied: insufficient permissions\"}");
                })
            )
            .authorizeHttpRequests(auth -> auth
                // Preflight CORS
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Auth — public
                .requestMatchers("/api/auth/login", "/api/auth/signup", "/api/auth/logout").permitAll()

                // Change password & user profile — must be authenticated
                .requestMatchers("/api/auth/change-password").authenticated()
                .requestMatchers("/api/auth/user/**").authenticated()

                // Current user endpoints
                .requestMatchers("/api/users/me").authenticated()

                // Admin endpoints — strict ADMIN role only
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/users").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/users/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/users/{id}").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasRole("ADMIN")

                // Crops — public read; write operations require ADMIN
                .requestMatchers(HttpMethod.GET, "/api/crops/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/crops/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/crops/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/crops/**").hasRole("ADMIN")

                // Experiences — authenticated user's own list
                .requestMatchers(HttpMethod.GET, "/api/experiences/my").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/experiences/**").permitAll()
                // Farmer & Worker experiences — both FARMER, WORKER, and ADMIN can create/update/delete
                .requestMatchers(HttpMethod.POST, "/api/experiences").hasAnyRole("FARMER", "WORKER", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/experiences/**").hasAnyRole("FARMER", "WORKER", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/experiences/**").hasAnyRole("FARMER", "WORKER", "ADMIN")

                // Equipment listings — public read; authenticated user's own list
                .requestMatchers(HttpMethod.GET, "/api/equipment/my").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/equipment/**").permitAll()
                // Both FARMER and WORKER can create, update, delete own equipment
                .requestMatchers(HttpMethod.POST, "/api/equipment").hasAnyRole("FARMER", "WORKER", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/equipment/**").hasAnyRole("FARMER", "WORKER", "ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/equipment/**").hasAnyRole("FARMER", "WORKER", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/equipment/**").hasAnyRole("FARMER", "WORKER", "ADMIN")

                // Worker listings — public read (except /my and /me)
                .requestMatchers(HttpMethod.GET, "/api/workers/my", "/api/workers/me").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/workers/**").permitAll()

                // Worker listings — only WORKER role can create
                .requestMatchers(HttpMethod.POST, "/api/workers").hasRole("WORKER")

                // Worker listings — WORKER or ADMIN can update/delete/deactivate/activate (ownership verified in service)
                .requestMatchers(HttpMethod.PUT, "/api/workers/**").hasAnyRole("WORKER", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/workers/**").hasAnyRole("WORKER", "ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/workers/**").hasAnyRole("WORKER", "ADMIN")

                // Health check & root — public
                .requestMatchers("/", "/health", "/api/health").permitAll()

                // Everything else — must be authenticated
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}