export default {
  schulze: {
    title: "Metodo Schulze (Il Vincitore di Condorcet)",
    subtitle: "Il sistema preferito da Debian, Ubuntu e Pirate Party.",
    history: "Sviluppato nel 1997 da Markus Schulze, questo metodo è progettato per soddisfare il criterio di Condorcet: se esiste un candidato che sconfiggerebbe tutti gli altri in un confronto testa a testa, quel candidato deve vincere.",
    mechanism: "Il sistema immagina un torneo 'tutti contro tutti'. Se i votanti preferiscono A rispetto a B, si traccia una freccia da A a B. L'algoritmo calcola poi i 'percorsi più forti' (beatpaths) nel grafo risultante per determinare il vincitore indiscusso, risolvendo anche i paradossi ciclici (Sasso-Carta-Forbice).",
    pros: "Immune ai candidati 'clone' e altamente resistente al voto strategico.",
    cons: "Complesso da calcolare manualmente senza un computer."
  },
  borda: {
    title: "Conteggio di Borda",
    subtitle: "La ricerca del massimo consenso medio.",
    history: "Proposto nel 1770 dal matematico Jean-Charles de Borda per l'Accademia delle Scienze francese, come alternativa al voto di maggioranza semplice.",
    mechanism: "È un sistema a punteggio posizionale. In una elezione con N candidati, la tua prima scelta riceve N-1 punti, la seconda N-2, e così via. Chi totalizza più punti vince.",
    pros: "Premia i candidati ampiamente accettati, anche se non sono la prima scelta assoluta di nessuno (candidati di compromesso).",
    cons: "Vulnerabile al 'voto tattico': si può affossare un rivale mettendolo volutamente ultimo."
  },
  weighted: {
    title: "Media Pesata (Score Voting)",
    subtitle: "Il metodo classico, potenziato dai pesi.",
    history: "La forma più intuitiva di valutazione, utilizzata ovunque, dalle recensioni su Amazon alle Olimpiadi.",
    mechanism: "Ogni utente assegna un voto numerico (es. 0-10) a ciascun candidato per diversi criteri. Il sistema calcola la media ponderata in base all'importanza (peso) di ogni criterio.",
    pros: "Estremamente facile da capire. Permette di esprimere l'intensità della preferenza (un 10 è molto diverso da un 6).",
    cons: "Soggetto alla distorsione della scala personale (chi vota sempre alto vs chi vota sempre basso)."
  },
  z_score: {
    title: "Normalizzazione Z-Score",
    subtitle: "Matematica per l'equità di giudizio.",
    history: "Un concetto fondamentale della statistica (Punteggio Standard) applicato al voto sociale.",
    mechanism: "Invece di usare il voto grezzo, calcoliamo quanto il tuo voto si discosta dalla TUA media personale. Formula: (Voto - MediaUtente) / DeviazioneStandard. Se voti sempre tra 4 e 6, un 7 diventa un voto eccezionale!",
    pros: "Rende il voto di un giudice 'severo' matematicamente equivalente a quello di un giudice 'generoso'.",
    cons: "I risultati intermedi (es. +1.5 o -0.8) sono poco intuitivi per i non addetti ai lavori."
  },
  jolly: {
    title: "Il Voto Jolly (Golden Vote)",
    subtitle: "Quando la logica non basta.",
    history: "Una meccanica di 'game design' introdotta per catturare l'aspetto emotivo della scelta.",
    mechanism: "Ogni utente ha a disposizione UN solo Jolly per l'intera lobby. Usandolo su un candidato, il peso del proprio voto per quel candidato viene amplificato (es. +25%).",
    pros: "Permette di esprimere una preferenza viscerale ('È la mia pizza preferita!') che va oltre i singoli criteri tecnici.",
    cons: "Può alterare leggermente l'oggettività dell'analisi tecnica."
  }
}