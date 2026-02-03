/**
 * APP.JS - The Glue
 */
document.addEventListener("DOMContentLoaded", () => {
    const gameBody = document.getElementById("gameBody");
    const decideBtn = document.getElementById("decideBtn");
    const resetBtn = document.getElementById("resetBtn");

    // 1. INJECT MODULES (Creating the Space)
    for (let i = 1; i <= 10; i++) {
        const module = document.createElement("div");
        module.className = "game-card";
        module.setAttribute("data-game", i);
        module.innerHTML = `
            <div class="card-top">
                <span style="font-weight:bold; letter-spacing:1px;">MODULE G${i}</span>
                <span class="rank-tag">#<span class="rank-cell">—</span></span>
            </div>
            
            <div class="input-grid">
                <div class="data-field">
                    <label>BTTS NO ODD</label>
                    <input type="number" class="bttsNo" step="0.01" placeholder="0.00">
                </div>
                <div class="data-field">
                    <label>HANDICAP</label>
                    <input type="number" class="handicap" step="0.01" placeholder="0.00">
                </div>
                <div class="data-field">
                    <label>UNDER 2.5</label>
                    <input type="number" class="u25" step="0.01" placeholder="0.00">
                </div>
                <div class="data-field">
                    <label>UNDER 1.5</label>
                    <input type="number" class="u15" step="0.01" placeholder="0.00">
                </div>
                <div class="data-field">
                    <label>HOME CS (1.5+)</label>
                    <input type="number" class="homeCS" step="0.01" placeholder="0.00">
                </div>
                <div class="data-field">
                    <label>AWAY CS (1.5+)</label>
                    <input type="number" class="awayCS" step="0.01" placeholder="0.00">
                </div>
            </div>

            <div class="card-bottom">
                <div class="status-label">IDLE</div>
                <div class="outcome-btns">
                    <button class="win-btn" disabled>WIN</button>
                    <button class="loss-btn" disabled>LOSS</button>
                </div>
            </div>
        `;
        gameBody.appendChild(module);
    }

    // 2. THE CALCULATION ENGINE
    decideBtn.addEventListener("click", () => {
        let gamesData = [];

        document.querySelectorAll(".game-card").forEach(card => {
            const getVal = (cls) => parseFloat(card.querySelector(`.${cls}`).value) || null;
            
            const gameOdds = {
                bttsNo: getVal('bttsNo'),
                u25: getVal('u25'),
                u15: getVal('u15'),
                homeCS: getVal('homeCS'),
                awayCS: getVal('awayCS'),
                handicap: getVal('handicap')
            };

            // Skip empty modules
            if (!gameOdds.bttsNo) return;

            const derived = Calculator.calculateDerivedNoGG(gameOdds);
            const quality = Calculator.computeDataQuality(gameOdds);
            const confidence = Calculator.computeConfidence(derived, gameOdds.bttsNo, quality);
            const patternID = Utils.generatePatternID(gameOdds);
            const history = Database.checkHistory(patternID);

            gamesData.push({ card, confidence, patternID, history });
        });

        // Rank and Label
        const ranked = Decision.rankGames(gamesData);

        // 3. UI FEEDBACK (The Coloring)
        ranked.forEach(item => {
            const card = item.card;
            card.className = `game-card ${item.status}`;
            card.querySelector(".status-label").textContent = item.status.toUpperCase();
            card.querySelector(".rank-cell").textContent = item.rank;
            
            const wBtn = card.querySelector(".win-btn");
            const lBtn = card.querySelector(".loss-btn");

            if (item.status !== 'exclude') {
                wBtn.disabled = false;
                lBtn.disabled = false;
                wBtn.onclick = () => record(item.patternID, 'win', card);
                lBtn.onclick = () => record(item.patternID, 'loss', card);
            }
        });

        updateTotalStats(ranked);
    });

    function record(id, result, card) {
        Database.recordResult(id, result);
        card.querySelector(".status-label").textContent = `RECORDED: ${result.toUpperCase()}`;
        card.querySelectorAll("button").forEach(b => b.disabled = true);
        card.style.opacity = "0.5";
    }

    function updateTotalStats(data) {
        document.getElementById("accCount").textContent = data.filter(g => g.status === 'accept').length;
        document.getElementById("exCount").textContent = data.filter(g => g.status === 'exclude').length;
    }

    resetBtn.addEventListener("click", () => {
        if(confirm("Wipe current session?")) location.reload();
    });
});
