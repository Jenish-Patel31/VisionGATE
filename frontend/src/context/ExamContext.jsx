import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const ExamContext = createContext();

export const useExam = () => useContext(ExamContext);

export const ExamProvider = ({ children }) => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { qId: answer }
    const [status, setStatus] = useState({}); // { qId: 'visited' | 'answered' | 'marked' | 'marked_answered' }
    const [timeLeft, setTimeLeft] = useState(0);
    const [examTitle, setExamTitle] = useState('');
    const [isExamActive, setIsExamActive] = useState(false);

    // Load Exam Data
    const fetchExam = async () => {
        try {
            const response = await fetch('http://localhost:8000/exam-data');
            if (!response.ok) throw new Error('Failed to fetch exam data');
            const data = await response.json();

            setQuestions(data.questions);
            setExamTitle(data.examTitle);
            setTimeLeft(data.duration * 60);
            setIsExamActive(true);

            const initialStatus = {};
            data.questions.forEach(q => {
                initialStatus[q.id] = 'not_visited';
            });
            initialStatus[data.questions[0].id] = 'not_answered';
            setStatus(initialStatus);
            setCurrentQuestionIndex(0);
            return true;
        } catch (error) {
            console.error(error);
            toast.error("Failed to load exam data");
            return false;
        }
    };

    // Timer Logic
    useEffect(() => {
        let timer;
        if (isExamActive && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        submitExam();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isExamActive, timeLeft]);

    // Navigation
    const goToQuestion = (index) => {
        if (index >= 0 && index < questions.length) {
            // Update status of current question if leaving it
            const currentQId = questions[currentQuestionIndex].id;
            setStatus(prev => {
                const currentStatus = prev[currentQId];
                if (currentStatus === 'not_visited') {
                    return { ...prev, [currentQId]: 'not_answered' };
                }
                return prev;
            });

            setCurrentQuestionIndex(index);

            // Mark new question as visited (if not already answered/marked)
            const newQId = questions[index].id;
            setStatus(prev => {
                const newStatus = prev[newQId];
                if (newStatus === 'not_visited') {
                    return { ...prev, [newQId]: 'not_answered' };
                }
                return prev;
            });
        }
    };

    // Actions
    const saveAndNext = () => {
        const currentQ = questions[currentQuestionIndex];
        // If answered, mark as answered. If not, mark as not_answered (red)
        // Actually, saveAndNext implies saving the answer.
        // If no answer selected, it's just "Next" but usually GATE treats "Save & Next" as confirming answer.

        setStatus(prev => ({
            ...prev,
            [currentQ.id]: answers[currentQ.id] ? 'answered' : 'not_answered'
        }));

        if (currentQuestionIndex < questions.length - 1) {
            goToQuestion(currentQuestionIndex + 1);
        }
    };

    const markForReview = () => {
        const currentQ = questions[currentQuestionIndex];
        setStatus(prev => ({
            ...prev,
            [currentQ.id]: answers[currentQ.id] ? 'marked_answered' : 'marked'
        }));

        if (currentQuestionIndex < questions.length - 1) {
            goToQuestion(currentQuestionIndex + 1);
        }
    };

    const clearResponse = () => {
        const currentQ = questions[currentQuestionIndex];
        setAnswers(prev => {
            const newAnswers = { ...prev };
            delete newAnswers[currentQ.id];
            return newAnswers;
        });
        setStatus(prev => ({
            ...prev,
            [currentQ.id]: 'not_answered'
        }));
    };

    const updateAnswer = (value) => {
        const currentQ = questions[currentQuestionIndex];
        setAnswers(prev => ({
            ...prev,
            [currentQ.id]: value
        }));
    };

    const submitExam = () => {
        setIsExamActive(false);
        toast.info("Exam Submitted!");
        // Calculate Score logic here or navigate to result page
    };

    return (
        <ExamContext.Provider value={{
            questions,
            currentQuestionIndex,
            currentQuestion: questions[currentQuestionIndex],
            answers,
            status,
            timeLeft,
            examTitle,
            isExamActive,
            fetchExam,
            goToQuestion,
            saveAndNext,
            markForReview,
            clearResponse,
            updateAnswer,
            submitExam
        }}>
            {children}
        </ExamContext.Provider>
    );
};
