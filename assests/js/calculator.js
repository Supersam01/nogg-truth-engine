/********************
 * CALCULATOR.JS
 * Pure math engine for NO GG Truth Engine
 ********************/

/**
 * Compute Derived NO GG probability
 * Input: gameOdds = {bttsNo, u25, u15, home05, away05, homeCS, awayCS, handicap}
 * Output: number between 0 and 1
 */
function calculateDerivedNoGG(gameOdds) {
    // Convert odds → probabilities
    let probs = {
        bttsNo: oddToProb(gameOdds.bttsNo),
        u25: oddToProb(gameOdds.u25),
        u15: oddToProb(gameOdds.u15),
        home05: 1 - oddToProb(gameOdds.home05), // probability team fails to score
        away05: 1 - oddToProb(gameOdds.away05),
        homeCS: oddToProb(gameOdds.homeCS),
        awayCS: oddToProb(gameOdds.awayCS),
        handicap: oddToProb(gameOdds.handicap) // proxy, optional
    };

    // Team fail score
    let teamFailScore = avgArray([probs.home05, probs.away05]);

    // Under goals score
    let underScore = avgArray([probs.u25, probs.u15]);

    // Clean sheet score
    let cleanScore = avgArray([probs.homeCS, probs.awayCS]);

    // Handicaps weight (optional)
    let handicapScore = probs.handicap || 0.5;

    // Assign weights
    // Total must sum to 1
    let weightTeam = 0.30;
    let weightUnder = 0.25;
    let weightClean = 0.15;
    let weightHandicap = 0.15;
    let weightExtra = 0.15; // can be redistributed if empty

    // Adjust weights if some values null
    let values = [teamFailScore, underScore, cleanScore, handicapScore];
    let weights = [weightTeam, weightUnder, weightClean, weightHandicap];

    // Only include valid
    let validValues = [];
    let validWeights = [];
    for(let i=0; i<values.length; i++) {
        if(values[i] !== null) {
            validValues.push(values[i]);
            validWeights.push(weights[i]);
        }
    }
    // Normalize weights
    let sumWeights = validWeights.reduce((a,b)=>a+b,0);
    validWeights = validWeights.map(w => w/sumWeights);

    // Compute weighted average
    let derivedNoGG = 0;
    for(let i=0; i<validValues.length; i++){
        derivedNoGG += validValues[i] * validWeights[i];
    }

    return derivedNoGG;
}

/**
 * Compute Bookie NO GG probability
 * Simply 1 / BTTS No
 */
function calculateBookieNoGG(gameOdds) {
    if (!isValidOdd(gameOdds.bttsNo)) return null;
    return 1 / Number(gameOdds.bttsNo);
}

/**
 * Compute Data Quality Factor
 * Depends on how many odds are filled
 */
function computeDataQuality(gameOdds) {
    let filled = 0;
    for(let key in gameOdds){
        if(isValidOdd(gameOdds[key])) filled++;
    }

    if(filled >= 8) return 1.0;
    if(filled >= 6) return 0.85;
    if(filled >= 4) return 0.65;
    return 0; // too few inputs
}

/**
 * Compute Confidence
 * Derived - Bookie probability, multiplied by quality factor
 */
function computeConfidence(derivedNoGG, bookieNoGG, dataQualityFactor){
    if(derivedNoGG === null || bookieNoGG === null || dataQualityFactor === 0) return 0;
    return (derivedNoGG - bookieNoGG) * dataQualityFactor;
}
