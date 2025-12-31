import { describe, it, expect } from 'vitest';
import { getAgentGender, getAgentSoapName, getAgentLetter } from '../agentNameGenerator';

describe('agentNameGenerator', () => {
  describe('getAgentGender', () => {
    it('should return male for Agent A', () => {
      expect(getAgentGender('Agent A')).toBe('male');
    });

    it('should return female for Agent B', () => {
      expect(getAgentGender('Agent B')).toBe('female');
    });

    it('should return male for Agent C', () => {
      expect(getAgentGender('Agent C')).toBe('male');
    });

    it('should handle agent strings without "Agent " prefix', () => {
      expect(getAgentGender('A')).toBe('male');
      expect(getAgentGender('B')).toBe('female');
      expect(getAgentGender('C')).toBe('male');
    });
  });

  describe('getAgentSoapName', () => {
    it('should return deterministic names for same agent and persona', () => {
      const name1 = getAgentSoapName('Agent A', 'Optimistic');
      const name2 = getAgentSoapName('Agent A', 'Optimistic');
      
      expect(name1).toBe(name2);
      expect(name1).toBeTruthy();
      expect(name1.split(' ')).toHaveLength(2); // First name and last name
    });

    it('should return different names for different personas', () => {
      const name1 = getAgentSoapName('Agent A', 'Optimistic');
      const name2 = getAgentSoapName('Agent A', 'Pessimistic');
      
      expect(name1).not.toBe(name2);
    });

    it('should return different names for different agents', () => {
      const name1 = getAgentSoapName('Agent A', 'Optimistic');
      const name2 = getAgentSoapName('Agent B', 'Optimistic');
      
      expect(name1).not.toBe(name2);
    });

    it('should return male names for Agent A', () => {
      const maleFirstNames = [
        'J.R.', 'Blake', 'Ridge', 'Eric', 'Victor',
        'Jack', 'Tad', 'Luke', 'Sonny', 'Jason',
        'Bo', 'John', 'Stefano', 'Ross', 'Chandler',
        'Big', 'Don', 'Roger', 'Chuck', 'Nate', 'Dan'
      ];
      
      const name = getAgentSoapName('Agent A', 'Optimistic');
      const firstName = name.split(' ')[0];
      
      expect(maleFirstNames).toContain(firstName);
    });

    it('should return female names for Agent B', () => {
      const femaleFirstNames = [
        'Alexis', 'Krystle', 'Fallon', 'Brooke', 'Stephanie',
        'Taylor', 'Nikki', 'Erica', 'Laura', 'Carly',
        'Hope', 'Marlena', 'Rachel', 'Monica', 'Phoebe',
        'Carrie', 'Samantha', 'Charlotte', 'Miranda',
        'Peggy', 'Betty', 'Joan', 'Serena', 'Blair'
      ];
      
      const name = getAgentSoapName('Agent B', 'Optimistic');
      const firstName = name.split(' ')[0];
      
      expect(femaleFirstNames).toContain(firstName);
    });

    it('should return male names for Agent C', () => {
      const maleFirstNames = [
        'J.R.', 'Blake', 'Ridge', 'Eric', 'Victor',
        'Jack', 'Tad', 'Luke', 'Sonny', 'Jason',
        'Bo', 'John', 'Stefano', 'Ross', 'Chandler',
        'Big', 'Don', 'Roger', 'Chuck', 'Nate', 'Dan'
      ];
      
      const name = getAgentSoapName('Agent C', 'Optimistic');
      const firstName = name.split(' ')[0];
      
      expect(maleFirstNames).toContain(firstName);
    });

    it('should always include a last name from the soap opera list', () => {
      const soapLastNames = [
        'Ewing', 'Carrington', 'Colby', 'Forrester', 'Newman',
        'Abbott', 'Chancellor', 'Kane', 'Martin', 'Quartermaine',
        'Spencer', 'Corinthos', 'Brady', 'DiMera', 'Horton',
        'Buchanan', 'Chandler', 'Santos', 'Montgomery', 'Hayward',
        'van der Woodsen', 'Waldorf', 'Bass', 'Archibald', 'Humphrey',
        'Bradshaw', 'York', 'Hobbes', 'Sterling', 'Draper'
      ];
      
      const name = getAgentSoapName('Agent A', 'Optimistic');
      const parts = name.split(' ');
      const lastName = parts.slice(1).join(' '); // Handle multi-word last names
      
      expect(soapLastNames).toContain(lastName);
    });

    it('should handle various persona strings', () => {
      const personas = ['Optimistic', 'Pessimistic', 'Analytical', 'Creative', 'Skeptical'];
      
      personas.forEach(persona => {
        const name = getAgentSoapName('Agent A', persona);
        expect(name).toBeTruthy();
        expect(name.split(' ').length).toBeGreaterThanOrEqual(2);
      });
    });

    it('should be consistent across multiple calls', () => {
      const calls = Array.from({ length: 10 }, () => 
        getAgentSoapName('Agent A', 'Optimistic')
      );
      
      const allSame = calls.every(name => name === calls[0]);
      expect(allSame).toBe(true);
    });
  });

  describe('getAgentLetter', () => {
    it('should extract letter from "Agent A"', () => {
      expect(getAgentLetter('Agent A')).toBe('A');
    });

    it('should extract letter from "Agent B"', () => {
      expect(getAgentLetter('Agent B')).toBe('B');
    });

    it('should extract letter from "Agent C"', () => {
      expect(getAgentLetter('Agent C')).toBe('C');
    });

    it('should return unchanged if no "Agent " prefix', () => {
      expect(getAgentLetter('A')).toBe('A');
      expect(getAgentLetter('B')).toBe('B');
    });
  });

  describe('deterministic behavior', () => {
    it('should generate same name for same inputs regardless of call order', () => {
      const combinations = [
        ['Agent A', 'Optimistic'],
        ['Agent B', 'Pessimistic'],
        ['Agent C', 'Analytical']
      ];
      
      // Generate names in one order
      const firstRun = combinations.map(([agent, persona]) => 
        getAgentSoapName(agent, persona)
      );
      
      // Generate names in reverse order
      const secondRun = [...combinations].reverse().map(([agent, persona]) => 
        getAgentSoapName(agent, persona)
      ).reverse();
      
      expect(firstRun).toEqual(secondRun);
    });
  });
});
