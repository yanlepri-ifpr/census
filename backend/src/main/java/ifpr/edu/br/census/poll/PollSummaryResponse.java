package ifpr.edu.br.census.poll;

import java.time.Instant;

public record PollSummaryResponse(
    Long id,
    String optionA,
    String optionB,
    Instant endsAt,
    Long createdById,
    PollStatus status,
    boolean hasVotes
) {
    public static PollSummaryResponse from(Poll poll, boolean hasVotes) {
        return new PollSummaryResponse(
            poll.getId(),
            poll.getOptionA(),
            poll.getOptionB(),
            poll.getEndsAt(),
            poll.getCreator().getId(),
            poll.getStatus(),
            hasVotes
        );
    }
}
