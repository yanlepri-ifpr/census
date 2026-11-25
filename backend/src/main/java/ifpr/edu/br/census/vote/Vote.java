package ifpr.edu.br.census.vote;

import ifpr.edu.br.census.poll.Poll;
import ifpr.edu.br.census.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;

@Entity
@Table(
    name = "votes",
    indexes = @Index(name = "idx_votes_poll_id", columnList = "poll_id"),
    uniqueConstraints = @UniqueConstraint(name = "uk_votes_poll_user", columnNames = {"poll_id", "user_id"})
)
public class Vote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "poll_id", nullable = false)
    private Poll poll;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "vote_option", nullable = false, length = 1)
    private VoteOption option;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected Vote() {
    }

    public Vote(Poll poll, User user, VoteOption option) {
        this.poll = poll;
        this.user = user;
        this.option = option;
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public Poll getPoll() {
        return poll;
    }

    public User getUser() {
        return user;
    }

    public VoteOption getOption() {
        return option;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
