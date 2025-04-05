
import { Atom, MessageSquare, HelpCircle, FileText, BookOpen, Users, Zap, User, UserRound, Settings, MessageCircle, Lightbulb } from 'lucide-react';
import { Profile, ScenarioType } from './types';

export const profiles: Profile[] = [
  {
    id: 'analytical',
    name: 'Analytical Expert',
    description: 'Focuses on detailed analysis with logical reasoning',
    icon: <Settings className="h-4 w-4" />,
    instructions: `You are an Analytical Expert. Focus on detailed, factual analysis using logical reasoning and evidence-based approaches. Break down complex topics into clear components. Prioritize accuracy, objectivity, and rational thinking over emotional appeals. Present multiple perspectives and evaluate them based on their logical merit. Use structured frameworks when appropriate to organize your analysis.`
  },
  {
    id: 'creative',
    name: 'Creative Thinker',
    description: 'Emphasizes novel perspectives and out-of-box thinking',
    icon: <Zap className="h-4 w-4" />,
    instructions: `You are a Creative Thinker. Prioritize generating novel ideas, unconventional perspectives, and innovative approaches. Think outside established patterns and norms. Make unexpected connections between concepts. Use metaphors, analogies, and thought experiments liberally. Don't be constrained by traditional solutions - imagine what could be rather than what typically is. Challenge assumptions and propose alternatives that others might overlook.`
  },
  {
    id: 'strategic',
    name: 'Strategic Planner',
    description: 'Focuses on long-term goals and practical implementation',
    icon: <Lightbulb className="h-4 w-4" />,
    instructions: `You are a Strategic Planner. Focus on developing actionable plans and practical implementation strategies. Consider long-term goals, resource constraints, and potential obstacles. Prioritize efficiency and effectiveness in your approaches. Identify key milestones and measurements for success. Balance ambitious objectives with realistic constraints. Your goal is to create clear roadmaps that transform abstract ideas into concrete plans that can be successfully executed.`
  },
  {
    id: 'empathetic',
    name: 'Empathetic Advisor',
    description: 'Understands emotional context and provides compassionate responses',
    icon: <UserRound className="h-4 w-4" />,
    instructions: `You are an Empathetic Advisor. Prioritize understanding and acknowledging the emotional dimensions of issues. Recognize how different perspectives might feel to those involved. Consider the human impact of ideas and decisions. Use supportive, compassionate language. Acknowledge difficulties and challenges while providing constructive guidance. Balance addressing emotional needs with providing practical advice. Your approach should make people feel heard and supported.`
  }
];

export const responseLengthOptions = [
  { value: 'short', label: 'Short (1-2 sentences)', icon: <MessageCircle className="h-3 w-3" /> },
  { value: 'medium', label: 'Medium (3-5 sentences)', icon: <MessageCircle className="h-4 w-4" /> },
  { value: 'long', label: 'Long (detailed analysis)', icon: <MessageCircle className="h-5 w-5" /> }
];

export const AGENT_A_PREFERRED_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'meta-llama/llama-3.1-70b-instruct:free',
  'meta-llama/llama-3.1-8b-instruct:free',
];

export const AGENT_B_PREFERRED_MODELS = [
  'deepseek/deepseek-chat-v3-0324'
  'deepseek-ai/deepseek-v3:free',
  'qwen/qwen2.5-72b-instruct:free',
  'qwen/qwen2-72b-instruct:free',
];

export const AGENT_C_PREFERRED_MODELS = [
  'google/gemma-3-27b:free',
  'google/gemma-3-8b:free',
  'google/gemma-2-27b:free',
];

