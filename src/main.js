// main.js
var currentTournament;
var currentTable;
function createTournament() {
    var rounds = document.getElementById("rounds");
    var number = parseInt(document.getElementById("tournamentNumber").value) || 64;

    var std_dev = parseInt(document.getElementById("tournamentStdDev").value) || 100;

    var chance = document.getElementById("tournamentChance").checked;

    currentTournament = new SwissStyleRecordGenerator(number, {chance:chance, std_dev: std_dev});
    currentTable = new ShittyTable(currentTournament.toDataArray(), document.getElementById("content"),{isNumbered:true});

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

function importData() {
    var dataSources = ["matches","seeds"];

    dataSources.forEach(function(a) {
        var el = document.createElement("script");
        el.src = "data/" + a + ".js";
        document.getElementsByTagName("body")[0].appendChild(el);
    });

    setTimeout(function() {

        tm = new SwissStyleRecordGenerator();
        tm.importTeams(seeds_import);
        tm.importMatches(matches_import);
	showMatches();
    },300);
}

function showTeams() {
    if (tm) {
        tbl = new ShittyTable(tm.toDataArray(), document.getElementById("content"), {isNumbered:true});

        tbl.sortBy("seed", -1);
        tbl.sortBy("tb_score", -1);
        tbl.sortBy("score", -1);
        tbl.render();
    }
}

function showMatches() {
    if (tm) {
        tbl = new ShittyTable(tm.matchToDataArray(), document.getElementById("content"), {isNumbered:true});

        tbl.sortBy("start",1);
        tbl.render();
    }
}
