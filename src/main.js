// main.js
var currentTournament;
var currentTable;

function createTournament() {
    var number = parseInt(document.getElementById("tournamentNumber").value) || 64;
    var chance = document.getElementById("tournamentChance").checked;

    currentTournament = new SwissStyleRecordGenerator(number,null, {chance:chance});
    currentTable = new ShittyTable(currentTournament.toDataArray(), document.getElementById("content"));

    currentTable.render();
}

function runARound() {
    if (currentTournament) {
        currentTournament.runARound();
        currentTable.updateData(currentTournament.toDataArray());
    }
}
