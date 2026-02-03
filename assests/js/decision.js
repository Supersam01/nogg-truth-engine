/**
 * DECISION.JS
 * Final ranking and status determination.
 */

const Decision = {
    // The "Engine Standards" for what makes a good pick
    MIN_EDGE: 0.04,   // 4% difference needed to even consider
    STRONG_EDGE: 0.08, // 8% difference triggers "ACCEPT" status

    /**
     * Assigns the status based on the confidence score
     */
    getStatus: (confidence, history) => {
        // Boost confidence if history confirms this pattern wins
        let finalScore = confidence;
        if (history.confirmed) finalScore += 0.05;

        if (finalScore >= Decision.STRONG_EDGE) return 'accept';
        if (finalScore >= Decision.MIN_EDGE) return 'warn';
        return 'exclude';
    },

    /**
     * Ranks all active games from highest confidence to lowest
     */
    rankGames: (games) => {
        // 1. Determine status and score for each
        games.forEach(g => {
            g.status = Decision.getStatus(g.confidence, g.history);
            // Sorting score includes history bonus
            g.sortScore = g.confidence + (g.history.confirmed ? 0.1 : 0);
        });

        // 2. Filter out the trash and sort the rest
        const activeOnes = games
            .filter(g => g.status !== 'exclude')
            .sort((a, b) => b.sortScore - a.sortScore);

        // 3. Map ranks back to the original objects
        activeOnes.forEach((g, index) => {
            g.rank = index + 1;
        });

        // 4. Handle excluded games
        games.forEach(g => {
            if (g.status === 'exclude') g.rank = '—';
        });

        return games;
    }
};

window.Decision = Decision;
