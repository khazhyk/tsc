function Team(name) {
    this.name = name;
    this.matches = [];
    this.current_elo = 1200;
}
Team.prototype.getWins = function() {
    if (this.matches.length == 0) return 0;
    var that = this;
    return this.matches.map(function(x) {
        return x.winner == that.name ? 1 : 0;
    }).reduce(function(a,b) {
        return a + b;
    });
}
Team.prototype.getTies = function() {
    if (this.matches.length == 0) return 0;
    return this.matches.map(function(x) {
        return x.winner === "TIE" ? 1 : 0;
    }).reduce(function(a,b) {
        return a + b;
    });
}
Team.prototype.getLosses = function() {
    if (this.matches.length == 0) return 0;
    var that = this;
    return this.matches.map(function(x) {
        return (x.winner !== "TIE" && x.winner != that.name) ? 1 : 0;
    }).reduce(function(a,b) {
        return a + b;
    });
}
Team.prototype.getScore = function() {
    if (this.matches.length == 0) return 0;

    var wins = this.getWins();

    var ties = this.matches.map(function(x) {
        return (x.winner === "TIE" && x.default == false) ? 1 : 0;
    }).reduce(function(a,b) {
        return a + b;
    });

    return 2 * wins + ties;
}
Team.prototype.getWScore = function() {
    if (this.matches.length == 0) return 0;
    var that = this;

    return this.matches.map(function(m) {
        var initscore = 0;
        if (m.winner == that.name) initscore = 2;
        if (m.winner == "TIE" && m.default == false) initscore = 1;

        var otherTeam = Record.get().teamByName(m.teams.filter(function(x) {return x.name != that.name})[0]);

        return ((otherTeam.getScore()) * initscore);
    }).reduce(function(a,b){return a + b;});
}
Team.prototype.toString = function() {
    return "Team [name=" + this.name + "]";
}