/**
 * UTILS.JS
 * Core utility functions for data normalization and validation.
 */

const Utils = {
    /**
     * Rounds odds to the nearest 0.05 (Bookmaker standard)
     * Helps in pattern matching consistency.
     */
    roundOdd: (odd) => {
        if (!odd || isNaN(odd)) return null;
        return Math.round(odd * 20) / 20;
    },

    /**
     * Basic validation for odds
     */
    isValidOdd: (value) => {
        return value !== null && 
               value !== undefined && 
               !isNaN(value) && 
               Number(value) > 1;
    },

    /**
     * Converts Odds to Implied Probability
     * Formula: P = 1 / Decimal Odd
     */
    oddToProb: (odd) => {
        if (!Utils.isValidOdd(odd)) return 0;
        return 1 / Number(odd);
    },

    /**
     * Averages an array while ignoring null/invalid values
     */
    avg: (arr) => {
        const valid = arr.filter(v => v !== null && !isNaN(v) && v !== 0);
        if (valid.length === 0) return 0;
        return valid.reduce((a, b) => a + b, 0) / valid.length;
    },

    /**
     * Generates a unique string key based on rounded odds 
     * for historical pattern tracking.
     */
    generatePatternID: (gameOdds) => {
        const keys = ['bttsNo', 'u25', 'u15', 'home05', 'away05', 'handicap'];
        return keys
            .map(k => Utils.roundOdd(gameOdds[k]) || '0')
            .join('-');
    }
};

// Export for use in other files
window.Utils = Utils;
