package ifpr.edu.br.census.poll;

import ifpr.edu.br.census.common.InvalidCredentialsException;
import ifpr.edu.br.census.common.PollNotFoundException;
import ifpr.edu.br.census.user.User;
import ifpr.edu.br.census.user.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PollService {

    private final PollRepository pollRepository;
    private final UserRepository userRepository;

    public PollService(PollRepository pollRepository, UserRepository userRepository) {
        this.pollRepository = pollRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public PollSummaryResponse create(CreatePollRequest request, String email) {
        User creator = userRepository.findByEmail(email).orElseThrow(InvalidCredentialsException::new);
        Poll poll = new Poll(request.optionA().trim(), request.optionB().trim(), request.endsAt(), creator);
        return PollSummaryResponse.from(pollRepository.save(poll));
    }

    @Transactional(readOnly = true)
    public List<PollSummaryResponse> list() {
        return pollRepository.findAllByOrderByCreatedAtDescIdDesc().stream()
            .map(PollSummaryResponse::from)
            .toList();
    }

    @Transactional(readOnly = true)
    public PollDetailsResponse getById(Long id) {
        Poll poll = pollRepository.findById(id).orElseThrow(PollNotFoundException::new);
        return PollDetailsResponse.from(poll);
    }
}
