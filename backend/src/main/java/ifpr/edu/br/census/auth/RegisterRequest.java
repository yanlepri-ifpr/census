package ifpr.edu.br.census.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank(message = "Informe seu nome.")
    @Size(max = 120, message = "O nome deve ter no máximo 120 caracteres.")
    String name,

    @NotBlank(message = "Informe seu e-mail.")
    @Email(message = "Informe um e-mail válido.")
    @Size(max = 255, message = "O e-mail deve ter no máximo 255 caracteres.")
    String email,

    @NotBlank(message = "Informe sua senha.")
    @Size(min = 8, max = 64, message = "A senha deve ter de 8 a 64 caracteres.")
    @Pattern(
        regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,64}$",
        message = "Use maiúscula, minúscula, número e símbolo."
    )
    String password,

    @NotBlank(message = "Confirme sua senha.")
    @Size(max = 64, message = "A confirmação deve ter no máximo 64 caracteres.")
    String passwordConfirmation
) {
}
