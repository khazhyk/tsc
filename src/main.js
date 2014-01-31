// main.js
var currentTournament;
var currentTable;
function createTournament() {
    var rounds = document.getElementById("rounds");
    var number = parseInt(document.getElementById("tournamentNumber").value) || 64;

    var std_dev = parseInt(document.getElementById("tournamentStdDev").value) || 100;

    var chance = document.getElementById("tournamentChance").checked;

    currentTournament = new SwissStyleRecordGenerator(number,null, {chance:chance, std_dev: std_dev});
    currentTable = new ShittyTable(currentTournament.toDataArray(), document.getElementById("content"));

    currentTable.sortBy("seed", -1);
    currentTable.sortBy("score", -1);
    currentTable.render();
    rounds.innerHTML = currentTournament.rounds;
}

function runARound() {
    var rounds = document.getElementById("rounds");
    if (currentTournament && !currentTournament.is_done) {
        currentTournament.runARound();
        currentTable.updateData(currentTournament.toDataArray());
        rounds.innerHTML = currentTournament.rounds;
    }
}

function runTourney() {
    var rounds = document.getElementById("rounds");
    if (currentTournament) {
        while(!currentTournament.is_done) currentTournament.runARound();
        currentTable.updateData(currentTournament.toDataArray());
        rounds.innerHTML = currentTournament.rounds;
    }
}