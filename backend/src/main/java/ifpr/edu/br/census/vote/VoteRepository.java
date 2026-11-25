package ifpr.edu.br.census.vote;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VoteRepository extends JpaRepository<Vote, Long> {

    boolean existsByPollId(Long pollId);

    boolean existsByPollIdAndUserId(Long pollId, Long userId);

    Optional<Vote> findByPollIdAndUserId(Long pollId, Long userId);

    long countByPollIdAndOption(Long pollId, VoteOption option);
}
