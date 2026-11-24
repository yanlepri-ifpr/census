package ifpr.edu.br.census.poll;

import java.time.Instant;

public record PollSummaryResponse(
    Long id,
    String optionA,
    String optionB,
    Instant endsAt,
    PollStatus status
) {
    public static PollSummaryResponse from(Poll poll) {
        return new PollSummaryResponse(
            poll.getId(),
            poll.getOptionA(),
            poll.getOptionB(),
            poll.getEndsAt(),
            poll.getStatus()
        );
    }
}
