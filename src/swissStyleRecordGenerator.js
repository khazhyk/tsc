/** Plays the binary logarithm of the matches for the Swiss Style Tournament */
function SwissStyleRecordGenerator(numTeams, record, options) {
    this.record = record || new SimRecord();
    this.rounds = 0;
    this.chance = (options.chance === undefined) ? true : options.chance;

    var elo_mean = 1200;
    var elo_std_dev = (options.std_dev === undefined) ? 100 : options.std_dev;


    // Generate teams
    for (var i = 0; i < numTeams; i++) {
        var team = new Team("Random Team #" + i);
        team.current_elo = team.starting_elo = boxMuller()[0] * elo_std_dev + elo_mean;
        team.current_swiss_score = 0;
        team.has_sat_out = false;

        this.record.registerTeam(team);

    }
}

SwissStyleRecordGenerator.prototype.toDataArray = function() {
    return this.record.teams.map(function(team) {
        return {
            name: team.name,
            score: team.current_swiss_score,
            seed: team.starting_elo,
            elo: team.current_elo,
            "sat out?": team.has_sat_out
        }
    })
}

SwissStyleRecordGenerator.prototype.runARound = function() {
    if (this.rounds < parseInt((Math.log(this.record.teams.length)/Math.log(2)))) {
        this.rounds += 1;
        var matches = this.getMatchPairings();
        this.runMatches(matches);
    } else {
        this.is_done = true;
    }
}

SwissStyleRecordGenerator.prototype.getMatchPairings = function() {
    var highScore = this.record.teams.map(function(x){return x.current_swiss_score;}).reduce(function(a,b){return Math.max(a,b);});

    var teamsObjArray = this.record.teams.map(function(team) {
        return {name: team.name, current_swiss_score: team.current_swiss_score, starting_elo: team.starting_elo, has_sat_out: team.has_sat_out};
    });

    var teamsByScore = {};

    var pairings = [];

    for (var i = 0; i <= highScore; i++) {
        teamsByScore[i] = teamsObjArray.filter(function(team) {
            return team.current_swiss_score === i;
        });
    }

    for (var key in teamsByScore) {
        var pointGrouping = teamsByScore[key];

        // Sort by strength
        pointGrouping = pointGrouping.sort(function(a,b) {
            return (a.starting_elo < b.starting_elo) ? 1 : -1;
        });

        var midpoint = parseInt(pointGrouping.length/2);

        // Assumes sorted list
        if (pointGrouping.length % 2 != 0) {
            if (pointGrouping[pointGrouping.length - 1].has_sat_out) {
                for (var k = pointGrouping.length - 1; k >=0; k--) {
                    if (!pointGrouping[k].has_sat_out) {
                        pointGrouping.push(pointGrouping.splice(k,1)[0]);
                        break;
                    }
                }
            }
            var sat_out_team = this.record.teamByName(pointGrouping[pointGrouping.length - 1].name);
            sat_out_team.has_sat_out = true;
        }


        for (var j = 0; j < midpoint; j++) {
            var team1 = pointGrouping[j], team2 = pointGrouping[j + midpoint];
            if (this.record.matchByParticipantNames([team1.name, team2.name]).length != 0) {
                temp = pointGrouping[j+1];
                pointGrouping[j+1] = pointGrouping[j];
                pointGrouping[j] = temp;
                if (j+1 == midpoint) {
                    pairings = [];
                    j = 0;
                    continue;
                }
            }
            pairings.push([pointGrouping[j], pointGrouping[j+midpoint]]);
        }
    }

    return pairings;
}

SwissStyleRecordGenerator.prototype.runMatches = function(pairings) {
    for (var key in pairings) { 
        var value = pairings[key];
        this.runMatch(value);
    }
}

SwissStyleRecordGenerator.prototype.runMatch = function(pairing) {
    var team1 = this.record.teamByName(pairing[0].name);
    var team2 = this.record.teamByName(pairing[1].name);

    if (this.record.matchByParticipantNames([team1.name, team2.name]).length != 0) {
        console.log("Warning: Teams " + team1.name + " and " + team2.name + " have already played a match!");
    }

    q_t_1 = Math.pow(10, team1.starting_elo/400);
    q_t_2 = Math.pow(10, team2.starting_elo/400);

    var e_t_1 = q_t_1/(q_t_1 + q_t_2);

    if (this.chance ? (Math.random() <= e_t_1) : (q_t_1 >= q_t_2)) {
        winner = team1;
        loser = team2;
    } else {
        winner = team2;
        loser = team1;
    }

    var match = new Match(winner, loser);

    winner.current_elo = match.ending_elo[0];
    loser.current_elo = match.ending_elo[1];

    winner.current_swiss_score += 1;

    this.record.registerMatch(match);
}
