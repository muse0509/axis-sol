'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from '../../styles/Challenge.module.css';

export default function ChallengePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);

  const questions = [
    {
      id: 1,
      question: "What is the primary purpose of the Axis Index?",
      options: [
        "To provide a single token for trading all cryptocurrencies",
        "To create a diversified exposure to top Solana assets",
        "To replace traditional stock market indices",
        "To generate high-frequency trading profits"
      ],
      correct: 1
    },
    {
      id: 2,
      question: "How often is the Axis Index rebalanced?",
      options: [
        "Daily",
        "Weekly", 
        "Monthly",
        "Quarterly"
      ],
      correct: 3
    },
    {
      id: 3,
      question: "What mechanism creates value for AXIS token holders?",
      options: [
        "Staking rewards",
        "Dividend payments",
        "Buyback and burn",
        "Liquidity mining"
      ],
      correct: 2
    },
    {
      id: 4,
      question: "Which blockchain does Axis Index primarily operate on?",
      options: [
        "Ethereum",
        "Solana",
        "Polygon",
        "Binance Smart Chain"
      ],
      correct: 1
    },
    {
      id: 5,
      question: "What is the main advantage of index investing?",
      options: [
        "Guaranteed returns",
        "Diversification",
        "High liquidity",
        "Low fees"
      ],
      correct: 1
    }
  ];

  const handleAnswer = (questionId: number, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex.toString()
    }));
  };

  const nextStep = () => {
    if (currentStep < questions.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitQuiz = () => {
    let correctAnswers = 0;
    questions.forEach(question => {
      if (answers[question.id] === question.correct.toString()) {
        correctAnswers++;
      }
    });
    
    const finalScore = Math.round((correctAnswers / questions.length) * 100);
    setScore(finalScore);
    setShowResults(true);
  };

  const resetQuiz = () => {
    setCurrentStep(1);
    setAnswers({});
    setScore(null);
    setShowResults(false);
  };

  const currentQuestion = questions[currentStep - 1];
  const hasAnswered = answers[currentQuestion.id] !== undefined;
  const canProceed = currentStep < questions.length;
  const canSubmit = currentStep === questions.length && Object.keys(answers).length === questions.length;

  if (showResults) {
    return (
      <div className={styles.container}>
        <div className={styles.resultsContainer}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.resultsContent}
          >
            <h1>Quiz Results</h1>
            <div className={styles.scoreDisplay}>
              <h2>Your Score: {score}%</h2>
              <div className={styles.scoreBar}>
                <div 
                  className={styles.scoreFill} 
                  style={{ width: `${score}%` }}
                ></div>
              </div>
            </div>
            
            <div className={styles.feedback}>
              {score && score >= 80 ? (
                <div className={styles.excellent}>
                  <h3>Excellent! 🎉</h3>
                  <p>You have a great understanding of the Axis Index concept!</p>
                </div>
              ) : score && score >= 60 ? (
                <div className={styles.good}>
                  <h3>Good Job! 👍</h3>
                  <p>You have a solid grasp of the basics. Keep learning!</p>
                </div>
              ) : (
                <div className={styles.needImprovement}>
                  <h3>Keep Learning! 📚</h3>
                  <p>Review the concepts and try again. Knowledge is power!</p>
                </div>
              )}
            </div>

            <div className={styles.answerReview}>
              <h3>Answer Review:</h3>
              {questions.map(question => (
                <div key={question.id} className={styles.questionReview}>
                  <p><strong>Q{question.id}:</strong> {question.question}</p>
                  <p className={styles.correctAnswer}>
                    <strong>Correct Answer:</strong> {question.options[question.correct]}
                  </p>
                  {answers[question.id] && (
                    <p className={answers[question.id] === question.correct.toString() ? styles.yourAnswerCorrect : styles.yourAnswerIncorrect}>
                      <strong>Your Answer:</strong> {question.options[parseInt(answers[question.id])]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.actionButtons}>
              <button onClick={resetQuiz} className={styles.retryButton}>
                Try Again
              </button>
              <Link href="/dashboard" className={styles.dashboardButton}>
                Go to Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.quizContainer}>
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className={styles.questionCard}
        >
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${(currentStep / questions.length) * 100}%` }}
            ></div>
          </div>
          
          <div className={styles.questionHeader}>
            <span className={styles.questionNumber}>Question {currentStep} of {questions.length}</span>
            <span className={styles.questionProgress}>{currentStep}/{questions.length}</span>
          </div>

          <h2 className={styles.questionText}>{currentQuestion.question}</h2>

          <div className={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(currentQuestion.id, index)}
                className={`${styles.optionButton} ${
                  answers[currentQuestion.id] === index.toString() ? styles.selected : ''
                }`}
              >
                <span className={styles.optionLetter}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span className={styles.optionText}>{option}</span>
              </button>
            ))}
          </div>

          <div className={styles.navigationButtons}>
            {currentStep > 1 && (
              <button onClick={prevStep} className={styles.navButton}>
                Previous
              </button>
            )}
            
            {canProceed && hasAnswered && (
              <button onClick={nextStep} className={styles.navButton}>
                Next
              </button>
            )}
            
            {canSubmit && (
              <button onClick={submitQuiz} className={styles.submitButton}>
                Submit Quiz
              </button>
            )}
          </div>
        </motion.div>

        <div className={styles.quizInfo}>
          <h3>About This Quiz</h3>
          <p>Test your knowledge about the Axis Index and earn bragging rights! This quiz covers the fundamentals of our Solana-based index product.</p>
          
          <div className={styles.quizStats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{questions.length}</span>
              <span className={styles.statLabel}>Questions</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{Object.keys(answers).length}</span>
              <span className={styles.statLabel}>Answered</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{questions.length - Object.keys(answers).length}</span>
              <span className={styles.statLabel}>Remaining</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
