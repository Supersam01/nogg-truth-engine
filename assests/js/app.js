/********************
 * APP.JS
 * Glue code: UI <-> Calculator <-> Database <-> Decision
 ********************/

// Wait until DOM loads
document.addEventListener("DOMContentLoaded", () => {

    const decideBtn = document.getElementById("decideBtn");
    const resetBtn = document.getElementById("resetBtn");
    const gamesTable = document.getElementById("gamesTable");

    // DECIDE BUTTON
    decideBtn.addEventListener("click", () => {
        let gamesArray = [];

        // Read all 10 games
        document.querySelectorAll("tbody tr").forEach(tr => {
            let gameOdds = {
                bttsNo: parseFloat(tr.querySelector(".bttsNo").value) || null,
                u25: parseFloat(tr.querySelector(".u25").value) || null,
                u15: parseFloat(tr.querySelector(".u15").value) || null,
                home05: parseFloat(tr.querySelector(".home05").value) || null,
                away05: parseFloat(tr.querySelector(".away05").value) || null,
                homeCS: parseFloat(tr.querySelector(".homeCS").value) || null,
                awayCS: parseFloat(tr.querySelector(".awayCS").value) || null,
                handicap: parseFloat(tr.querySelector(".handicap").value) || null
            };

            let derivedNoGG = calculateDerivedNoGG(gameOdds);
            let bookieNoGG = calculateBookieNoGG(gameOdds);
            let dataQuality = computeDataQuality(gameOdds);
            let confidence = computeConfidence(derivedNoGG, bookieNoGG, dataQuality);

            let patternID = generatePatternID(gameOdds);

            // Check history
            let historyInfo = checkHistory(patternID, derivedNoGG > bookieNoGG);

            let gameObj = {
                trElement: tr,
                gameOdds,
                derivedNoGG,
                bookieNoGG,
                confidence,
                patternID,
                historyExists: historyInfo.exists,
                historyAgreement: historyInfo.agreement,
                historyWinRate: historyInfo.winRate
            };

            gamesArray.push(gameObj);
        });

        // Process decisions & ranking
        gamesArray = processGames(gamesArray);

        // Update UI
        gamesArray.forEach(game => {
            const tr = game.trElement;

            // Clear previous classes
            tr.classList.remove("rank-1","rank-2","rank-3","accept","warn","exclude");

            // STATUS
            let statusCell = tr.querySelector(".status");
            statusCell.textContent = game.status.toUpperCase();
            tr.classList.add(game.status);

            // DECISION
            let decisionCell = tr.querySelector(".decision");
            decisionCell.textContent = game.decisionLabel;
            decisionCell.className = "decision";
            if(game.decisionLabel.includes("HISTORY")) {
                decisionCell.classList.add("calcHist");
            } else if(game.decisionLabel.includes("WARNING")) {
                decisionCell.classList.add("warn");
            } else {
                decisionCell.classList.add("calc");
            }

            // RANK
            let rankCell = tr.querySelector(".rank");
            rankCell.textContent = game.rank;

            // Highlight top 3 ranked games
            if(game.rank === 1) tr.classList.add("rank-1");
            if(game.rank === 2) tr.classList.add("rank-2");
            if(game.rank === 3) tr.classList.add("rank-3");

            // RESULT BUTTONS
            let winBtn = tr.querySelector(".winBtn");
            let lossBtn = tr.querySelector(".lossBtn");
            if(game.status === "accept" || game.status === "warn") {
                winBtn.disabled = false;
                lossBtn.disabled = false;
                // Attach click events
                winBtn.onclick = () => {
                    recordResult(game.patternID, "win");
                    updateAfterResult(tr, "WIN");
                };
                lossBtn.onclick = () => {
                    recordResult(game.patternID, "loss");
                    updateAfterResult(tr, "LOSS");
                };
            } else {
                winBtn.disabled = true;
                lossBtn.disabled = true;
            }

            // Update database automatically for accepted/warn games
            if(game.status !== "exclude") {
                updatePattern({patternID: game.patternID});
            }
        });

        // Update session summary
        updateSessionSummary(gamesArray);
    });

    // RESET BUTTON
    resetBtn.addEventListener("click", () => {
        if(confirm("Are you sure you want to reset the session?")) {
            document.querySelectorAll("tbody tr").forEach(tr => {
                tr.querySelectorAll("input").forEach(inp => inp.value = "");
                tr.querySelector(".status").textContent = "—";
                tr.querySelector(".status").className = "status";
                tr.querySelector(".decision").textContent = "—";
                tr.querySelector(".decision").className = "decision";
                tr.querySelector(".rank").textContent = "—";
                let winBtn = tr.querySelector(".winBtn");
                let lossBtn = tr.querySelector(".lossBtn");
                winBtn.disabled = true;
                lossBtn.disabled = true;
                winBtn.onclick = null;
                lossBtn.onclick = null;
            });

            // Reset session summary
            document.getElementById("acceptedCount").textContent = "0";
            document.getElementById("warnCount").textContent = "0";
            document.getElementById("excludedCount").textContent = "0";
        }
    });

});

/**
 * After user clicks WIN/LOSS, update UI
 */
function updateAfterResult(tr, resultText) {
    let resultCell = tr.querySelector(".result");
    resultCell.innerHTML = `<strong>${resultText}</strong>`;
    // disable buttons
    tr.querySelector(".winBtn").disabled = true;
    tr.querySelector(".lossBtn").disabled = true;
}

/**
 * Update session summary counts
 */
function updateSessionSummary(gamesArray) {
    let accepted = gamesArray.filter(g => g.status === "accept").length;
    let warn = gamesArray.filter(g => g.status === "warn").length;
    let excluded = gamesArray.filter(g => g.status === "exclude").length;

    document.getElementById("acceptedCount").textContent = accepted;
    document.getElementById("warnCount").textContent = warn;
    document.getElementById("excludedCount").textContent = excluded;
}
