import { LETTERS } from './letters.js';
import { playAudio } from './audio.js';
import { completeLetter, getLetterXP, initializeCyrillicLetters } from '../gamification/letters.js';
import { fetchProfile } from '../db/profiles.js';
import { createItem } from '../db/items.js';
import { supa } from '../supa.js';
import { toast } from '../ui/render.js';

const { useState, useEffect } = React;

// Letter difficulty mapping is now handled by the letters.js module

export const CyrillicGame = () => {
  const [gameMode, setGameMode] = useState('learn');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // Load user profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await fetchProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const generateQuiz = () => {
    const shuffled = [...LETTERS].sort(() => Math.random() - 0.5);
    const questions = shuffled.slice(0, 10).map((letter) => {
      const correctAnswer = letter.latin;
      const wrongAnswers = LETTERS
        .filter((l) => l.latin !== correctAnswer)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((l) => l.latin);

      const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);

      return {
        question: letter.cyrillic,
        correct: correctAnswer,
        options: options,
        sound: letter.sound,
        letter: letter,
      };
    });

    setQuizQuestions(questions);
    setCurrentQuiz(0);
    setScore(0);
    setCorrectAnswers(0);
  };

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    setShowAnswer(true);

    if (answer === quizQuestions[currentQuiz].correct) {
      const question = quizQuestions[currentQuiz];
      const xpReward = getLetterXP(question.letter.cyrillic);
      setScore(score + xpReward);
      setCorrectAnswers(correctAnswers + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuiz < quizQuestions.length - 1) {
      setCurrentQuiz(currentQuiz + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = async () => {
    setIsLoading(true);
    try {
      // Award XP for quiz completion
      const baseXP = score;
      const bonusXP = correctAnswers === quizQuestions.length ? 25 : 0; // Perfect bonus
      const totalXP = baseXP + bonusXP;

      // Create quiz completion item
      const { data: u } = await supa.auth.getUser();
      if (u?.user?.id) {
        await createItem({
          user_id: u.user.id,
          title: `Cyrillic Quiz: ${correctAnswers}/${quizQuestions.length} correct`,
          description: `Scored ${totalXP} XP${bonusXP > 0 ? ' (Perfect Bonus!)' : ''}`,
          status: 'completed',
          xp_reward: totalXP,
        });

        toast(`Quiz complete! +${totalXP} XP${bonusXP > 0 ? ' (Perfect Bonus!)' : ''}`);
        await loadProfile(); // Refresh profile
      }

      setGameMode('results');
    } catch (error) {
      console.error('Failed to complete quiz:', error);
      toast('Quiz completed but XP award failed');
      setGameMode('results');
    } finally {
      setIsLoading(false);
    }
  };

  const completeCurrentLetter = async (letter) => {
    setIsLoading(true);
    try {
      const result = await completeLetter(letter.cyrillic);
      toast(`Letter mastered! +${result.reward} XP`);
      await loadProfile(); // Refresh profile
    } catch (error) {
      console.error('Failed to complete letter:', error);
      toast('Failed to save letter progress');
    } finally {
      setIsLoading(false);
    }
  };

  const resetGame = () => {
    setGameMode('learn');
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
  };

  const startQuiz = () => {
    generateQuiz();
    setGameMode('quiz');
  };

  if (gameMode === 'learn') {
    const currentLetter = LETTERS[currentIndex];
    const xpReward = getLetterXP(currentLetter.cyrillic);

    return React.createElement(
      'div',
      { className: 'max-w-2xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg' },

      // Header
      React.createElement(
        'div',
        { className: 'text-center mb-8' },
        React.createElement(
          'h2',
          { className: 'text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2' },
          '📖 Learn Cyrillic Alphabet'
        ),
        userProfile && React.createElement(
          'p',
          { className: 'text-blue-600 font-semibold' },
          `Level ${userProfile.level} • ${userProfile.total_xp} XP`
        ),
        React.createElement(
          'p',
          { className: 'text-gray-600' },
          'Master the Russian alphabet one letter at a time!'
        )
      ),

      // Letter display
      React.createElement(
        'div',
        { className: 'bg-white rounded-xl p-8 shadow-md mb-6' },
        React.createElement(
          'div',
          { className: 'text-center mb-6' },
          React.createElement(
            'div',
            { className: 'text-8xl font-bold text-blue-600 mb-4' },
            currentLetter.cyrillic
          ),
          React.createElement(
            'div',
            { className: 'text-2xl text-gray-700 mb-2' },
            'Latin: ',
            React.createElement('span', { className: 'font-semibold text-blue-600' }, currentLetter.latin)
          ),
          React.createElement(
            'div',
            { className: 'text-lg text-gray-600 mb-4' },
            'Sound: ',
            React.createElement('span', { className: 'italic' }, `"${currentLetter.sound}"`)
          ),
          React.createElement(
            'button',
            {
              onClick: () => playAudio(currentLetter.audio),
              className: 'px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto mb-4'
            },
            '🔊 Play Sound'
          ),
          React.createElement(
            'button',
            {
              onClick: () => completeCurrentLetter(currentLetter),
              disabled: isLoading,
              className: `px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`
            },
            isLoading ? 'Saving...' : `✅ Master Letter (+${xpReward} XP)`
          )
        ),

        // Navigation
        React.createElement(
          'div',
          { className: 'flex justify-between items-center' },
          React.createElement(
            'button',
            {
              onClick: () => setCurrentIndex(Math.max(0, currentIndex - 1)),
              disabled: currentIndex === 0,
              className: `px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`
            },
            '← Previous'
          ),
          React.createElement(
            'span',
            { className: 'text-gray-600' },
            `${currentIndex + 1} / ${LETTERS.length}`
          ),
          React.createElement(
            'button',
            {
              onClick: () => setCurrentIndex(Math.min(LETTERS.length - 1, currentIndex + 1)),
              disabled: currentIndex === LETTERS.length - 1,
              className: `px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors ${currentIndex === LETTERS.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`
            },
            'Next →'
          )
        )
      ),

      // Quiz button
      React.createElement(
        'div',
        { className: 'text-center' },
        React.createElement(
          'button',
          {
            onClick: startQuiz,
            className: 'px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors'
          },
          '🎯 Take Quiz'
        )
      )
    );
  }

  if (gameMode === 'quiz') {
    if (quizQuestions.length === 0) return React.createElement('div', null, 'Loading quiz...');

    const question = quizQuestions[currentQuiz];
    const xpReward = getLetterXP(question.letter.cyrillic);

    return React.createElement(
      'div',
      { className: 'max-w-2xl mx-auto p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg' },

      // Header
      React.createElement(
        'div',
        { className: 'text-center mb-8' },
        React.createElement(
          'h2',
          { className: 'text-3xl font-bold text-gray-800 mb-2' },
          '🎯 Cyrillic Quiz'
        ),
        React.createElement(
          'p',
          { className: 'text-gray-600' },
          `Question ${currentQuiz + 1} of ${quizQuestions.length}`
        ),
        React.createElement(
          'div',
          { className: 'mt-2 text-purple-600 font-semibold' },
          `Score: ${score} XP • Correct: ${correctAnswers}/${currentQuiz + (showAnswer ? 1 : 0)}`
        )
      ),

      // Question
      React.createElement(
        'div',
        { className: 'bg-white rounded-xl p-8 shadow-md mb-6' },
        React.createElement(
          'div',
          { className: 'text-center mb-6' },
          React.createElement(
            'div',
            { className: 'text-6xl font-bold text-purple-600 mb-4' },
            question.question
          ),
          React.createElement(
            'p',
            { className: 'text-lg text-gray-600 mb-4' },
            'What is the Latin equivalent?'
          ),
          React.createElement(
            'button',
            {
              onClick: () => playAudio(question.letter.audio),
              className: 'px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors'
            },
            '🔊 Play Sound'
          )
        ),

        // Options
        React.createElement(
          'div',
          { className: 'grid grid-cols-2 gap-4 mb-6' },
          ...question.options.map((option, index) =>
            React.createElement(
              'button',
              {
                key: index,
                onClick: () => !showAnswer && handleAnswer(option),
                disabled: showAnswer,
                className: `p-4 text-lg font-semibold rounded-lg transition-colors ${
                  showAnswer
                    ? option === question.correct
                      ? 'bg-green-500 text-white'
                      : option === selectedAnswer
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                    : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                }`
              },
              option
            )
          )
        ),

        // Answer feedback
        showAnswer && React.createElement(
          'div',
          { className: 'text-center' },
          React.createElement(
            'div',
            { className: `text-lg font-semibold mb-4 ${selectedAnswer === question.correct ? 'text-green-600' : 'text-red-600'}` },
            selectedAnswer === question.correct
              ? `✅ Correct! +${xpReward} XP`
              : `❌ Wrong. Correct answer: ${question.correct}`
          ),
          React.createElement(
            'button',
            {
              onClick: nextQuestion,
              className: 'px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors'
            },
            currentQuiz === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'
          )
        )
      )
    );
  }

  if (gameMode === 'results') {
    const percentage = Math.round((correctAnswers / quizQuestions.length) * 100);
    const bonusXP = correctAnswers === quizQuestions.length ? 25 : 0;
    const totalXP = score + bonusXP;

    return React.createElement(
      'div',
      { className: 'max-w-2xl mx-auto p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-lg' },

      // Header
      React.createElement(
        'div',
        { className: 'text-center mb-8' },
        React.createElement(
          'h2',
          { className: 'text-3xl font-bold text-gray-800 mb-2' },
          '🏆 Quiz Complete!'
        ),
        userProfile && React.createElement(
          'p',
          { className: 'text-green-600 font-semibold' },
          `Level ${userProfile.level} • ${userProfile.total_xp} XP`
        )
      ),

      // Results
      React.createElement(
        'div',
        { className: 'bg-white rounded-xl p-8 shadow-md mb-6 text-center' },
        React.createElement(
          'div',
          { className: 'text-6xl font-bold text-green-600 mb-4' },
          `${percentage}%`
        ),
        React.createElement(
          'div',
          { className: 'text-xl text-gray-700 mb-4' },
          `${correctAnswers} out of ${quizQuestions.length} correct`
        ),
        React.createElement(
          'div',
          { className: 'text-lg text-green-600 font-semibold mb-2' },
          `+${totalXP} XP earned`
        ),
        bonusXP > 0 && React.createElement(
          'div',
          { className: 'text-yellow-600 font-semibold' },
          `🎉 Perfect Score Bonus: +${bonusXP} XP!`
        )
      ),

      // Actions
      React.createElement(
        'div',
        { className: 'flex gap-4 justify-center' },
        React.createElement(
          'button',
          {
            onClick: startQuiz,
            className: 'px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors'
          },
          '🔄 Try Again'
        ),
        React.createElement(
          'button',
          {
            onClick: resetGame,
            className: 'px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors'
          },
          '📖 Back to Learning'
        )
      )
    );
  }

  return React.createElement('div', null, 'Loading...');
};

// Mount function for the game
export const mountCyrillicGame = () => {
  const gameContainer = document.getElementById('root');
  if (gameContainer && window.ReactDOM) {
    ReactDOM.render(React.createElement(CyrillicGame), gameContainer);
  }
};