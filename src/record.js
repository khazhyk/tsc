function Record() {
    this.teams = [];
    this.matches = [];
}
Record.instance = null;
Record.get = function() {
    if (!Record.instance) {
        Record.instance = new Record();
    }
    return Record.instance;
}
Record.prototype.registerTeam = function(name) {
    if (name instanceof String || typeof name === "string") {
        if (!this.teamByName(name)) {
            var team = new Team(name);
            this.teams.push(team);
            return team;
        }
    } else {
        throw new Error("Not a string bro");
    }
}
Record.prototype.teamByName = function(name) {
    var result = this.teams.filter(function(x) {
        return x.name === name;
    })[0];
    return result ? result : null;
}
Record.prototype.registerMatch = function(team1, team2, winner, _default, start_time, round) {
    var team1 = this.teamByName(team1);
    var team2 = this.teamByName(team2);

    if (team1 == null || team2 == null) throw new Error("Team not registered with record. Typo?" + team1 + team2);

    if (team1.name != winner && team2.name != winner && "TIE" !== winner) throw new Error("Winner not a participating team or TIE, typo?" + team1 + team2 +winner);

    if (_default !== true && _default !== false) throw new Error("default must be boolean");

    if (!(start_time instanceof Date)) throw new Error("start_time must be a date");

    if (!round) throw new Error("round must be specified");

    // Create match
    var match = new Match();
    match.teams.push(team1.name);   // Stores the names 
    match.teams.push(team2.name);
    match.round = round;
    match.start_time = start_time;
    match.winner = winner;
    match.default = _default;

    this.matches.push(match);

    team1.matches.push(match);
    team2.matches.push(match);
}
Record.prototype.doEloForMatches = function() {
    for (i in this.teams) {
        //this.teams[i].current_elo = 1200 + (this.teams[i].getScore()-9)*10;
    }

    var sortCriteria = [["start_time",false]];

    function doSort(objArr) {
        objArr.sort(function(a,b) {
            for (idx in sortCriteria) {
                var crit = sortCriteria[idx][0];
                var desc = sortCriteria[idx][1];
                if (a[crit] == b[crit]) {
                    continue;
                } else {
                    return ((a[crit] > b[crit]) ? -1 : 1) * (desc ? 1 : -1);
                }
            }
        })
    }

    doSort(this.matches);

    // Matches now sorted by date;

    var that = this;

    for (i in this.matches) {
        var match = this.matches[i];

        if (match.ending_elo.length != 0) return;
        var team1 = that.teamByName(match.teams[0]);
        var team2 = that.teamByName(match.teams[1]);

        var team1_elo = team1.current_elo;
        var team2_elo = team2.current_elo;

        // Record the starting elo
        match.starting_elo = [team1_elo,team2_elo];

        var k_factor = 50;  // Maximum to change it by, per match

        var q_a = Math.pow(10, team1_elo/400);
        var q_b = Math.pow(10, team2_elo/400);

        var expected_1 = q_a/(q_a+q_b);
        var expected_2 = q_b/(q_a+q_b);

        var winnings_1 = (match.winner == team1.name) ? 1 : ((match.winner == 'TIE') ? 0.5 : 0);
        var winnings_2 = (match.winner == team2.name) ? 1 : ((match.winner == 'TIE') ? 0.5 : 0);

        if (match.default) k_factor = k_factor*(3/5);

        var team1_newelo = team1_elo + k_factor*(winnings_1 - expected_1);
        var team2_newelo = team2_elo + k_factor*(winnings_2 - expected_2);

        console.log(team1.name + " (" + team1_elo + ", " + parseInt(expected_1*100) + "%) vs " + team2.name + " (" +team2_elo + ", " + parseInt(expected_2*100)+ "%), new elos: " + team1_newelo + ", " + team2_newelo);

        match.ending_elo = [team1_newelo, team2_newelo];

        team1.current_elo = team1_newelo;
        team2.current_elo = team2_newelo;

    };
}