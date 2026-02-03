/********************
 * DECISION.JS
 * Decision & ranking logic for NO GG Truth Engine
 ********************/

/**
 * Thresholds (locked rules)
 */
const CONFIDENCE_THRESHOLD_EXCLUDE = 0.04;
const CONFIDENCE_THRESHOLD_ACCEPT = 0.07;
const HISTORY_BOOST_MAX = 0.20; // max 20% boost from history

/**
 * Determine game status based on confidence
 * Returns 'accept', 'warn', 'exclude'
 */
function determineStatus(confidence) {
    if(confidence < CONFIDENCE_THRESHOLD_EXCLUDE) return 'exclude';
    if(confidence < CONFIDENCE_THRESHOLD_ACCEPT) return 'warn';
    return 'accept';
}

/**
 * Compute rank score
 * confidence: number
 * historyWinRate: decimal 0-1 (optional)
 */
function computeRankScore(confidence, historyWinRate=null) {
    let boost = 0;
    if(historyWinRate !== null && historyWinRate >= 0.65) {
        boost = HISTORY_BOOST_MAX;
    }
    return confidence * (1 + boost);
}

/**
 * Determine decision label
 * status: 'accept'|'warn'|'exclude'
 * historyExists: boolean
 * historyAgreement: boolean (true = history confirms)
 */
function determineDecisionLabel(status, historyExists=false, historyAgreement=true) {
    if(status === 'exclude') return '—'; // excluded games have no label

    if(!historyExists) return 'CALCULATION ONLY';

    if(historyAgreement) return 'CALCULATION CONFIRMED BY HISTORY';

    return 'CALCULATION WITH HISTORICAL WARNING';
}

/**
 * Process all games for status, rank, label
 * Input: array of game objects
 * game = {
 *   gameOdds: {...},
 *   derivedNoGG: number,
 *   bookieNoGG: number,
 *   confidence: number,
 *   historyWinRate: optional,
 *   historyExists: boolean
 * }
 */
function processGames(gamesArray) {
    // Step 1: determine status
    gamesArray.forEach(game => {
        game.status = determineStatus(game.confidence);
        game.decisionLabel = determineDecisionLabel(
            game.status,
            game.historyExists,
            game.historyAgreement
        );
        if(game.status === 'accept') {
            game.rankScore = computeRankScore(game.confidence, game.historyWinRate);
        } else {
            game.rankScore = 0; // excluded or warn with low confidence
        }
    });

    // Step 2: sort accepted/warn games by rankScore descending
    gamesArray.sort((a,b) => b.rankScore - a.rankScore);

    // Step 3: assign rank numbers
    let rank = 1;
    gamesArray.forEach(game => {
        if(game.status === 'accept' || game.status === 'warn') {
            game.rank = rank++;
        } else {
            game.rank = '—';
        }
    });

    return gamesArray;
}
