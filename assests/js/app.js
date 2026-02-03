/**
 * APP.JS
 * Orchestrates the flow between UI and Logic Engines.
 */

document.addEventListener("DOMContentLoaded", () => {
    const gameBody = document.getElementById("gameBody");
    const decideBtn = document.getElementById("decideBtn");
    const resetBtn = document.getElementById("resetBtn");

    // 1. Initialize 10 Game Rows
    for (let i = 1; i <= 10; i++) {
        const row = document.createElement("tr");
        row.setAttribute("data-game", i);
        row.innerHTML = `
            <td class="game-id">G${i}</td>
            <td><input type="number" class="bttsNo" step="0.01" placeholder="Odd"></td>
            <td class="input-pair">
                <input type="number" class="u25" step="0.01" placeholder="U2.5">
                <input type="number" class="u15" step="0.01" placeholder="U1.5">
            </td>
            <td class="input-pair">
                <input type="number" class="home05" step="0.01" placeholder="H0.5">
                <input type="number" class="away05" step="0.01" placeholder="A0.5">
            </td>
            <td><input type="number" class="handicap" step="0.01" placeholder="Odd"></td>
            <td class="status-cell">—</td>
            <td class="rank-cell">—</td>
            <td class="action-cell">
                <div class="result-display">—</div>
                <button class="win-btn" disabled>W</button>
                <button class="loss-btn" disabled>L</button>
            </td>
        `;
        gameBody.appendChild(row);
    }

    // 2. The Logic Execution
    decideBtn.addEventListener("click", () => {
        let gamesData = [];

        document.querySelectorAll("#gameBody tr").forEach(tr => {
            const getVal = (cls) => parseFloat(tr.querySelector(`.${cls}`).value) || null;
            
            const gameOdds = {
                bttsNo: getVal('bttsNo'),
                u25: getVal('u25'),
                u15: getVal('u15'),
                home05: getVal('home05'),
                away05: getVal('away05'),
                handicap: getVal('handicap')
            };

            const derived = Calculator.calculateDerivedNoGG(gameOdds);
            const quality = Calculator.computeDataQuality(gameOdds);
            const confidence = Calculator.computeConfidence(derived, gameOdds.bttsNo, quality);
            const patternID = Utils.generatePatternID(gameOdds);
            const history = Database.checkHistory(patternID);

            gamesData.push({ tr, gameOdds, confidence, patternID, history });
        });

        // Rank the games
        const rankedResults = Decision.rankGames(gamesData);

        // Update UI
        rankedResults.forEach(game => {
            const tr = game.tr;
            tr.className = game.status; // Apply CSS (accept/warn/exclude)
            
            tr.querySelector(".status-cell").textContent = game.status.toUpperCase();
            tr.querySelector(".rank-cell").textContent = game.rank;
            
            const wBtn = tr.querySelector(".win-btn");
            const lBtn = tr.querySelector(".loss-btn");

            if (game.status !== 'exclude') {
                wBtn.disabled = false;
                lBtn.disabled = false;
                wBtn.onclick = () => handleResult(game.patternID, 'win', tr);
                lBtn.onclick = () => handleResult(game.patternID, 'loss', tr);
            }
        });
        
        updateSummary(rankedResults);
    });

    function handleResult(id, res, tr) {
        Database.recordResult(id, res);
        tr.querySelector(".result-display").textContent = res.toUpperCase();
        tr.querySelectorAll("button").forEach(b => b.disabled = true);
    }

    function updateSummary(data) {
        document.getElementById("accCount").textContent = data.filter(g => g.status === 'accept').length;
        document.getElementById("exCount").textContent = data.filter(g => g.status === 'exclude').length;
    }

    resetBtn.addEventListener("click", () => location.reload());
});
