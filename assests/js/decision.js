/**
 * DECISION.JS
 * The final arbiter of status, rank, and labeling.
 */

const Decision = {
    // Thresholds for the "Truth" logic
    THRESHOLDS: {
        EXCLUDE: 0.03, // Under 3% value difference = Ignore
        ACCEPT: 0.07,  // Over 7% value difference = High Confidence
        HISTORY_BOOST: 0.15 // 15% rank boost for proven patterns
    },

    /**
     * Determines if a game is 'accept', 'warn', or 'exclude'
     */
    getStatus: (confidence) => {
        if (confidence >= Decision.THRESHOLDS.ACCEPT) return 'accept';
        if (confidence >= Decision.THRESHOLDS.EXCLUDE) return 'warn';
        return 'exclude';
    },

    /**
     * Generates the rank score using confidence and history
     */
    getRankScore: (confidence, history) => {
        let score = confidence;
        
        // If history confirms the pattern is a winner, boost the rank
        if (history.exists && history.confirmed) {
            score += Decision.THRESHOLDS.HISTORY_BOOST;
        }
        
        return score;
    },

    /**
     * Processes the entire array of games to rank them against each other
     */
    rankGames: (games) => {
        // 1. Calculate scores and status for all
        games.forEach(game => {
            game.status = Decision.getStatus(game.confidence);
            game.rankScore = Decision.getRankScore(game.confidence, game.history);
        });

        // 2. Sort by rankScore (highest first)
        const sorted = [...games].sort((a, b) => b.rankScore - a.rankScore);

        // 3. Assign numerical ranks to the sorted list
        sorted.forEach((game, index) => {
            if (game.status !== 'exclude') {
                game.rank = index + 1;
            } else {
                game.rank = '—';
            }
        });

        return sorted;
    }
};

window.Decision = Decision;
