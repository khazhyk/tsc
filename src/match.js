function Match(winner, loser, tie) {
    this.teams = [];    // Array of String
    this.round;         // Number
    this.start_time;    // Date
    this.winner;        // String
    this.default;       // Boolean
    this.starting_elo = [];
    this.ending_elo = [];
    if (winner && loser) {
        this.teams.push(winner.name);
        this.teams.push(loser.name);
        this.winner = winner.name;

        this.starting_elo = [winner.current_elo, loser.current_elo];
        this.ending_elo = calculateElo(winner, loser, tie);
    }
}

Match.prototype.toString = function() {
    return "Match [team1=" + this.teams[0] + ", team2=" + this.teams[1] + ", winner=" + this.winner + ", default=" + this.default + "]";
}