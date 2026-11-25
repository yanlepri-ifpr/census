package ifpr.edu.br.census.common;

public class InvalidVoteOptionException extends RuntimeException {

    public InvalidVoteOptionException() {
        super("Escolha a opção A ou B.");
    }
}
