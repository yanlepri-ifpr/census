package ifpr.edu.br.census.poll;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public record UpdatePollRequest(
    @NotBlank(message = "Informe a opção A.")
    @Size(max = 120, message = "A opção A deve ter no máximo 120 caracteres.")
    String optionA,

    @NotBlank(message = "Informe a opção B.")
    @Size(max = 120, message = "A opção B deve ter no máximo 120 caracteres.")
    String optionB,

    @NotNull(message = "Informe a data de encerramento.")
    @Future(message = "A data de encerramento deve ser futura.")
    Instant endsAt
) {
}
