// main.js
var currentTournament;
var currentTable;
function createTournament() {
    var rounds = document.getElementById("rounds");
    var number = parseInt(document.getElementById("tournamentNumber").value) || 64;

    var chance = document.getElementById("tournamentChance").checked;
    var freepoint = document.getElementById("tournamentFreePoint").checked;

    currentTournament = new SwissStyleRecordGenerator(number,null, {chance:chance, give_free_point:freepoint});
    currentTable = new ShittyTable(currentTournament.toDataArray(), document.getElementById("content"));

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