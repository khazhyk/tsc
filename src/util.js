function calculateElo(winner, loser, tie) {

        var winner_elo = winner.current_elo;
        var loser_elo = loser.current_elo;

        var k_factor = 32;  // Maximum to change it by, per match

        var q_a = Math.pow(10, winner_elo/400);
        var q_b = Math.pow(10, loser_elo/400);

        var expected_winner = q_a/(q_a+q_b);
        var expected_loser = q_b/(q_a+q_b);

        var winnings_winner, winnings_loser;
        if (tie) {
                winnings_winner = winnings_loser = 0.5;
        } else {
                winnings_winner = 1;
                winnings_loser = 0;
        }

        var winner_newelo = winner_elo + k_factor*(winnings_winner - expected_winner);
        var loser_newelo = loser_elo + k_factor*(winnings_loser - expected_loser);

        console.log(winner.name + " (" + winner_elo + ", " + parseInt(expected_winner*100) + "%) vs " + loser.name + " (" +loser_elo + ", " + parseInt(expected_loser*100)+ "%), new elos: " + winner_newelo + ", " + loser_newelo);

        return [winner_newelo, loser_newelo];

}

var normalDistFunction = function(x, stdDev, mean) {
    return (1/(Math.sqrt(2*Math.PI)))*Math.pow(Math.E,-(Math.pow(x-mean,2)/(2*Math.pow(stdDev,2))));
}

var gaussianRandom = function(stdDev, mean) {
    return (Math.random()*2-1 + Math.random()*2-1 + Math.random()*2-1)*stdDev + mean;
}

var boxMuller = function() {
    var x1, x2, w, y1, y2;

    do {
        x1 = 2 * Math.random() - 1;
        x2 = 2 * Math.random() - 1;
        w = x1 * x1 + x2 * x2;
    } while ( w >= 1 );

    w = Math.sqrt(( -2 * Math.log(w))/w);

    y1 = x1*w;
    y2 = x2*w;

    return [y1, y2];
}
