const results = {
  ranking_title: "Final Ranking",
  matrix_title: "Detailed Vote Matrix",
  matrix_subtitle: "Raw scores assigned by each participant.",
  
  reopen_btn: "Reopen Voting",
  reopen_confirm: "Are you sure? This allows users to change their votes again.",
  
  math_legend_desc: "How scores are calculated based on the selected algorithm.",
  
  matrix_anon: "Anonymous User",
  my_vote: "(You)",

  systems: {
    weighted: {
      title: "Weighted Average",
      desc: "Classic average of scores weighted by criteria importance."
    },
    borda: {
      title: "Borda Count",
      desc: "Points assigned based on position in each user's ranking."
    },
    schulze: {
      title: "Schulze Method",
      desc: "Condorcet method based on strongest paths in pairwise duels."
    },
    median: {
      title: "Median Rating",
      desc: "The middle score, robust against extreme votes."
    }
  },

  charts: {
    radar: "Radar Analysis",
    radar_desc: "Comparison of strengths across different criteria.",
    comparison: "Algorithm Comparison",
    comparison_desc: "How the winner changes depending on the math used.",
    compare_title: "Winners by System"
  },

  schulze_matrix: {
    title: "Duel Matrix",
    subtitle: "Pairwise Analysis: Read the row to see how many times that candidate beat the others (Row > Column).",
    wins: "Wins",
    loses: "Loses",
    ties: "Ties"
  },

  badges: {
    title: "Awards",
    hater: "The Hater",
    lover: "The Lover",
    contrarian: "The Contrarian",
    oracle: "The Oracle",
    hive_mind: "Hive Mind"
  },

  badges_desc: {
     hater: "Gave the lowest average scores.",
     lover: "Gave the highest average scores.",
     contrarian: "Often disagrees with the majority.",
     oracle: "Predicted the winner perfectly.",
     hive_mind: "Votes align closely with the group average."
  }
}

export default results