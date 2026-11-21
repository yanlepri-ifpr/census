package ifpr.edu.br.census.poll;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PollController {

    @GetMapping("/api/polls")
    public List<Object> list() {
        return List.of();
    }
}
