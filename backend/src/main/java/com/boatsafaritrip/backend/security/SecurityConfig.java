package com.boatsafaritrip.backend.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
                        .requestMatchers("/api/auth/register-staff").hasRole("STAFF")
                        .requestMatchers("/api/dashboard/**").hasAnyRole("CUSTOMER", "STAFF")
                        .requestMatchers(HttpMethod.GET, "/api/packages/**").hasAnyRole("CUSTOMER", "STAFF")
                        .requestMatchers("/api/packages/**").hasRole("STAFF")
                        .requestMatchers(HttpMethod.GET, "/api/notifications/**").hasAnyRole("CUSTOMER", "STAFF")
                        .requestMatchers(HttpMethod.PUT, "/api/notifications/*/read").hasAnyRole("CUSTOMER", "STAFF")
                        .requestMatchers("/api/packages/**", "/api/boats/**", "/api/staff/**",
                                "/api/assignments/**", "/api/reports/**", "/api/notifications/**",
                                "/api/inspections/**", "/api/equipment/**", "/api/equipment-types/**").hasRole("STAFF")
                        .requestMatchers(HttpMethod.DELETE, "/api/feedback/**").hasRole("STAFF")
                        .requestMatchers("/api/bookings/**", "/api/payments/**", "/api/dashboard/**", "/api/feedback/**").hasAnyRole("CUSTOMER", "STAFF")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}