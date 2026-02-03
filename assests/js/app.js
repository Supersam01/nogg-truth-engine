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

            // STATUS
            let statusCell = tr.querySelector(".status");
            statusCell.textContent = game.status.toUpperCase();
            statusCell.className = "status " + game.status;

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
