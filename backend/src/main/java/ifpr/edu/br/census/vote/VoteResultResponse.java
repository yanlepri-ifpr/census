package ifpr.edu.br.census.vote;

public record VoteResultResponse(
    long optionAVotes,
    long optionBVotes,
    long totalVotes,
    double optionAPercent,
    double optionBPercent
) {
    public static VoteResultResponse from(long optionAVotes, long optionBVotes) {
        long totalVotes = optionAVotes + optionBVotes;
        return new VoteResultResponse(
            optionAVotes,
            optionBVotes,
            totalVotes,
            percent(optionAVotes, totalVotes),
            percent(optionBVotes, totalVotes)
        );
    }

    private static double percent(long votes, long totalVotes) {
        if (totalVotes == 0) {
            return 0;
        }
        return Math.round(votes * 1000.0 / totalVotes) / 10.0;
    }
}
