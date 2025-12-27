export default {
  schulze: {
    title: "Schulze Method (Condorcet Winner)",
    subtitle: "The system of choice for Debian, Ubuntu, and the Pirate Party.",
    history: "Developed in 1997 by Markus Schulze, this method is designed to satisfy the Condorcet criterion: if there is a candidate who would beat every other candidate in a head-to-head challenge, that candidate must win.",
    mechanism: "The system imagines a 'round-robin' tournament. If voters prefer A over B, an arrow is drawn from A to B. The algorithm then calculates the 'strongest paths' (beatpaths) in the resulting graph to determine the undisputed winner, elegantly solving cyclic paradoxes (Rock-Paper-Scissors).",
    pros: "Immune to 'clone' candidates and highly resistant to strategic voting.",
    cons: "Complex to calculate manually without a computer."
  },
  borda: {
    title: "Borda Count",
    subtitle: "The search for maximum average consensus.",
    history: "Proposed in 1770 by mathematician Jean-Charles de Borda for the French Academy of Sciences as an alternative to simple majority voting.",
    mechanism: "It is a positional scoring system. In an election with N candidates, your first choice receives N-1 points, the second N-2, and so on. The candidate with the most total points wins.",
    pros: "Rewards candidates who are broadly accepted, even if they aren't anyone's absolute first choice (compromise candidates).",
    cons: "Vulnerable to 'tactical voting': one can bury a rival by intentionally placing them last."
  },
  weighted: {
    title: "Weighted Average (Score Voting)",
    subtitle: "The classic method, powered by weights.",
    history: "The most intuitive form of evaluation, used everywhere from Amazon reviews to the Olympics.",
    mechanism: "Each user assigns a numerical score (e.g., 0-10) to each candidate for various criteria. The system calculates the weighted average based on the importance (weight) of each criterion.",
    pros: "Extremely easy to understand. Allows expressing the intensity of preference (a 10 is very different from a 6).",
    cons: "Subject to personal scale bias (voters who always rate high vs. those who always rate low)."
  },
  z_score: {
    title: "Z-Score Normalization",
    subtitle: "Mathematics for judgment fairness.",
    history: "A fundamental concept of statistics (Standard Score) applied to social voting.",
    mechanism: "Instead of using the raw vote, we calculate how much your vote deviates from YOUR personal average. Formula: (Vote - UserMean) / StdDev. If you always vote between 4 and 6, a 7 becomes an exceptional score!",
    pros: "Makes the vote of a 'harsh' judge mathematically equivalent to that of a 'generous' judge.",
    cons: "Intermediate results (e.g., +1.5 or -0.8) are unintuitive for non-experts."
  },
  jolly: {
    title: "The Jolly Vote (Golden Vote)",
    subtitle: "When logic isn't enough.",
    history: "A 'game design' mechanic introduced to capture the emotional aspect of choice.",
    mechanism: "Each user has exactly ONE Jolly available for the entire lobby. By using it on a candidate, the weight of their vote for that candidate is amplified (e.g., +25%).",
    pros: "Allows expressing a visceral preference ('It's my favorite pizza!') that goes beyond individual technical criteria.",
    cons: "Can slightly alter the objectivity of the technical analysis."
  }
}