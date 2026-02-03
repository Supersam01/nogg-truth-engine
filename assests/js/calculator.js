/**
 * CALCULATOR.JS
 * The core logic for deriving "Odd Truths" from bookmaker data.
 */

const Calculator = {
    /**
     * The heart of the engine: Computes the Derived No GG Probability
     */
    calculateDerivedNoGG: (gameOdds) => {
        // Probabilities of "No" or "Under" outcomes
        const probs = {
            bttsNo: Utils.oddToProb(gameOdds.bttsNo),
            u25: Utils.oddToProb(gameOdds.u25),
            u15: Utils.oddToProb(gameOdds.u15),
            // Team failing to score (1 - Prob of scoring)
            homeFail: gameOdds.home05 ? (1 - Utils.oddToProb(gameOdds.home05)) : 0,
            awayFail: gameOdds.away05 ? (1 - Utils.oddToProb(gameOdds.away05)) : 0,
            handicap: Utils.oddToProb(gameOdds.handicap)
        };

        // Component Scores
        const components = [
            { val: Utils.avg([probs.homeFail, probs.awayFail]), weight: 0.35 }, // Team Fail Score
            { val: Utils.avg([probs.u25, probs.u15]), weight: 0.30 },          // Under Goals Score
            { val: probs.bttsNo, weight: 0.20 },                               // Raw BTTS No Score
            { val: probs.handicap, weight: 0.15 }                             // Handicap Proxy
        ];

        // Dynamic Weighting: Ignore components with 0 or null values
        let activeWeightsSum = 0;
        let weightedResult = 0;

        components.forEach(c => {
            if (c.val > 0) {
                weightedResult += (c.val * c.weight);
                activeWeightsSum += c.weight;
            }
        });

        // Normalize if data is missing, otherwise return weighted avg
        return activeWeightsSum > 0 ? (weightedResult / activeWeightsSum) : 0;
    },

    /**
     * Calculates the "Confidence"
     * Difference between our derived math and the bookie's raw odds
     */
    computeConfidence: (derivedNoGG, rawBttsOdd, quality) => {
        const bookieProb = Utils.oddToProb(rawBttsOdd);
        if (!bookieProb || quality === 0) return 0;
        
        // Confidence is the "Value" found by the engine
        return (derivedNoGG - bookieProb) * quality;
    },

    /**
     * Rates the reliability of the input data
     */
    computeDataQuality: (gameOdds) => {
        const keys = Object.keys(gameOdds);
        const filled = keys.filter(k => Utils.isValidOdd(gameOdds[k])).length;
        
        if (filled >= 6) return 1.0;  // High Reliability
        if (filled >= 4) return 0.7;  // Medium Reliability
        if (filled >= 2) return 0.4;  // Low Reliability
        return 0;                     // Garbage in, garbage out
    }
};

window.Calculator = Calculator;
