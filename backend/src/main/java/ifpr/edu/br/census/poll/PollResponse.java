package ifpr.edu.br.census.poll;

import java.time.Instant;

public record PollResponse(
    Long id,
    String optionA,
    String optionB,
    Instant endsAt,
    Instant closedAt,
    Instant createdAt,
    Long createdById,
    String createdByName,
    PollStatus status
) {
    public static PollResponse from(Poll poll) {
        return new PollResponse(
            poll.getId(),
            poll.getOptionA(),
            poll.getOptionB(),
            poll.getEndsAt(),
            poll.getClosedAt(),
            poll.getCreatedAt(),
            poll.getCreator().getId(),
            poll.getCreator().getName(),
            poll.isClosed() ? PollStatus.CLOSED : PollStatus.OPEN
        );
    }
}
