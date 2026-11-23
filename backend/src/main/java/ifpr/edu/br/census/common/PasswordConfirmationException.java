package ifpr.edu.br.census.common;

public class PasswordConfirmationException extends RuntimeException {

    public PasswordConfirmationException() {
        super("As senhas não conferem.");
    }
}
