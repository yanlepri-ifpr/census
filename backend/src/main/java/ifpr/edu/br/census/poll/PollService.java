package ifpr.edu.br.census.poll;

import ifpr.edu.br.census.common.InvalidCredentialsException;
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
    public PollResponse create(CreatePollRequest request, String email) {
        User creator = userRepository.findByEmail(email).orElseThrow(InvalidCredentialsException::new);
        Poll poll = new Poll(request.optionA().trim(), request.optionB().trim(), request.endsAt(), creator);
        return PollResponse.from(pollRepository.save(poll));
    }

    @Transactional(readOnly = true)
    public List<PollResponse> list() {
        return pollRepository.findAllByOrderByCreatedAtDescIdDesc().stream()
            .map(PollResponse::from)
            .toList();
    }
}
