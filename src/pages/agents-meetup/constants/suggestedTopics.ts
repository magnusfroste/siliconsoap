/**
 * Curated suggested topics for each scenario type
 * 30 topics per scenario, with 3 shown randomly to users
 */

export const suggestedTopicsByScenario: Record<string, string[]> = {
  'general-problem': [
    // AI & Technology Policy
    "How should AI development be regulated?",
    "Should social media platforms be liable for user content?",
    "How to address algorithmic bias in hiring?",
    "Should there be a global AI governance body?",
    "How to balance innovation with tech regulation?",
    
    // Economic Policy
    "Is Universal Basic Income viable?",
    "How should countries handle trade tariffs?",
    "Should cryptocurrency be regulated like traditional finance?",
    "How to address the gig economy worker rights?",
    "Is a four-day work week sustainable?",
    
    // Social Issues
    "How to solve the housing affordability crisis?",
    "What's the best approach to healthcare reform?",
    "How should immigration policy be modernized?",
    "How to address the mental health crisis?",
    "Should college education be free?",
    
    // Environment & Energy
    "What's the fastest path to net-zero emissions?",
    "Should nuclear energy be expanded?",
    "How to address water scarcity globally?",
    "Is carbon taxation effective?",
    "How should electric vehicle adoption be accelerated?",
    
    // Governance & Security
    "How to combat online misinformation?",
    "Should voting be mandatory?",
    "How to balance data privacy with national security?",
    "What's the best approach to police reform?",
    "How should cybersecurity be strengthened nationally?",
    
    // Infrastructure & Society
    "How to modernize public transportation?",
    "Should remote work be a legal right?",
    "How to address the digital divide?",
    "What's the solution to student debt?",
    "How to prepare for an aging population?"
  ],
  
  'ethical-dilemma': [
    // AI Ethics
    "Should AI systems have legal rights?",
    "Is it ethical to use AI in criminal sentencing?",
    "Should AI-generated art have copyright protection?",
    "Is it ethical to create AI companions for lonely people?",
    "Should autonomous weapons be banned internationally?",
    
    // Bioethics
    "Is gene editing human embryos ethical?",
    "Should designer babies be allowed?",
    "Is it ethical to extend human lifespan indefinitely?",
    "Should human cloning ever be permitted?",
    "Is animal testing still justified?",
    
    // Privacy & Surveillance
    "Is mass surveillance ever justified for security?",
    "Should there be a right to be forgotten online?",
    "Is it ethical to monitor employees remotely?",
    "Should facial recognition be banned in public spaces?",
    "Is selling personal data ever ethical?",
    
    // Society & Justice
    "Is it ethical to have billionaires?",
    "Should countries accept unlimited climate refugees?",
    "Is cancel culture a form of justice or mob rule?",
    "Should corporations have the same rights as people?",
    "Is it ethical to use social credit systems?",
    
    // Technology & Consent
    "Is it ethical to use deepfakes for entertainment?",
    "Should brain-computer interfaces require special consent?",
    "Is it ethical to create digital copies of deceased loved ones?",
    "Should children be allowed on social media?",
    "Is planned obsolescence in tech ethical?",
    
    // Life & Death
    "Should assisted dying be a universal right?",
    "Is it ethical to prioritize younger patients in healthcare?",
    "Should organ donation be opt-out by default?",
    "Is it ethical to use performance-enhancing drugs in sports?",
    "Should we genetically modify humans to prevent disease?"
  ],
  
  'future-prediction': [
    // AI & AGI
    "Will AGI arrive by 2030?",
    "Will AI replace most white-collar jobs?",
    "Will AI achieve consciousness?",
    "Will AI-human relationships become normalized?",
    "Will AI enable scientific breakthroughs we can't imagine?",
    
    // Space & Exploration
    "Will humans colonize Mars by 2050?",
    "Will asteroid mining become a major industry?",
    "Will we discover extraterrestrial life this century?",
    "Will space tourism become affordable?",
    "Will we build permanent lunar settlements?",
    
    // Biotechnology
    "Will we achieve longevity escape velocity?",
    "Will lab-grown meat replace traditional farming?",
    "Will personalized medicine cure most diseases?",
    "Will brain-computer interfaces become mainstream?",
    "Will we reverse aging in our lifetime?",
    
    // Energy & Environment
    "Will fusion energy be commercialized by 2040?",
    "Will we successfully geoengineer the climate?",
    "Will renewable energy make fossil fuels obsolete?",
    "Will vertical farming revolutionize agriculture?",
    "Will carbon capture solve climate change?",
    
    // Society & Economy
    "Will cash become completely obsolete?",
    "Will the metaverse replace physical offices?",
    "Will universal basic income become global?",
    "Will nation-states become less relevant?",
    "Will we achieve a post-scarcity economy?",
    
    // Technology
    "Will quantum computers break current encryption?",
    "Will humanoid robots be common in homes?",
    "Will flying cars become practical transportation?",
    "Will holographic communication replace video calls?",
    "Will neural implants enhance human intelligence?"
  ],

  // Hot debate topics from seeding - curated 2025 discussions
  'hot-debates': [
    "Will AGI arrive within 5 years?",
    "EU AI Act: Good or bad for innovation?",
    "Should AI-generated art be protected by copyright?",
    "Will AI replace programmers?",
    "Open-source AI vs closed models - which is safer?",
    "AI in schools: Cheating tool or future of education?",
    "Can AI solve the climate crisis?",
    "Should AI models be regulated like pharmaceuticals?",
    "Deepfakes and democracy: The invisible threat",
    "Who owns the data that trains AI?",
    "AI assistants: Friend or foe?",
    "The biggest AI breakthroughs of 2025"
  ]
};

/**
 * Get random topics from a list
 * @param topics - Array of topic strings
 * @param count - Number of random topics to return (default: 3)
 * @returns Array of randomly selected topics
 */
export function getRandomTopics(topics: string[], count: number = 3): string[] {
  const shuffled = [...topics].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
