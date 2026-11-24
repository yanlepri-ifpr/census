package ifpr.edu.br.census.poll;

import ifpr.edu.br.census.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "polls", indexes = @Index(name = "idx_polls_ends_at", columnList = "ends_at"))
public class Poll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "option_a", nullable = false, length = 120)
    private String optionA;

    @Column(name = "option_b", nullable = false, length = 120)
    private String optionB;

    @Column(name = "ends_at", nullable = false)
    private Instant endsAt;

    @Column(name = "closed_at")
    private Instant closedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User creator;

    protected Poll() {
    }

    public Poll(String optionA, String optionB, Instant endsAt, User creator) {
        this.optionA = optionA;
        this.optionB = optionB;
        this.endsAt = endsAt;
        this.creator = creator;
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public String getOptionA() {
        return optionA;
    }

    public String getOptionB() {
        return optionB;
    }

    public Instant getEndsAt() {
        return endsAt;
    }

    public Instant getClosedAt() {
        return closedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public User getCreator() {
        return creator;
    }

    public boolean isClosed() {
        return closedAt != null || !endsAt.isAfter(Instant.now());
    }
}
