package ifpr.edu.br.census.vote;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record VoteRequest(
    @NotBlank(message = "Escolha a opção A ou B.")
    @Pattern(regexp = "[AB]", message = "Escolha a opção A ou B.")
    String option
) {
}
