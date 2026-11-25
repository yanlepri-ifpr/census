package ifpr.edu.br.census.poll;

import ifpr.edu.br.census.common.InvalidCredentialsException;
import ifpr.edu.br.census.common.PollConflictException;
import ifpr.edu.br.census.common.PollForbiddenException;
import ifpr.edu.br.census.common.PollNotFoundException;
import ifpr.edu.br.census.user.User;
import ifpr.edu.br.census.user.UserRepository;
import ifpr.edu.br.census.vote.VoteRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PollService {

    private final PollRepository pollRepository;
    private final UserRepository userRepository;
    private final VoteRepository voteRepository;

    public PollService(PollRepository pollRepository, UserRepository userRepository, VoteRepository voteRepository) {
        this.pollRepository = pollRepository;
        this.userRepository = userRepository;
        this.voteRepository = voteRepository;
    }

    @Transactional
    public PollSummaryResponse create(CreatePollRequest request, String email) {
        User creator = userRepository.findByEmail(email).orElseThrow(InvalidCredentialsException::new);
        Poll poll = new Poll(request.optionA().trim(), request.optionB().trim(), request.endsAt(), creator);
        return PollSummaryResponse.from(pollRepository.save(poll), false);
    }

    @Transactional(readOnly = true)
    public List<PollSummaryResponse> list() {
        return pollRepository.findAllByOrderByCreatedAtDescIdDesc().stream()
            .map(poll -> PollSummaryResponse.from(poll, voteRepository.existsByPollId(poll.getId())))
            .toList();
    }

    @Transactional(readOnly = true)
    public PollDetailsResponse getById(Long id) {
        Poll poll = pollRepository.findById(id).orElseThrow(PollNotFoundException::new);
        return PollDetailsResponse.from(poll, voteRepository.existsByPollId(id));
    }

    @Transactional
    public PollDetailsResponse update(Long id, UpdatePollRequest request, String email) {
        Poll poll = findPollForManagement(id, email);
        poll.update(request.optionA().trim(), request.optionB().trim(), request.endsAt());
        return PollDetailsResponse.from(poll, false);
    }

    @Transactional
    public void delete(Long id, String email) {
        Poll poll = findPollForManagement(id, email);
        pollRepository.delete(poll);
    }

    @Transactional
    public PollDetailsResponse close(Long id, String email) {
        Poll poll = findPollForManagement(id, email);
        poll.close();
        return PollDetailsResponse.from(poll, false);
    }

    private Poll findPollForManagement(Long id, String email) {
        Poll poll = pollRepository.findById(id).orElseThrow(PollNotFoundException::new);
        if (!poll.getCreator().getEmail().equalsIgnoreCase(email)) {
            throw new PollForbiddenException();
        }
        if (poll.isClosed()) {
            throw new PollConflictException("Não é possível alterar: a enquete está encerrada.");
        }
        if (voteRepository.existsByPollId(id)) {
            throw new PollConflictException("Não é possível alterar: a enquete já possui votos.");
        }
        return poll;
    }
}
