/**
 * DATABASE.JS
 * Manages pattern storage and historical lookups.
 */

const Database = {
    KEY: "TRUTH_ENGINE_DB",

    /**
     * Retrieves the full history from local storage
     */
    getDB: () => {
        const data = localStorage.getItem(Database.KEY);
        return data ? JSON.parse(data) : {};
    },

    /**
     * Commits data to local storage
     */
    saveDB: (db) => {
        localStorage.setItem(Database.KEY, JSON.stringify(db));
    },

    /**
     * Updates a pattern with a new Win or Loss result
     */
    recordResult: (patternID, result) => {
        const db = Database.getDB();
        
        if (!db[patternID]) {
            db[patternID] = { wins: 0, losses: 0, total: 0 };
        }

        db[patternID].total += 1;
        if (result === 'win') db[patternID].wins += 1;
        if (result === 'loss') db[patternID].losses += 1;

        Database.saveDB(db);
    },

    /**
     * Checks if a pattern has a winning track record
     */
    checkHistory: (patternID) => {
        const db = Database.getDB();
        const stats = db[patternID];

        if (!stats || stats.total < 1) {
            return { exists: false, rate: 0, count: 0 };
        }

        return {
            exists: true,
            count: stats.total,
            rate: (stats.wins / stats.total),
            // High reliability if seen more than 3 times with > 60% win rate
            confirmed: (stats.total >= 3 && (stats.wins / stats.total) >= 0.6)
        };
    }
};

window.Database = Database;
