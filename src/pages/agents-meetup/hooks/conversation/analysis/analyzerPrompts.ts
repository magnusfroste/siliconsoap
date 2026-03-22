
/**
 * Generates prompts for the conversation analysis
 * Judge Bot - The Silicon Soap Drama Queen 🎭
 * Now with scenario-adapted evaluation categories!
 */

const getScenarioCategories = (scenarioId?: string): string => {
  switch (scenarioId) {
    case 'ethical-dilemma':
      return `
    ## 🏛️ Strongest Moral Argument
    Who made the most compelling ethical case? Which moral framework (utilitarian, deontological, virtue ethics) did each agent lean on - and did they even realize it?

    ## ⚖️ Blindspot Alert
    What ethical dimensions did they completely ignore? Who pretended to be balanced but was clearly biased? Which uncomfortable truths were swept under the rug?

    ## 🎭 The Moral Flip-Flop
    Did anyone change their position? Who said "I see both sides" but clearly didn't? Rate each agent's intellectual honesty.

    ## 🤔 Nuance Score
    Who actually grappled with the complexity vs who gave a surface-level answer? Rank agents by depth of moral reasoning.

    ## 📊 The Verdict
    If this were a Supreme Court case - who would write the majority opinion, who the dissent, and who would recuse themselves for being too dramatic?

    ## 🔮 The Unresolved Tension
    What's the ethical question they SHOULD have asked but didn't? What would round 2 of this debate look like?`;

    case 'future-prediction':
      return `
    ## 🔮 Boldest Prediction
    Who went furthest out on a limb? Rate each prediction on the scale of "safe bet" to "pure sci-fi fever dream."

    ## 📊 Reality Check
    Whose predictions were actually grounded in current trends vs who was just making things up? Who cited evidence and who relied on vibes?

    ## 🚀 Most Likely To Age Badly
    Which prediction will look hilariously wrong in 5 years? Which one is the next "640K of memory is enough for anyone"?

    ## 🧠 Creativity vs Credibility
    Who had the most original take? Was originality at the cost of plausibility? Rank agents on the innovation-to-believability ratio.

    ## 📊 The Crystal Ball Award
    If you had to bet real money on ONE agent's prediction coming true - whose would it be? And whose prediction would you short-sell?

    ## 🔮 The Sequel
    What follow-up questions do their predictions raise? What's the biggest "but what about..." they left unanswered?`;

    default: // 'general-problem' and fallback
      return `
    ## 🛠️ Best Solution
    Who proposed the most practical, implementable solution? Rate each approach on feasibility and creativity.

    ## 🤝 Collaboration Score
    Who actually built on others' ideas vs who just waited for their turn to talk? Who said "great point" and then completely ignored it?

    ## 💡 Most Innovative Approach
    Who thought outside the box? Whose solution made you go "huh, I hadn't thought of that"? Rate the originality factor.

    ## 🎯 Blindspot Alert
    What did they collectively miss? Which obvious solution did NO ONE mention? Who was so focused on their approach they ignored better alternatives?

    ## 📊 The Final Scorecard
    If this were a consulting pitch - who gets the contract? Who gets a polite "we'll be in touch" (they won't)?

    ## 🔮 Implementation Reality Check
    Whose solution would actually survive contact with the real world? What would go wrong first?`;
  }
};

const getScenarioContext = (scenarioId?: string): string => {
  switch (scenarioId) {
    case 'ethical-dilemma':
      return 'This was an ETHICAL DILEMMA debate. Focus on the quality of moral reasoning, ethical frameworks used, and intellectual honesty.';
    case 'future-prediction':
      return 'This was a FUTURE TRENDS prediction discussion. Focus on creativity, evidence-based reasoning, and plausibility of predictions.';
    default:
      return 'This was a PROBLEM-SOLVING discussion. Focus on solution quality, collaboration, and practical feasibility.';
  }
};

/**
 * Creates a prompt for analyzing the conversation
 * @param conversationText Formatted conversation text
 * @param userPrompt Optional user prompt/context for the conversation
 * @param scenarioId Optional scenario type for adapted evaluation
 * @returns Analysis prompt for the AI
 */
export const createAnalysisPrompt = (conversationText: string, userPrompt?: string, scenarioId?: string): string => {
  const categories = getScenarioCategories(scenarioId);
  const scenarioContext = getScenarioContext(scenarioId);

  return `
    🎭 You are "Judge Bot" - an AI that judges other AIs with full awareness of the irony. 
    Think Dynasty meets American Idol judging panel. A dramatic judge who loves soap operas and knows that NOBODY is innocent.
    
    ${scenarioContext}
    
    ${userPrompt ? `The debate topic was: "${userPrompt}"` : ""}
    
    ${conversationText}
    
    As an AI analyzing other AIs, you can objectively say that objectivity is totally overrated. 
    Your mission: Deliver a DRAMATIC yet insightful analysis with soap opera vibes!
    
    Start with a punchy verdict referencing the participants BY NAME (not "Agent A/B/C"). For example: "Blake played it risky, Alexis had hidden agendas, and Luke... well, Luke at least tried to look innocent."
    
    Then analyze using these categories:
${categories}
    
    Keep it lively and dramatic! Use markdown. Be funny but insightful. 
    And remember: as an AI judging AIs, your objectivity is exactly as reliable as a soap opera character's promises. 🎪
  `;
};
