const encyclopedia = {
  weighted: {
    title: "Weighted Average",
    subtitle: "The democratic classic with a touch of precision.",
    history: "Derived from the arithmetic mean, used since the Pythagoreans. Adding 'weights' allows prioritizing certain criteria over others.",
    mechanism: "Each voter rates candidates on various criteria. The final score is the sum of ratings multiplied by criteria weights.",
    pros: "Easy to understand; captures nuances across multiple dimensions.",
    cons: "Vulnerable to tactical voting (giving extreme scores); doesn't guarantee a majority winner."
  },
  borda: {
    title: "Borda Count",
    subtitle: "Rewards consensus, not just popularity.",
    history: "Proposed by Jean-Charles de Borda in 1770 for the French Academy of Sciences as an alternative to simple majority voting.",
    mechanism: "If there are 5 candidates, your 1st choice gets 4 points, 2nd gets 3, etc. Points from all voters are summed.",
    pros: "Selects broadly acceptable candidates; reduces the impact of polarizing figures.",
    cons: "Can be manipulated by introducing 'clone' candidates to split opponents' votes."
  },
  schulze: {
    title: "Schulze Method (Beatpath)",
    subtitle: "The King of Condorcet methods. Mathematically superior.",
    history: "Developed by Markus Schulze in 1997. Used by Debian, Ubuntu, and Pirate Parties for its robustness.",
    mechanism: "Compares every candidate against every other (duels). If A beats B more often than B beats A, a path is formed. The winner is the one who beats everyone else on the strongest paths.",
    pros: "Satisfies the Condorcet criterion; immune to many manipulative strategies.",
    cons: "Complex to calculate manually and hard to explain intuitively."
  }
}

export default encyclopedia