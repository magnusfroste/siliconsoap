// Soap opera inspired names for agents
// Uses the same name pools as user display names for consistency

const SOAP_FIRST_NAMES = [
  'J.R.', 'Alexis', 'Blake', 'Krystle', 'Fallon',
  'Ridge', 'Brooke', 'Stephanie', 'Eric', 'Taylor',
  'Victor', 'Nikki', 'Jack', 'Erica', 'Tad',
  'Luke', 'Laura', 'Sonny', 'Carly', 'Jason',
  'Bo', 'Hope', 'Marlena', 'John', 'Stefano',
  'Rachel', 'Ross', 'Monica', 'Chandler', 'Phoebe',
  'Carrie', 'Samantha', 'Charlotte', 'Miranda', 'Big',
  'Don', 'Peggy', 'Betty', 'Joan', 'Roger',
  'Serena', 'Blair', 'Chuck', 'Nate', 'Dan'
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

/**
 * Get a deterministic soap opera name for an agent based on agent letter and persona
 * Same agent + persona combination will always return the same name
 */
export function getAgentSoapName(agent: string, persona: string): string {
  const combinedKey = `${agent}-${persona}`;
  const hash = hashString(combinedKey);
  
  const firstNameIndex = hash % SOAP_FIRST_NAMES.length;
  const lastNameIndex = (hash >> 4) % SOAP_LAST_NAMES.length;
  
  const firstName = SOAP_FIRST_NAMES[firstNameIndex];
  const lastName = SOAP_LAST_NAMES[lastNameIndex];
  
  return `${firstName} ${lastName}`;
}

/**
 * Extract just the agent letter from agent string (e.g., "Agent A" -> "A")
 */
export function getAgentLetter(agent: string): string {
  return agent.replace('Agent ', '');
}
