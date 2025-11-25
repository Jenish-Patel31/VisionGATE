import React from 'react';
import { useExam } from '../context/ExamContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, Home } from 'lucide-react';
import clsx from 'clsx';

const Result = () => {
    const { questions, answers, examTitle } = useExam();
    const navigate = useNavigate();

    // Calculate Score
    let totalScore = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let attemptedCount = 0;

    const analysis = questions.map(q => {
        const userAnswer = answers[q.id];
        const isAttempted = userAnswer !== undefined && userAnswer !== null && userAnswer !== '';
        let isCorrect = false;
        let marksAwarded = 0;

        if (isAttempted) {
            attemptedCount++;
            // Normalize answers for comparison (trim, uppercase)
            const normalizedUser = String(userAnswer).trim().toUpperCase();
            const normalizedCorrect = String(q.correctAnswer).trim().toUpperCase();

            // Simple comparison logic (can be expanded for MSQ partial marking if needed, but GATE usually requires exact match)
            // For NAT, we might need range checking, but for now exact match or simple float comparison

            if (q.type === 'NAT') {
                // Handle numeric comparison with tolerance if needed, for now string match or float match
                // Assuming exact match for simplicity as per current parser
                if (normalizedUser === normalizedCorrect) {
                    isCorrect = true;
                } else {
                    try {
                        if (Math.abs(parseFloat(normalizedUser) - parseFloat(normalizedCorrect)) < 0.01) isCorrect = true;
                    } catch (e) { }
                }
            } else {
                // MCQ / MSQ
                // MSQ in GATE requires all correct options to be selected and no wrong ones.
                // Our parser stores MSQ answer as "A;B" sorted.
                // Frontend InputArea stores as "A;B" sorted.
                if (normalizedUser === normalizedCorrect) {
                    isCorrect = true;
                }
            }

            if (isCorrect) {
                correctCount++;
                marksAwarded = q.marks;
                totalScore += q.marks;
            } else {
                wrongCount++;
                if (q.type === 'MCQ') {
                    totalScore -= q.negativeMarks;
                    marksAwarded = -q.negativeMarks;
                } else {
                    marksAwarded = 0;
                }
            }
        }

        return {
            ...q,
            userAnswer: isAttempted ? userAnswer : 'Not Attempted',
            isCorrect,
            isAttempted,
            marksAwarded
        };
    });

    const accuracy = attemptedCount > 0 ? ((correctCount / attemptedCount) * 100).toFixed(1) : 0;

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Result Analysis</h1>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium shadow-sm"
                    >
                        <Home size={18} /> Back to Home
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-sm font-medium uppercase">Total Score</p>
                        <p className="text-4xl font-bold text-blue-600 mt-2">{totalScore.toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-sm font-medium uppercase">Accuracy</p>
                        <p className="text-4xl font-bold text-green-600 mt-2">{accuracy}%</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-sm font-medium uppercase">Attempted</p>
                        <p className="text-4xl font-bold text-gray-800 mt-2">{attemptedCount} <span className="text-lg text-gray-400 font-normal">/ {questions.length}</span></p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-sm font-medium uppercase">Correct / Wrong</p>
                        <div className="flex items-end gap-2 mt-2">
                            <span className="text-4xl font-bold text-green-600">{correctCount}</span>
                            <span className="text-2xl text-gray-300">/</span>
                            <span className="text-4xl font-bold text-red-500">{wrongCount}</span>
                        </div>
                    </div>
                </div>

                {/* Detailed Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="font-semibold text-gray-800">Question-wise Analysis</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">Q.No</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Marks</th>
                                    <th className="px-6 py-4">Your Answer</th>
                                    <th className="px-6 py-4">Correct Answer</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Marks Awarded</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {analysis.map((q) => (
                                    <tr key={q.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{q.id}</td>
                                        <td className="px-6 py-4 text-gray-500">{q.type}</td>
                                        <td className="px-6 py-4 text-gray-500">{q.marks}</td>
                                        <td className="px-6 py-4 font-mono text-gray-700">{q.userAnswer}</td>
                                        <td className="px-6 py-4 font-mono text-gray-700">{q.correctAnswer}</td>
                                        <td className="px-6 py-4">
                                            {!q.isAttempted ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                    <AlertCircle size={12} /> Unattempted
                                                </span>
                                            ) : q.isCorrect ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                                    <CheckCircle size={12} /> Correct
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                                                    <XCircle size={12} /> Wrong
                                                </span>
                                            )}
                                        </td>
                                        <td className={clsx(
                                            "px-6 py-4 text-right font-bold",
                                            q.marksAwarded > 0 ? "text-green-600" : q.marksAwarded < 0 ? "text-red-600" : "text-gray-400"
                                        )}>
                                            {q.marksAwarded > 0 ? '+' : ''}{q.marksAwarded}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Result;
