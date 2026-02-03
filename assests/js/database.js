/********************
 * DATABASE.JS
 * Pattern memory & feedback for NO GG Truth Engine
 ********************/

/**
 * LocalStorage key
 */
const PATTERN_DB_KEY = "noggPatterns";

/**
 * Get database from LocalStorage
 */
function getDatabase() {
    let db = localStorage.getItem(PATTERN_DB_KEY);
    if(!db) return {};
    return JSON.parse(db);
}

/**
 * Save database to LocalStorage
 */
function saveDatabase(db) {
    localStorage.setItem(PATTERN_DB_KEY, JSON.stringify(db));
}

/**
 * Add or update a pattern
 * game = {
 *   patternID: string,
 *   result: "win"|"loss" (optional)
 * }
 */
function updatePattern(game) {
    let db = getDatabase();

    if(!db[game.patternID]){
        db[game.patternID] = { seen:0, win:0, loss:0, lastResult:null, lastDate:null };
    }

    db[game.patternID].seen += 1;

    if(game.result === "win") db[game.patternID].win += 1;
    if(game.result === "loss") db[game.patternID].loss += 1;

    db[game.patternID].lastResult = game.result || null;
    db[game.patternID].lastDate = new Date().toISOString();

    saveDatabase(db);
}

/**
 * Record manual win/loss for a game
 */
function recordResult(patternID, result) {
    if(result !== "win" && result !== "loss") return;
    let db = getDatabase();

    if(!db[patternID]){
        db[patternID] = { seen:0, win:0, loss:0, lastResult:null, lastDate:null };
    }

    db[patternID].seen +=1;
    if(result === "win") db[patternID].win +=1;
    if(result === "loss") db[patternID].loss +=1;

    db[patternID].lastResult = result;
    db[patternID].lastDate = new Date().toISOString();

    saveDatabase(db);
}

/**
 * Get pattern history
 * Returns object {seen, win, loss, lastResult, lastDate}
 * If pattern not found, returns null
 */
function getPatternHistory(patternID) {
    let db = getDatabase();
    return db[patternID] || null;
}

/**
 * Check if history confirms the calculation
 * derivedNoGG > bookieNoGG = system predicts NO GG
 * Returns {exists: boolean, agreement: boolean, winRate: number}
 */
function checkHistory(patternID, systemPrediction) {
    let pattern = getPatternHistory(patternID);
    if(!pattern) return {exists:false, agreement:true, winRate:0};

    // agreement if history win rate > 0.65
    let winRate = pattern.win / pattern.seen;
    let agreement = (systemPrediction && winRate >= 0.65);

    return {
        exists: true,
        agreement: agreement,
        winRate: winRate
    };
}

/**
 * Reset database (optional)
 */
function resetDatabase() {
    localStorage.removeItem(PATTERN_DB_KEY);
}
