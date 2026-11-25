package ifpr.edu.br.census.common;

public class PollForbiddenException extends RuntimeException {

    public PollForbiddenException() {
        super("Somente o criador pode executar esta ação.");
    }
}
