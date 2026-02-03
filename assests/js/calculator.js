/**
 * CALCULATOR.JS
 * The proprietary logic for deriving the "No GG" probability.
 */

const Calculator = {
    /**
     * Compares bookmaker price against calculated defensive probability.
     */
    calculateDerivedNoGG: (odds) => {
        // Convert all relevant markets to probabilities
        const pBttsNo = Utils.toProb(odds.bttsNo);
        const pU25    = Utils.toProb(odds.u25);
        const pU15    = Utils.toProb(odds.u15);
        const pHCS    = Utils.toProb(odds.homeCS);
        const pACS    = Utils.toProb(odds.awayCS);
        const pHcap   = Utils.toProb(odds.handicap);

        /**
         * The Engine uses 4 distinct logical "Pillars":
         * 1. Defensive Floor (U2.5 and U1.5)
         * 2. Zero-Score Proxy (Home/Away Clean Sheets)
         * 3. Market baseline (Raw BTTS No)
         * 4. Spread context (Handicap)
         */
        const values = [
            Utils.avg([pU25, pU15]),   // Pillar 1: Under Goals
            Utils.avg([pHCS, pACS]),   // Pillar 2: Clean Sheet Probability
            pBttsNo,                   // Pillar 3: BTTS Market
            pHcap                      // Pillar 4: Handicap
        ];

        const weights = [0.40, 0.30, 0.20, 0.10];

        // Result is the weighted average of all defensive indicators
        return Utils.weightedAvg(values, weights);
    },

    /**
     * Determines the quality of the input data. 
     * More inputs = higher confidence multiplier.
     */
    computeDataQuality: (odds) => {
        const totalFields = 6;
        const filled = Object.values(odds).filter(v => v !== null && v > 0).length;
        
        // Return a multiplier between 0.5 and 1.0
        return 0.5 + (filled / totalFields) * 0.5;
    },

    /**
     * Confidence = (Our Probability - Bookie Probability) * Quality
     */
    computeConfidence: (derivedProb, rawBttsOdd, quality) => {
        const bookieProb = Utils.toProb(rawBttsOdd);
        if (!bookieProb) return 0;

        const edge = derivedProb - bookieProb;
        return edge * quality;
    }
};

// Internal avg helper
Utils.avg = (arr) => {
    const valid = arr.filter(v => v > 0);
    return valid.length ? (valid.reduce((a, b) => a + b, 0) / valid.length) : 0;
};

window.Calculator = Calculator;
