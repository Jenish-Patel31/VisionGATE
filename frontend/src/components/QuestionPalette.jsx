import React from 'react';
import { useExam } from '../context/ExamContext';
import clsx from 'clsx';

const QuestionPalette = () => {
    const { questions, currentQuestionIndex, goToQuestion, status } = useExam();

    const getStatusColor = (qId) => {
        const s = status[qId];
        switch (s) {
            case 'answered': return 'bg-gate-green text-white border-gate-green';
            case 'not_answered': return 'bg-gate-red text-white border-gate-red';
            case 'marked': return 'bg-gate-purple text-white border-gate-purple';
            case 'marked_answered': return 'bg-gate-purple text-white border-gate-purple relative after:content-[""] after:absolute after:bottom-1 after:right-1 after:w-2 after:h-2 after:bg-green-400 after:rounded-full';
            case 'not_visited': return 'bg-gray-100 text-gray-600 border-gray-200';
            default: return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 h-full flex flex-col">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Question Palette</h3>
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="grid grid-cols-4 gap-3">
                    {questions.map((q, index) => (
                        <button
                            key={q.id}
                            onClick={() => goToQuestion(index)}
                            className={clsx(
                                "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-200",
                                "border-2 hover:shadow-md active:scale-95",
                                getStatusColor(q.id),
                                currentQuestionIndex === index ? "ring-2 ring-offset-2 ring-blue-500 scale-105" : ""
                            )}
                        >
                            {q.id}
                        </button>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-gate-green"></div> Answered</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-gate-red"></div> Not Answered</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-gray-200"></div> Not Visited</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-gate-purple"></div> Marked</div>
            </div>
        </div>
    );
};

export default QuestionPalette;
