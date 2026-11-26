package ifpr.edu.br.census.vote;

import java.security.Principal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/polls/{pollId}/results")
public class ResultsController {

    private final VoteService voteService;

    public ResultsController(VoteService voteService) {
        this.voteService = voteService;
    }

    @GetMapping
    public VoteResultResponse results(@PathVariable Long pollId, Principal principal) {
        String email = principal == null ? null : principal.getName();
        return voteService.results(pollId, email);
    }
}
