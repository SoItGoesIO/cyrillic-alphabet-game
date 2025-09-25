// Game UI will be mounted here by React from the original script
// This module serves as a bridge between the React game and the modular system
import { LETTERS } from './letters.js';
import { playAudio } from './audio.js';
import { rpc } from '../db/rpc.js';

// Export the game for mounting
export function mountGame(containerId) {
  // The original React component will be loaded separately
  // This is just a placeholder for now
  console.log('Game mounted in:', containerId);
}

// Quiz completion handler that integrates with XP system
export async function saveQuizResults(score, totalQuestions) {
  const perfectScore = score === totalQuestions * 10; // assuming 10 points per question
  const bonus = perfectScore ? 1 : 0;
  
  try {
    const { data, error } = await rpc('complete_quiz', { 
      p_score: score, 
      p_perfect_bonus: bonus 
    });
    
    if (error) throw error;
    
    const result = Array.isArray(data) ? data[0] : data;
    return {
      sessionId: result.session_id,
      totalXP: result.new_total_xp,
      level: result.new_level,
      wasePerfect: perfectScore
    };
  } catch (error) {
    console.error('Failed to save quiz results:', error);
    throw error;
  }
}

export { LETTERS, playAudio };