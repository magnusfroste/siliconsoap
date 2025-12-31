// Soap opera inspired names for agents
// Separated by gender to match TTS voices

const MALE_FIRST_NAMES = [
  'J.R.', 'Blake', 'Ridge', 'Eric', 'Victor',
  'Jack', 'Tad', 'Luke', 'Sonny', 'Jason',
  'Bo', 'John', 'Stefano', 'Ross', 'Chandler',
  'Big', 'Don', 'Roger', 'Chuck', 'Nate', 'Dan'
];

const FEMALE_FIRST_NAMES = [
  'Alexis', 'Krystle', 'Fallon', 'Brooke', 'Stephanie',
  'Taylor', 'Nikki', 'Erica', 'Laura', 'Carly',
  'Hope', 'Marlena', 'Rachel', 'Monica', 'Phoebe',
  'Carrie', 'Samantha', 'Charlotte', 'Miranda',
  'Peggy', 'Betty', 'Joan', 'Serena', 'Blair'
];

const SOAP_LAST_NAMES = [
  'Ewing', 'Carrington', 'Colby', 'Forrester', 'Newman',
  'Abbott', 'Chancellor', 'Kane', 'Martin', 'Quartermaine',
  'Spencer', 'Corinthos', 'Brady', 'DiMera', 'Horton',
  'Buchanan', 'Chandler', 'Santos', 'Montgomery', 'Hayward',
  'van der Woodsen', 'Waldorf', 'Bass', 'Archibald', 'Humphrey',
  'Bradshaw', 'York', 'Hobbes', 'Sterling', 'Draper'
];

/**
 * Simple hash function to create a deterministic number from a string
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

export type AgentGender = 'male' | 'female';

/**
 * Determine gender based on agent letter for consistent voice matching
 * Agent A = male, Agent B = female, Agent C = male
 */
export function getAgentGender(agent: string): AgentGender {
  const letter = agent.replace('Agent ', '');
  // A and C are male, B is female
  return letter === 'B' ? 'female' : 'male';
}

/**
 * Get a deterministic soap opera name for an agent based on agent letter and persona
 * The gender is determined by the agent letter to match TTS voices
 */
export function getAgentSoapName(agent: string, persona: string, usedFirstNames: Set<string> = new Set()): string {
  const gender = getAgentGender(agent);
  const combinedKey = `${agent}-${persona}`;
  const hash = hashString(combinedKey);
  
  const firstNames = gender === 'male' ? MALE_FIRST_NAMES : FEMALE_FIRST_NAMES;
  let firstNameIndex = hash % firstNames.length;
  let firstName = firstNames[firstNameIndex];
  
  // Ensure unique first name by trying next names if collision
  let attempts = 0;
  while (usedFirstNames.has(firstName) && attempts < firstNames.length) {
    firstNameIndex = (firstNameIndex + 1) % firstNames.length;
    firstName = firstNames[firstNameIndex];
    attempts++;
  }
  
  const lastNameIndex = (hash >> 4) % SOAP_LAST_NAMES.length;
  const lastName = SOAP_LAST_NAMES[lastNameIndex];
  
  return `${firstName} ${lastName}`;
}

/**
 * Generate unique soap opera names for multiple agents
 * Ensures no two agents share the same first name
 */
export function getAgentSoapNames(agents: Array<{ agent: string; persona: string }>): Map<string, string> {
  const usedFirstNames = new Set<string>();
  const names = new Map<string, string>();
  
  for (const { agent, persona } of agents) {
    const fullName = getAgentSoapName(agent, persona, usedFirstNames);
    const firstName = fullName.split(' ')[0];
    usedFirstNames.add(firstName);
    names.set(agent, fullName);
  }
  
  return names;
}

/**
 * Extract just the agent letter from agent string (e.g., "Agent A" -> "A")
 */
export function getAgentLetter(agent: string): string {
  return agent.replace('Agent ', '');
}
