package ifpr.edu.br.census.poll;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PollRepository extends JpaRepository<Poll, Long> {

    List<Poll> findAllByOrderByCreatedAtDescIdDesc();
}
