/**
 * UTILS.JS
 * Ensures data integrity and pattern normalization.
 */

const Utils = {
    /**
     * Normalizes inputs: converts strings/empty to numbers or null
     */
    parse: (val) => {
        const n = parseFloat(val);
        return isNaN(n) ? null : n;
    },

    /**
     * Standardizes odds to 0.05 increments for pattern matching
     */
    roundOdd: (odd) => {
        if (!odd) return 0;
        return Math.round(odd * 20) / 20;
    },

    /**
     * Core Math: Odds to Implied Probability
     */
    toProb: (odd) => {
        return (odd && odd > 1) ? (1 / odd) : 0;
    },

    /**
     * Weighted Average Helper
     * Ignores zeroes so missing data doesn't tank the score.
     */
    weightedAvg: (values, weights) => {
        let totalWeight = 0;
        let weightedSum = 0;

        values.forEach((v, i) => {
            if (v > 0) {
                weightedSum += (v * weights[i]);
                totalWeight += weights[i];
            }
        });

        return totalWeight > 0 ? (weightedSum / totalWeight) : 0;
    },

    /**
     * Generates the unique signature for the Pattern Database
     */
    generatePatternID: (odds) => {
        // We use BTTS, U25, and Handicap as the primary DNA of a game
        const sig = [
            Utils.roundOdd(odds.bttsNo),
            Utils.roundOdd(odds.u25),
            Utils.roundOdd(odds.handicap)
        ];
        return sig.join('|');
    }
};

window.Utils = Utils;
