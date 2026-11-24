package ifpr.edu.br.census.common;

public class PollNotFoundException extends RuntimeException {

    public PollNotFoundException() {
        super("Enquete não encontrada.");
    }
}
