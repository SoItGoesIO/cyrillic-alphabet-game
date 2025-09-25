// Cyrillic Alphabet Learning Game with Audio
// Minimal emoji icon stubs (works everywhere)
const Icon = ({ children, className }) => React.createElement('span', { className }, children);
const CheckCircle = (props) => React.createElement(Icon, { ...props }, '✔️');
const XCircle = (props) => React.createElement(Icon, { ...props }, '✖️');
const RefreshCw = (props) => React.createElement(Icon, { ...props }, '🔄');
const Trophy = (props) => React.createElement(Icon, { ...props }, '🏆');
const BookOpen = (props) => React.createElement(Icon, { ...props }, '📖');
const Volume2 = (props) => React.createElement(Icon, { ...props }, '🔊');

const { useState, useEffect } = React;

const CyrillicAlphabetGame = () => {
    const alphabet = [
        { cyrillic: 'А', latin: 'A', sound: 'ah', audio: '01.mp3' },
        { cyrillic: 'Б', latin: 'B', sound: 'beh', audio: '02.mp3' },
        { cyrillic: 'В', latin: 'V', sound: 'veh', audio: '03.mp3' },
        { cyrillic: 'Г', latin: 'G', sound: 'geh', audio: '04.mp3' },
        { cyrillic: 'Д', latin: 'D', sound: 'deh', audio: '05.mp3' },
        { cyrillic: 'Е', latin: 'E', sound: 'yeh', audio: '06.mp3' },
        { cyrillic: 'Ё', latin: 'Yo', sound: 'yoh', audio: '07.mp3' },
        { cyrillic: 'Ж', latin: 'Zh', sound: 'zheh', audio: '08.mp3' },
        { cyrillic: 'З', latin: 'Z', sound: 'zeh', audio: '09.mp3' },
        { cyrillic: 'И', latin: 'I', sound: 'ee', audio: '10.mp3' },
        { cyrillic: 'Й', latin: 'Y', sound: 'ee kratkoye', audio: '11.mp3' },
        { cyrillic: 'К', latin: 'K', sound: 'kah', audio: '12.mp3' },
        { cyrillic: 'Л', latin: 'L', sound: 'el', audio: '13.mp3' },
        { cyrillic: 'М', latin: 'M', sound: 'em', audio: '14.mp3' },
        { cyrillic: 'Н', latin: 'N', sound: 'en', audio: '15.mp3' },
        { cyrillic: 'О', latin: 'O', sound: 'oh', audio: '16.mp3' },
        { cyrillic: 'П', latin: 'P', sound: 'peh', audio: '17.mp3' },
        { cyrillic: 'Р', latin: 'R', sound: 'er', audio: '18.mp3' },
        { cyrillic: 'С', latin: 'S', sound: 'es', audio: '19.mp3' },
        { cyrillic: 'Т', latin: 'T', sound: 'teh', audio: '20.mp3' },
        { cyrillic: 'У', latin: 'U', sound: 'oo', audio: '21.mp3' },
        { cyrillic: 'Ф', latin: 'F', sound: 'ef', audio: '22.mp3' },
        { cyrillic: 'Х', latin: 'Kh', sound: 'khah', audio: '23.mp3' },
        { cyrillic: 'Ц', latin: 'Ts', sound: 'tseh', audio: '24.mp3' },
        { cyrillic: 'Ч', latin: 'Ch', sound: 'cheh', audio: '25.mp3' },
        { cyrillic: 'Ш', latin: 'Sh', sound: 'shah', audio: '26.mp3' },
        { cyrillic: 'Щ', latin: 'Shch', sound: 'shchah', audio: '27.mp3' },
        { cyrillic: 'Ъ', latin: '"', sound: 'hard sign', audio: '28.mp3' },
        { cyrillic: 'Ы', latin: 'Y', sound: 'yih', audio: '29.mp3' },
        { cyrillic: 'Ь', latin: "'", sound: 'soft sign', audio: '30.mp3' },
        { cyrillic: 'Э', latin: 'E', sound: 'eh', audio: '31.mp3' },
        { cyrillic: 'Ю', latin: 'Yu', sound: 'yoo', audio: '32.mp3' },
        { cyrillic: 'Я', latin: 'Ya', sound: 'yah', audio: '33.mp3' }
    ];

    const [gameMode, setGameMode] = useState('learn');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [quizComplete, setQuizComplete] = useState(false);
    const [correctAnswers, setCorrectAnswers] = useState(0);

    // Audio playback function
    const playAudio = (audioFile) => {
        const audio = new Audio(`audio/${audioFile}`);
        audio.play().catch(e => {
            console.log('Audio play failed:', e);
            // Fallback - could show a message to user
        });
    };

    const generateQuiz = () => {
        const shuffled = [...alphabet].sort(() => Math.random() - 0.5);
        const questions = shuffled.slice(0, 10).map(letter => {
            const correctAnswer = letter.latin;
            const wrongAnswers = alphabet
                .filter(l => l.latin !== correctAnswer)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)
                .map(l => l.latin);
            
            const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
            
            return {
                question: letter.cyrillic,
                correct: correctAnswer,
                options: options,
                sound: letter.sound
            };
        });
        
        setQuizQuestions(questions);
        setCurrentQuiz(0);
        setScore(0);
        setCorrectAnswers(0);
        setQuizComplete(false);
    };

    const handleAnswer = (answer) => {
        setSelectedAnswer(answer);
        setShowAnswer(true);
        
        if (answer === quizQuestions[currentQuiz].correct) {
            setScore(score + 10);
            setCorrectAnswers(correctAnswers + 1);
        }
    };

    const nextQuestion = () => {
        if (currentQuiz < quizQuestions.length - 1) {
            setCurrentQuiz(currentQuiz + 1);
            setSelectedAnswer(null);
            setShowAnswer(false);
        } else {
            setQuizComplete(true);
            setGameMode('results');
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
        const currentLetter = alphabet[currentIndex];
        return React.createElement('div', {className: "max-w-2xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg"},
            React.createElement('div', {className: "text-center mb-8"},
                React.createElement('h1', {className: "text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2"},
                React.createElement(BookOpen, {className: "w-8 h-8 text-blue-600"}),
                "Learn Cyrillic Alphabet with Audio"
                ),
                React.createElement('p', {className: "text-gray-600"}, "Master the Russian alphabet one letter at a time!")
            ),
            React.createElement('div', {className: "bg-white rounded-xl p-8 shadow-md mb-6"},
                React.createElement('div', {className: "text-center mb-6"},
                    React.createElement('div', {className: "text-8xl font-bold text-blue-600 mb-4"}, currentLetter.cyrillic),
                    React.createElement('div', {className: "text-2xl text-gray-700 mb-2"},
                        "Latin: ",
                        React.createElement('span', {className: "font-semibold text-blue-600"}, currentLetter.latin)
                    ),
                    React.createElement('div', {className: "text-lg text-gray-600 mb-4"},
                        "Sound: ",
                        React.createElement('span', {className: "italic"}, `"${currentLetter.sound}"`)
                    ),
                    React.createElement('button', {
                        onClick: () => playAudio(currentLetter.audio),
                        className: "px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                    },
                        React.createElement(Volume2, {className: "w-5 h-5"}),
                        "Play Sound"
                    )
                ),
                React.createElement('div', {className: "flex justify-between items-center"},
                    React.createElement('button', {
                        onClick: () => setCurrentIndex(Math.max(0, currentIndex - 1)),
                        disabled: currentIndex === 0,
                        className: "px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-400 transition-colors"
                    }, "Previous"),
                    React.createElement('div', {className: "text-sm text-gray-600"}, `${currentIndex + 1} of ${alphabet.length}`),
                    React.createElement('button', {
                        onClick: () => setCurrentIndex(Math.min(alphabet.length - 1, currentIndex + 1)),
                        disabled: currentIndex === alphabet.length - 1,
                        className: "px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-400 transition-colors"
                    }, "Next")
                )
            ),
            React.createElement('div', {className: "text-center"},
                React.createElement('button', {
                    onClick: startQuiz,
                    className: "px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
                },
                    React.createElement(Trophy, {className: "w-5 h-5"}),
                    "Take Quiz"
                )
            )
        );
    }

    if (gameMode === 'quiz') {
        if (quizQuestions.length === 0) return null;
        
        const question = quizQuestions[currentQuiz];
        
        return React.createElement('div', {className: "max-w-2xl mx-auto p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-lg"},
            React.createElement('div', {className: "text-center mb-8"},
                React.createElement('h1', {className: "text-3xl font-bold text-gray-800 mb-2"}, "Cyrillic Quiz"),
                React.createElement('p', {className: "text-gray-600"}, `Question ${currentQuiz + 1} of ${quizQuestions.length}`),
                React.createElement('div', {className: "w-full bg-gray-200 rounded-full h-2 mt-4"},
                    React.createElement('div', {
                        className: "bg-green-600 h-2 rounded-full transition-all duration-300",
                        style: { width: `${((currentQuiz + 1) / quizQuestions.length) * 100}%` }
                    })
                )
            ),
            React.createElement('div', {className: "bg-white rounded-xl p-8 shadow-md mb-6"},
                React.createElement('div', {className: "text-center mb-8"},
                    React.createElement('div', {className: "text-6xl font-bold text-green-600 mb-4"}, question.question),
                    React.createElement('p', {className: "text-lg text-gray-600 mb-4"}, "What is the Latin equivalent of this Cyrillic letter?"),
                    React.createElement('button', {
                        onClick: () => playAudio(alphabet.find(letter => letter.cyrillic === question.question).audio),
                        className: "px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
                    },
                        React.createElement(Volume2, {className: "w-4 h-4"}),
                        "Hear Sound"
                    )
                ),
                React.createElement('div', {className: "grid grid-cols-2 gap-4 mb-6"},
                    ...question.options.map((option, index) => {
                        let buttonClass = "p-4 text-xl font-semibold rounded-lg border-2 transition-all duration-200 ";
                        
                        if (showAnswer) {
                            if (option === question.correct) {
                                buttonClass += "bg-green-100 border-green-500 text-green-700";
                            } else if (option === selectedAnswer && option !== question.correct) {
                                buttonClass += "bg-red-100 border-red-500 text-red-700";
                            } else {
                                buttonClass += "bg-gray-100 border-gray-300 text-gray-500";
                            }
                        } else {
                            buttonClass += "bg-white border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 cursor-pointer";
                        }

                        return React.createElement('button', {
                            key: index,
                            onClick: () => !showAnswer && handleAnswer(option),
                            disabled: showAnswer,
                            className: buttonClass
                        }, option);
                    })
                ),
                showAnswer && React.createElement('div', {className: "text-center mb-6"},
                    React.createElement('div', {className: "flex items-center justify-center gap-2 mb-2"},
                        selectedAnswer === question.correct 
                            ? React.createElement(CheckCircle, {className: "w-6 h-6 text-green-600"})
                            : React.createElement(XCircle, {className: "w-6 h-6 text-red-600"}),
                        React.createElement('span', {className: "text-lg font-semibold"},
                            selectedAnswer === question.correct ? 'Correct!' : 'Incorrect!'
                        )
                    ),
                    React.createElement('p', {className: "text-gray-600"}, `Pronounced: "${question.sound}"`)
                ),
                showAnswer && React.createElement('div', {className: "text-center"},
                    React.createElement('button', {
                        onClick: nextQuestion,
                        className: "px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    }, currentQuiz < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz')
                )
            ),
            React.createElement('div', {className: "text-center text-lg font-semibold text-gray-700"}, `Score: ${score} points`)
        );
    }

    if (gameMode === 'results') {
        const percentage = Math.round((correctAnswers / quizQuestions.length) * 100);
        
        return React.createElement('div', {className: "max-w-2xl mx-auto p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg"},
            React.createElement('div', {className: "text-center mb-8"},
                React.createElement(Trophy, {className: "w-16 h-16 text-yellow-500 mx-auto mb-4"}),
                React.createElement('h1', {className: "text-3xl font-bold text-gray-800 mb-2"}, "Quiz Complete!")
            ),
            React.createElement('div', {className: "bg-white rounded-xl p-8 shadow-md mb-6 text-center"},
                React.createElement('div', {className: "text-4xl font-bold text-purple-600 mb-4"}, `${correctAnswers}/${quizQuestions.length}`),
                React.createElement('div', {className: "text-2xl text-gray-700 mb-4"}, `${percentage}% Correct`),
                React.createElement('div', {className: "text-lg text-gray-600 mb-6"}, `Final Score: ${score} points`),
                React.createElement('div', {className: "text-lg mb-6"},
                    React.createElement('span', {
                        className: percentage >= 80 ? "text-green-600 font-semibold" 
                                 : percentage >= 60 ? "text-yellow-600 font-semibold" 
                                 : "text-orange-600 font-semibold"
                    },
                        percentage >= 80 ? "Excellent work! 🎉"
                        : percentage >= 60 ? "Good job! Keep practicing! 👍"
                        : "Keep studying! You'll get there! 💪"
                    )
                )
            ),
            React.createElement('div', {className: "flex gap-4 justify-center"},
                React.createElement('button', {
                    onClick: startQuiz,
                    className: "px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                },
                    React.createElement(RefreshCw, {className: "w-5 h-5"}),
                    "Retake Quiz"
                ),
                React.createElement('button', {
                    onClick: resetGame,
                    className: "px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                },
                    React.createElement(BookOpen, {className: "w-5 h-5"}),
                    "Study More"
                )
            )
        );
    }
};

ReactDOM.render(React.createElement(CyrillicAlphabetGame), document.getElementById('root'));