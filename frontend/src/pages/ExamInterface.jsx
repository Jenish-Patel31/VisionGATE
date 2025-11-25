import React, { useEffect } from 'react';
import { useExam } from '../context/ExamContext';
import { useNavigate } from 'react-router-dom';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { Clock, User, Info, Save, Bookmark, XCircle, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

const ExamInterface = () => {
    const {
        questions,
        currentQuestionIndex,
        currentQuestion,
        answers,
        status,
        timeLeft,
        examTitle,
        goToQuestion,
        saveAndNext,
        markForReview,
        clearResponse,
        updateAnswer,
        submitExam,
        isExamActive
    } = useExam();

    const navigate = useNavigate();

    // Redirect if no exam active
    useEffect(() => {
        if (!isExamActive && questions.length === 0) {
            navigate('/');
        }
    }, [isExamActive, questions, navigate]);

    // Auto submit handling is in Context, but we need to handle navigation after submit
    // The Context submitExam function should probably set a flag or we check isExamActive
    useEffect(() => {
        if (!isExamActive && questions.length > 0) {
            navigate('/result');
        }
    }, [isExamActive, navigate, questions]);


    if (!currentQuestion) return null;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const currentAnswer = answers[currentQuestion.id] || '';

    // Input Handlers
    const handleMCQ = (opt) => updateAnswer(opt);
    const handleMSQ = (opt) => {
        let selected = currentAnswer ? currentAnswer.split(';') : [];
        if (selected.includes(opt)) selected = selected.filter(s => s !== opt);
        else selected.push(opt);
        updateAnswer(selected.sort().join(';'));
    };
    const handleNAT = (e) => updateAnswer(e.target.value);

    // Palette Color Logic
    const getPaletteColor = (qId) => {
        const s = status[qId];
        // Green: Answered
        // Red: Visited but not answered (which is 'not_answered' in our context)
        // Grey: Not visited
        // Purple: Marked for Review

        if (s === 'answered') return 'bg-green-500 text-white border-green-600';
        if (s === 'not_answered') return 'bg-red-500 text-white border-red-600';
        if (s === 'marked') return 'bg-purple-600 text-white border-purple-700 rounded-full'; // Rounded for marked
        if (s === 'marked_answered') return 'bg-purple-600 text-white border-purple-700 relative after:content-[""] after:absolute after:bottom-0.5 after:right-0.5 after:w-2 after:h-2 after:bg-green-400 after:rounded-full';
        return 'bg-gray-200 text-gray-700 border-gray-300'; // Not visited
    };

    return (
        <div className="h-screen flex flex-col bg-gray-100 font-sans overflow-hidden">
            {/* 1. Header */}
            <header className="h-14 bg-blue-600 text-white flex items-center justify-between px-4 shadow-md z-20">
                <div className="font-bold text-lg tracking-wide">GATE 2025 Mock</div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 bg-blue-700 px-3 py-1 rounded-lg">
                        <Clock size={18} />
                        <span className="font-mono text-xl font-bold">{formatTime(timeLeft)}</span>
                    </div>
                    <div className="flex items-center gap-2 cursor-pointer hover:bg-blue-700 p-1 rounded transition">
                        <User size={20} />
                        <span className="text-sm font-medium hidden sm:block">Candidate</span>
                    </div>
                </div>
            </header>

            {/* 2. Split Screen Layout */}
            <div className="flex-1 flex overflow-hidden">

                {/* Left (75%): Question Area */}
                <main className="flex-[3] flex flex-col bg-white border-r border-gray-300 min-w-0">

                    {/* Top Bar */}
                    <div className="h-12 border-b border-gray-200 flex items-center justify-between px-6 bg-gray-50">
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-gray-800 text-lg">Question {currentQuestion.id}</span>
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-bold rounded uppercase">{currentQuestion.type}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm font-medium">
                            <span className="text-green-600">Marks: +{currentQuestion.marks}</span>
                            <span className="text-red-500">Neg: -{currentQuestion.negativeMarks}</span>
                        </div>
                        <div className="ml-auto cursor-pointer text-blue-600 hover:text-blue-800">
                            <Info size={20} />
                        </div>
                    </div>

                    {/* Content (Scrollable) */}
                    <div className="flex-1 overflow-y-auto p-6 bg-white flex items-center justify-center">
                        <div className="max-w-4xl w-full">
                            <Zoom>
                                <img
                                    src={currentQuestion.imagePath}
                                    alt={`Q${currentQuestion.id}`}
                                    className="max-w-full h-auto object-contain mx-auto shadow-sm border border-gray-100"
                                />
                            </Zoom>
                        </div>
                    </div>

                    {/* Input Area (Sticky Bottom) */}
                    <div className="border-t border-gray-200 bg-gray-50 p-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Select Response:</div>

                            {currentQuestion.type === 'MCQ' && (
                                <div className="flex gap-6">
                                    {['A', 'B', 'C', 'D'].map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => handleMCQ(opt)}
                                            className={clsx(
                                                "w-12 h-12 rounded-full border-2 font-bold text-lg transition-all shadow-sm",
                                                currentAnswer === opt
                                                    ? "bg-blue-600 border-blue-600 text-white scale-105"
                                                    : "bg-white border-gray-300 text-gray-600 hover:border-blue-400 hover:bg-blue-50"
                                            )}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {currentQuestion.type === 'MSQ' && (
                                <div className="flex gap-6">
                                    {['A', 'B', 'C', 'D'].map(opt => {
                                        const isSelected = currentAnswer.split(';').includes(opt);
                                        return (
                                            <button
                                                key={opt}
                                                onClick={() => handleMSQ(opt)}
                                                className={clsx(
                                                    "w-12 h-12 rounded-md border-2 font-bold text-lg transition-all shadow-sm",
                                                    isSelected
                                                        ? "bg-blue-600 border-blue-600 text-white"
                                                        : "bg-white border-gray-300 text-gray-600 hover:border-blue-400 hover:bg-blue-50"
                                                )}
                                            >
                                                {opt}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {currentQuestion.type === 'NAT' && (
                                <input
                                    type="number"
                                    value={currentAnswer}
                                    onChange={handleNAT}
                                    placeholder="Enter Answer"
                                    className="w-48 px-4 py-2 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                                />
                            )}
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="h-16 border-t border-gray-300 bg-white flex items-center justify-between px-6 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-10">
                        <div className="flex gap-3">
                            <button
                                onClick={markForReview}
                                className="px-4 py-2 rounded border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 flex items-center gap-2"
                            >
                                <Bookmark size={16} /> Mark for Review & Next
                            </button>
                            <button
                                onClick={clearResponse}
                                className="px-4 py-2 rounded border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 flex items-center gap-2"
                            >
                                <XCircle size={16} /> Clear Response
                            </button>
                        </div>

                        <button
                            onClick={saveAndNext}
                            className="px-6 py-2 rounded bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md active:scale-95 flex items-center gap-2"
                        >
                            Save & Next <ChevronRight size={18} />
                        </button>
                    </div>

                </main>

                {/* Right (25%): Question Palette */}
                <aside className="flex-1 bg-blue-50 flex flex-col min-w-[280px] max-w-xs border-l border-gray-300">

                    {/* Palette Header */}
                    <div className="p-4 bg-blue-100 border-b border-blue-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
                                {/* Placeholder Avatar */}
                                <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            </div>
                            <div>
                                <div className="font-bold text-gray-800 text-sm">John Doe</div>
                                <div className="text-xs text-gray-600">Gate Aspirant</div>
                            </div>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Question Palette</h3>
                        <div className="grid grid-cols-4 gap-2">
                            {questions.map((q, idx) => (
                                <button
                                    key={q.id}
                                    onClick={() => goToQuestion(idx)}
                                    className={clsx(
                                        "h-9 w-full flex items-center justify-center text-sm font-bold border shadow-sm transition-all",
                                        // Shape logic: GATE uses rectangles mostly, but we can use rounded-md
                                        "rounded-md",
                                        getPaletteColor(q.id),
                                        currentQuestionIndex === idx ? "ring-2 ring-black ring-offset-1 z-10" : ""
                                    )}
                                >
                                    {q.id}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="p-4 bg-white border-t border-gray-200 text-xs text-gray-600 space-y-2">
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded-sm"></div> Answered</div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500 rounded-sm"></div> Not Answered</div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded-sm"></div> Not Visited</div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-purple-600 rounded-full"></div> Marked for Review</div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-purple-600 rounded-sm relative after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-1.5 after:h-1.5 after:bg-green-400 after:rounded-full"></div> Ans & Marked</div>
                    </div>

                    {/* Submit Button */}
                    <div className="p-4 bg-blue-100 border-t border-blue-200">
                        <button
                            onClick={submitExam}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow-lg transition-transform active:scale-95"
                        >
                            Submit Test
                        </button>
                    </div>

                </aside>

            </div>
        </div>
    );
};

export default ExamInterface;
