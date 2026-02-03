/**
 * DATABASE.JS
 * Handles persistent storage and pattern recognition.
 */

const Database = {
    DB_KEY: "nogg_truth_data",

    /**
     * Fetch the entire history from LocalStorage
     */
    getDB: () => {
        const data = localStorage.getItem(Database.DB_KEY);
        return data ? JSON.parse(data) : {};
    },

    /**
     * Save updated history back to LocalStorage
     */
    saveDB: (db) => {
        localStorage.setItem(Database.DB_KEY, JSON.stringify(db));
    },

    /**
     * Logs a pattern or records a win/loss result
     */
    recordResult: (patternID, result = null) => {
        const db = Database.getDB();

        if (!db[patternID]) {
            db[patternID] = { 
                seen: 0, 
                wins: 0, 
                losses: 0, 
                lastResult: null,
                timestamp: Date.now() 
            };
        }

        db[patternID].seen += 1;
        
        if (result === 'win') db[patternID].wins += 1;
        if (result === 'loss') db[patternID].losses += 1;
        
        db[patternID].lastResult = result;
        db[patternID].timestamp = Date.now();

        Database.saveDB(db);
    },

    /**
     * Checks if current engine prediction matches historical data
     */
    checkHistory: (patternID) => {
        const db = Database.getDB();
        const pattern = db[patternID];

        if (!pattern || pattern.seen < 1) {
            return { exists: false, winRate: 0, status: 'NEW' };
        }

        const winRate = pattern.wins / (pattern.wins + pattern.losses || 1);
        
        return {
            exists: true,
            winRate: winRate,
            seen: pattern.seen,
            // Historical agreement if win rate is above 65%
            confirmed: winRate >= 0.65 
        };
    },

    /**
     * Clear all historical data
     */
    clearHistory: () => {
        if (confirm("Delete all historical pattern data?")) {
            localStorage.removeItem(Database.DB_KEY);
        }
    }
};

window.Database = Database;
