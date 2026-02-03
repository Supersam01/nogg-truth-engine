// Add this inside the DOMContentLoaded listener in app.js
const tbody = document.getElementById("gameBody");
for (let i = 1; i <= 10; i++) {
    tbody.innerHTML += `
        <tr data-game="${i}">
            <td>G${i}</td>
            <td><input class="bttsNo" type="number" step="0.01"></td>
            <td>
                <div class="input-pair">
                    <input class="u25" type="number" step="0.01" placeholder="2.5">
                    <input class="u15" type="number" step="0.01" placeholder="1.5">
                </div>
            </td>
            <td>
                <div class="input-pair">
                    <input class="home05" type="number" step="0.01" placeholder="H">
                    <input class="away05" type="number" step="0.01" placeholder="A">
                </div>
            </td>
            <td>
                <div class="input-pair">
                    <input class="homeCS" type="number" step="0.01" placeholder="H">
                    <input class="awayCS" type="number" step="0.01" placeholder="A">
                </div>
            </td>
            <td><input class="handicap" type="number" step="0.01"></td>
            <td class="status cell-small">—</td>
            <td class="rank cell-small">—</td>
            <td class="result-cell">
                <div class="result">—</div>
                <div class="decision" style="font-size: 10px; margin-bottom: 5px;">—</div>
                <button class="winBtn" disabled>W</button>
                <button class="lossBtn" disabled>L</button>
            </td>
        </tr>
    `;
}
