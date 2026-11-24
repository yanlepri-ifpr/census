package ifpr.edu.br.census.auth;

public record LoginResponse(String token, String tokenType, UserResponse user) {
}
