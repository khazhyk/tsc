function SimRecord() {
    this.teams = [];
    this.matches = [];
}
SimRecord.prototype.registerTeam = function(team) {
    if (!(team instanceof Team)) {
        throw new Error("Not a team bro");
    }
    if (!this.teamByName(team.name)) {
        this.teams.push(team);
    } else {
        throw new Error("Team already registered: " + team.name);
    }
}
SimRecord.prototype.registerMatch = function(match) {
    var team1 = this.teamByName(match.teams[0]);
    var team2 = this.teamByName(match.teams[1]);
    var winner = match.winner;

    if (team1 == null || team2 == null) throw new Error("Team not registered with record. Typo? Team 1: " + team1 + ", Team 2: " + team2);

    if (team1.name !== winner && team2.name !== winner && "TIE" !== winner) throw new Error("Winner not a participating team or TIE, typo?  Team 1: " + team1 + ", Team 2: " + team2 + ", Winner: " + winner);

    this.matches.push(match);

    team1.matches.push(match);
    team2.matches.push(match);
}
SimRecord.prototype.matchByParticipantNames = function(participantArray) {
    return this.matches.filter(function(match) {
        for (var idx in participantArray) {
            var value = participantArray[idx];
            if (match.teams.indexOf(value) == -1) return false;
        }
        return true;
    })
}
SimRecord.prototype.teamByName = function(name) {
    var result = this.teams.filter(function(x) {
        return x.name === name;
    })[0];
    return result ? result : null;
}
