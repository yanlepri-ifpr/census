package ifpr.edu.br.census.poll;

import ifpr.edu.br.census.vote.VoteOption;
import java.time.Instant;

public record PollDetailsResponse(
    Long id,
    String optionA,
    String optionB,
    Instant endsAt,
    Instant closedAt,
    Instant createdAt,
    Long createdById,
    String createdByName,
    PollStatus status,
    boolean hasVotes,
    boolean hasVoted,
    VoteOption votedOption
) {
    public static PollDetailsResponse from(
        Poll poll,
        boolean hasVotes,
        boolean hasVoted,
        VoteOption votedOption
    ) {
        return new PollDetailsResponse(
            poll.getId(),
            poll.getOptionA(),
            poll.getOptionB(),
            poll.getEndsAt(),
            poll.getClosedAt(),
            poll.getCreatedAt(),
            poll.getCreator().getId(),
            poll.getCreator().getName(),
            poll.getStatus(),
            hasVotes,
            hasVoted,
            votedOption
        );
    }
}
