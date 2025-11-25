import React from 'react';
import { useExam } from '../context/ExamContext';
import clsx from 'clsx';

const InputArea = () => {
    const { currentQuestion, answers, updateAnswer } = useExam();

    if (!currentQuestion) return null;

    const currentAnswer = answers[currentQuestion.id] || '';

    const handleMCQ = (option) => {
        updateAnswer(option);
    };

    const handleMSQ = (option) => {
        let selected = currentAnswer ? currentAnswer.split(';') : [];
        if (selected.includes(option)) {
            selected = selected.filter(s => s !== option);
        } else {
            selected.push(option);
        }
        updateAnswer(selected.sort().join(';'));
    };

    const handleNAT = (e) => {
        updateAnswer(e.target.value);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Your Answer</h3>

            {currentQuestion.type === 'MCQ' && (
                <div className="flex gap-4 justify-center">
                    {['A', 'B', 'C', 'D'].map((opt) => (
                        <button
                            key={opt}
                            onClick={() => handleMCQ(opt)}
                            className={clsx(
                                "w-12 h-12 rounded-xl text-lg font-bold transition-all duration-200 border-2",
                                currentAnswer === opt
                                    ? "bg-blue-500 text-white border-blue-500 shadow-lg scale-110"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                            )}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            )}

            {currentQuestion.type === 'MSQ' && (
                <div className="flex gap-4 justify-center">
                    {['A', 'B', 'C', 'D'].map((opt) => {
                        const isSelected = currentAnswer.split(';').includes(opt);
                        return (
                            <button
                                key={opt}
                                onClick={() => handleMSQ(opt)}
                                className={clsx(
                                    "w-12 h-12 rounded-xl text-lg font-bold transition-all duration-200 border-2 relative",
                                    isSelected
                                        ? "bg-purple-500 text-white border-purple-500 shadow-lg"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                                )}
                            >
                                {opt}
                                {isSelected && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span></span>}
                            </button>
                        );
                    })}
                </div>
            )}

            {currentQuestion.type === 'NAT' && (
                <div className="flex justify-center">
                    <input
                        type="number"
                        step="any"
                        value={currentAnswer}
                        onChange={handleNAT}
                        placeholder="Enter numerical value"
                        className="w-full max-w-xs px-4 py-3 text-lg font-medium text-center text-gray-800 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                    />
                </div>
            )}
        </div>
    );
};

export default InputArea;
