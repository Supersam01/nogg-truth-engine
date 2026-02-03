/********************
 * UTILS.JS
 * Helper functions for NO GG Truth Engine
 ********************/

/**
 * Round odds to nearest 0.05
 * e.g. 1.28 -> 1.30, 1.47 -> 1.50
 */
function roundOdd(odd) {
    if (!odd || isNaN(odd)) return null;
    return Math.round(odd * 20) / 20; // multiply 20 = 0.05 step
}

/**
 * Validate an input odd
 * Returns true if valid number > 1.0
 */
function isValidOdd(value) {
    return value !== null && value !== "" && !isNaN(value) && Number(value) > 1;
}

/**
 * Generate a unique pattern ID for a game
 * Input: object with key odds
 * Output: string hash
 * Uses rounded odds to avoid tiny fluctuations
 */
function generatePatternID(gameOdds) {
    // expected keys:
    // bttsNo, u25, u15, home05, away05, homeCS, awayCS, handicap
    let keys = ['bttsNo','u25','u15','home05','away05','homeCS','awayCS','handicap'];
    let str = keys.map(k => roundOdd(gameOdds[k]) || 0).join('-');
    return hashString(str);
}

/**
 * Simple hash function for string → numeric hash
 */
function hashString(str) {
    let hash = 0, i, chr;
    if (str.length === 0) return hash.toString();
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash.toString();
}

/**
 * Helper: Average array ignoring nulls
 */
function avgArray(arr) {
    let valid = arr.filter(v => v !== null && !isNaN(v));
    if (valid.length === 0) return null;
    return valid.reduce((a,b) => a+b, 0) / valid.length;
}

/**
 * Convert odds to probability
 * p = 1 / odd
 */
function oddToProb(odd) {
    if (!isValidOdd(odd)) return null;
    return 1 / Number(odd);
}