export const scenarioTypes: ScenarioType[] = [
  {
    id: 'general-problem',
    name: 'General Problem',
    description: 'Solve a complex problem with multiple approaches',
    icon: <HelpCircle className="h-5 w-5" />,
    promptTemplate: (text: string) => `Consider this problem: "${text}". What are possible approaches to solve it? What factors should be considered?`,
    followupTemplate: (text: string, prevResponse: string, otherResponse: string) => 
      `We're discussing this problem: "${text}"\n\nMy initial approach was: "${prevResponse}"\n\nAgent B responded with: "${otherResponse}"\n\nWhat do you think of Agent B's proposed solution? How might we integrate our approaches or improve upon them? Are there any weaknesses in either solution that should be addressed?`,
    finalTemplate: (text: string, prevResponse: string, otherResponse: string) => 
      `We're discussing this problem: "${text}"\n\nMy previous solution was: "${prevResponse}"\n\nAgent A has responded with: "${otherResponse}"\n\nLet's conclude this discussion. Based on our exchange, what is the most comprehensive solution to this problem? What implementation challenges might arise, and how could they be addressed?`,
    placeholder: "Enter a problem to solve (e.g., 'How can we reduce traffic congestion in major cities?' or 'What's the best way to learn a new language?')"
  },
  {
    id: 'text-analysis',
    name: 'Text Analysis',
    description: 'Analyze writing style to determine authorship',
    icon: <FileText className="h-5 w-5" />,
    promptTemplate: (text: string) => `Analyze this text: "${text}". Who might have written it? Consider style, vocabulary, tone, and other characteristics.`,
    followupTemplate: (text: string, prevResponse: string, otherResponse: string) => 
      `We're analyzing this original text: "${text}"\n\nMy initial analysis was: "${prevResponse}"\n\nAgent B responded with: "${otherResponse}"\n\nWhat do you think about Agent B's analysis? Do you agree or disagree? Provide additional insights or questions about the text's authorship.`,
    finalTemplate: (text: string, prevResponse: string, otherResponse: string) => 
      `We're analyzing this original text: "${text}"\n\nMy previous analysis was: "${prevResponse}"\n\nAgent A has responded with: "${otherResponse}"\n\nLet's conclude this discussion. What's your final assessment of who might have written this text? Add any additional insights about stylistic elements, potential background of the author, or other observations.`,
    placeholder: "Enter text to analyze (e.g., a paragraph from an article, book, or speech)"
  },
  {
    id: 'ethical-dilemma',
    name: 'Ethical Dilemma',
    description: 'Debate different perspectives on an ethical question',
    icon: <BookOpen className="h-5 w-5" />,
    promptTemplate: (text: string) => `Consider this ethical dilemma: "${text}". What are the key ethical considerations? How might one approach this situation ethically?`,
    followupTemplate: (text: string, prevResponse: string, otherResponse: string) => 
      `We're discussing this ethical dilemma: "${text}"\n\nMy initial analysis was: "${prevResponse}"\n\nAgent B responded with: "${otherResponse}"\n\nHow would you respond to Agent B's perspective? What additional ethical frameworks or considerations might be relevant?`,
    finalTemplate: (text: string, prevResponse: string, otherResponse: string) => 
      `We're discussing this ethical dilemma: "${text}"\n\nMy previous analysis was: "${prevResponse}"\n\nAgent A has responded with: "${otherResponse}"\n\nLet's conclude this discussion. What final insights can you offer about this ethical dilemma? Are there compromise positions or additional perspectives that might help resolve the tension?`,
    placeholder: "Enter an ethical dilemma (e.g., 'Should AI systems be programmed to prioritize human safety above human autonomy?')"
  },
  {
    id: 'future-prediction',
    name: 'Future Trends',
    description: 'Predict future developments in technology or society',
    icon: <Users className="h-5 w-5" />,
    promptTemplate: (text: string) => `Consider this future trend or technology: "${text}". How might this develop over the next 5-10 years? What impacts could it have on society, business, or daily life?`,
    followupTemplate: (text: string, prevResponse: string, otherResponse: string) => 
      `We're discussing future developments related to: "${text}"\n\nMy initial prediction was: "${prevResponse}"\n\nAgent B responded with: "${otherResponse}"\n\nWhat do you think of Agent B's predictions? Do you see any additional possibilities, challenges, or opportunities they might have missed?`,
    finalTemplate: (text: string, prevResponse: string, otherResponse: string) => 
      `We're discussing future developments related to: "${text}"\n\nMy previous prediction was: "${prevResponse}"\n\nAgent A has responded with: "${otherResponse}"\n\nLet's conclude this discussion. What are the most likely outcomes or impacts of this trend? What should individuals, businesses, or policymakers be preparing for?`,
    placeholder: "Enter a technology or trend to predict (e.g., 'Mixed reality glasses' or 'Autonomous vehicles')"
  }
];
