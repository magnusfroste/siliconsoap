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
export function getAgentSoapName(agent: string, persona: string): string {
  const gender = getAgentGender(agent);
  const combinedKey = `${agent}-${persona}`;
  const hash = hashString(combinedKey);
  
  const firstNames = gender === 'male' ? MALE_FIRST_NAMES : FEMALE_FIRST_NAMES;
  const firstNameIndex = hash % firstNames.length;
  const lastNameIndex = (hash >> 4) % SOAP_LAST_NAMES.length;
  
  const firstName = firstNames[firstNameIndex];
  const lastName = SOAP_LAST_NAMES[lastNameIndex];
  
  return `${firstName} ${lastName}`;
}

/**
 * Extract just the agent letter from agent string (e.g., "Agent A" -> "A")
 */
export function getAgentLetter(agent: string): string {
  return agent.replace('Agent ', '');
}
