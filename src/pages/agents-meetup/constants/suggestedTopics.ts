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
