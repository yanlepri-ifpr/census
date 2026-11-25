package ifpr.edu.br.census.poll;

import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/polls")
public class PollController {

    private final PollService pollService;

    public PollController(PollService pollService) {
        this.pollService = pollService;
    }

    @GetMapping
    public List<PollSummaryResponse> list() {
        return pollService.list();
    }

    @GetMapping("/{id}")
    public PollDetailsResponse getById(@PathVariable Long id) {
        return pollService.getById(id);
    }

    @PostMapping
    public ResponseEntity<PollSummaryResponse> create(
        @Valid @RequestBody CreatePollRequest request,
        Principal principal
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pollService.create(request, principal.getName()));
    }

    @PutMapping("/{id}")
    public PollDetailsResponse update(
        @PathVariable Long id,
        @Valid @RequestBody UpdatePollRequest request,
        Principal principal
    ) {
        return pollService.update(id, request, principal.getName());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Principal principal) {
        pollService.delete(id, principal.getName());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/close")
    public PollDetailsResponse close(@PathVariable Long id, Principal principal) {
        return pollService.close(id, principal.getName());
    }
}
