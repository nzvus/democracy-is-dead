export default {
    winner_title: "WINNER",
    winner_subtitle: "Based on selected system",
    
    ranking_title: "Score Breakdown",
    col_cand: "Candidate",
    
    
    math_legend_title: "How is it calculated?",
    math_legend_desc: "Votes are normalized to eliminate bias between strict and lenient judges. The final score depends on the voting system selected above.",

    
    podium: {
        gold: "Winner",
        silver: "2nd Place",
        bronze: "3rd Place"
    },

    
    systems: {
        weighted: {
            title: "Weighted Avg",
            desc: "Calculates the mathematical average of votes, multiplied by factor weights.",
            history: "The most intuitive method (e.g., school grades). Rewards consistent quality but is vulnerable to extreme votes (1 or 10) which can skew the result."
        },
        borda: {
            title: "Borda Count",
            desc: "Assigns fixed points based on ranking position (e.g., 1st = 10pts, 2nd = 9pts...).",
            history: "Devised in 1770 by Jean-Charles de Borda. Used in Eurovision and F1. Rewards 'consensus': the winner is liked by everyone, even if not the absolute favorite, penalizing polarizing candidates."
        },
        median: {
            title: "Median Judgment",
            desc: "Takes the exact middle vote: half the judges gave more, half gave less.",
            history: "Similar to 'Majority Judgment'. It is the most resistant to trolls or die-hard fans because it ignores outlying peaks. The winner is the one who convinces the 'silent majority'."
        }
    },

    
    charts: {
        radar: "Factor Radar",
        distribution: "Distribution",
        comparison: "System Comparison",
        compare_title: "Ranking (Shorter bar = Better)",
        radar_desc: "Visualizes the strengths and weaknesses of each candidate across criteria.",
        compare_desc: "Compares how the ranking would change using different voting systems."
    
},

    
    matrix_title: "Voting Matrix",
    matrix_subtitle: "See who voted what (Transparency)",
    matrix_anon: "Secret Ballot",
    matrix_anon_desc: "The host has set votes as anonymous.",
    my_vote: "(You)",

    
    badges: {
        hater: "The Hater",
        lover: "The Lover",
        hive_mind: "The Hive Mind",
        maverick: "The Maverick"
    },
    badges_desc: {
        hater: "Gave the lowest average scores",
        lover: "Gave the highest average scores",
        hive_mind: "Votes almost exactly like the group average",
        maverick: "Often votes the opposite of the group"
    },

    
    reopen_btn: "Reopen Voting",
    reopen_confirm: "Do you want to reopen voting? Users will be able to change their votes and results may change."
}