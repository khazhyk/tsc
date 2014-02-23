/** Plays the binary logarithm of the matches for the Swiss Style Tournament */
function SwissStyleRecordGenerator(numTeams, options) {
    this.record = new SimRecord();
    this.rounds = 0;
    var options = options || {};
    this.chance = (options.chance === undefined) ? true : options.chance;

    var elo_mean = 1200;
    var elo_std_dev = (options.std_dev === undefined) ? 100 : options.std_dev;


    // Generate teams
    if (numTeams) {
        for (var i = 0; i < numTeams; i++) {
            var team = new Team("Random Team #" + i);
            team.current_elo = team.starting_elo = boxMuller()[0] * elo_std_dev + elo_mean;
            team.current_swiss_score = 0;
            team.has_sat_out = false;

            this.record.registerTeam(team);
        }
    }
}
SwissStyleRecordGenerator.prototype.importTeams = function(json_data) {
    var that = this;
    json_data.forEach(function(team_entry) {
        var team = new Team(team_entry.name);
        team.starting_elo = 1800 - 10 * team_entry.seed;
        team.current_elo = team.starting_elo;
        team.current_swiss_score = 0;
        team.has_sat_out = false;
        team.is_dq = !!team_entry.dq;

        that.record.registerTeam(team);
    });
}
SwissStyleRecordGenerator.prototype.importMatches = function(json_data) {
    var that = this;
    json_data.forEach(function(match_entry) {
        match_entry.teams.forEach(function(team) {
            if (!that.record.teamByName(team))
                throw new Error("Team \"" + team + "\" not in record");
        });
    });

    var sorted_matches = json_data.sort(function(a,b) {
        return a.start > b.start ? 1 : -1;
    });

    sorted_matches.forEach(function(match_entry) {
        var team1 = that.record.teamByName(match_entry.teams[0]),
            team2 = that.record.teamByName(match_entry.teams[1]);

        if (that.record.matchByParticipantNames([team1.name, team2.name]).length != 0) {
            console.log("Warning: Teams " + team1.name + " and " + team2.name + " have already played a match! Tiebreaker?");
        }

        var winner, loser;

        if (team1.name == match_entry.winner) {
            winner = team1;
            loser = team2;
        } else {
            winner = team2;
            loser = team1;
        }

        var tie = !match_entry.winner;

        var match = new Match(winner, loser, tie, new Date(match_entry.start), new Date(match_entry.end), match_entry.map);

        winner.current_elo = match.ending_elo[0]
        loser.current_elo = match.ending_elo[1];

        if (!tie) {
            winner.current_swiss_score += 1;
        }

        that.record.registerMatch(match);
    });
}

SwissStyleRecordGenerator.prototype.toDataArray = function() {
    return this.record.teams.map(function(team) {
        return {
            name: team.name,
            score: team.current_swiss_score,
            seed: team.starting_elo,
            elo: team.current_elo,
            "sat out?": team.has_sat_out,
            played:team.matches.length
        }
    })
}

SwissStyleRecordGenerator.prototype.matchToDataArray = function() {
    return this.record.matches.map(function(match) {
        return {
            winner: match.teams[0],
            loser: match.teams[1],
            "tie?": match.tie,
            map: match.map,
            start: match.start_time,
            end: match.end_time
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

    var teamsObjArray = this.record.teams.filter(function(team){
        return !team.is_dq;
    }).map(function(team) {
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

        pointGrouping = this.chooseWhoSitsOutAndPutThemLast(pointGrouping);

        [].push.apply(pairings, this.getUniquePairings(pointGrouping));
    }

    return pairings;
}
SwissStyleRecordGenerator.prototype.chooseWhoSitsOutAndPutThemLast = function(list_of_same_point_teams) {
    // Assumes sorted list
    var numTeams = list_of_same_point_teams.length;
    if (list_of_same_point_teams.length % 2 != 0) {
        // Check if the last one in the list has already sat out. If they have, don't let them sit out again
        if (this.record.teamByName(list_of_same_point_teams[numTeams - 1].name).has_sat_out) {
            for (var k = numTeams - 1; k >=0; k--) {
                // Find the first team that _hasn't_ sat out starting from the end of the list
                if (!this.record.teamByName(list_of_same_point_teams[k].name).has_sat_out) {
                    // found it, put it at the end, return
                    list_of_same_point_teams.push(list_of_same_point_teams.splice(k,1)[0]);
                    break;
                }
            }
        }
        // notify record that they sat out
        this.record.teamByName(list_of_same_point_teams[numTeams - 1].name).has_sat_out = true;
    }

    return list_of_same_point_teams;
}
SwissStyleRecordGenerator.prototype.getUniquePairings = function(list_of_same_point_teams) {
    var midpoint = parseInt(list_of_same_point_teams.length / 2);

    var pairings = [];

    for (var j = 0; j < midpoint; j++) {
        var team1 = list_of_same_point_teams[j],
            team2 = list_of_same_point_teams[j + midpoint];

        console.log("Trying to pair " + team1.name + " and " + team2.name);

        if (this.record.matchByParticipantNames([team1.name, team2.name]).length != 0) {
            console.log("Teams have played before!! Swapping and starting again...");
            temp = list_of_same_point_teams[j+1];
            list_of_same_point_teams[j+1] = list_of_same_point_teams[j];
            list_of_same_point_teams[j] = temp;
            // Restart with new order
            return this.getUniquePairings(list_of_same_point_teams);
        }

        pairings.push([team1, team2]);
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
