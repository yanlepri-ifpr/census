package ifpr.edu.br.census.vote;

import ifpr.edu.br.census.common.InvalidCredentialsException;
import ifpr.edu.br.census.common.InvalidVoteOptionException;
import ifpr.edu.br.census.common.PollConflictException;
import ifpr.edu.br.census.common.PollNotFoundException;
import ifpr.edu.br.census.poll.Poll;
import ifpr.edu.br.census.poll.PollRepository;
import ifpr.edu.br.census.user.User;
import ifpr.edu.br.census.user.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VoteService {

    private final VoteRepository voteRepository;
    private final PollRepository pollRepository;
    private final UserRepository userRepository;

    public VoteService(VoteRepository voteRepository, PollRepository pollRepository, UserRepository userRepository) {
        this.voteRepository = voteRepository;
        this.pollRepository = pollRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public VoteResultResponse vote(Long pollId, VoteRequest request, String email) {
        User voter = userRepository.findByEmail(email).orElseThrow(InvalidCredentialsException::new);
        Poll poll = pollRepository.findById(pollId).orElseThrow(PollNotFoundException::new);

        if (poll.isClosed()) {
            throw new PollConflictException("Não é possível votar: a enquete está encerrada.");
        }
        if (voteRepository.existsByPollIdAndUserId(pollId, voter.getId())) {
            throw new PollConflictException("Você já votou nesta enquete.");
        }

        VoteOption option = parseOption(request.option());
        try {
            voteRepository.saveAndFlush(new Vote(poll, voter, option));
        } catch (DataIntegrityViolationException ex) {
            throw new PollConflictException("Você já votou nesta enquete.");
        }

        return VoteResultResponse.from(
            voteRepository.countByPollIdAndOption(pollId, VoteOption.A),
            voteRepository.countByPollIdAndOption(pollId, VoteOption.B)
        );
    }

    private VoteOption parseOption(String value) {
        try {
            return VoteOption.valueOf(value);
        } catch (IllegalArgumentException ex) {
            throw new InvalidVoteOptionException();
        }
    }
}
