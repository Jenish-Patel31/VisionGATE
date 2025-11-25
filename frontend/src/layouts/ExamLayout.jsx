import React from 'react';
import { useExam } from '../context/ExamContext';
import QuestionPalette from '../components/QuestionPalette';
import QuestionViewer from '../components/QuestionViewer';
import InputArea from '../components/InputArea';
import { Clock, ChevronLeft, ChevronRight, Save, Bookmark, XCircle } from 'lucide-react';
import clsx from 'clsx';

const ExamLayout = () => {
    const {
        examTitle,
        timeLeft,
        submitExam,
        saveAndNext,
        markForReview,
        clearResponse,
        currentQuestionIndex,
        questions
    } = useExam();

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    return (
        <div className="h-screen flex flex-col bg-gray-50 font-sans text-gray-900 overflow-hidden">
            {/* Header */}
            <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-xl">G</div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 leading-tight">{examTitle || "GATE Mock Exam"}</h1>
                        <p className="text-xs text-gray-500">Candidate: User</p>
                    </div>
                </div>

                <div className={clsx(
                    "flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xl font-bold transition-colors",
                    timeLeft < 300 ? "bg-red-50 text-red-600 animate-pulse" : "bg-gray-100 text-gray-700"
                )}>
                    <Clock size={20} />
                    {formatTime(timeLeft)}
                </div>

                <button
                    onClick={submitExam}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                    Submit Test
                </button>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Question Palette */}
                <aside className="w-80 p-4 hidden md:block">
                    <QuestionPalette />
                </aside>

                {/* Center - Question Area */}
                <main className="flex-1 p-4 flex flex-col min-w-0">
                    <div className="flex-1 min-h-0">
                        <QuestionViewer />
                    </div>
                    <div className="min-h-0">
                        <InputArea />
                    </div>
                </main>
            </div>

            {/* Footer - Controls */}
            <footer className="h-20 bg-white border-t border-gray-200 flex items-center justify-between px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
                <div className="flex gap-4">
                    <button
                        onClick={clearResponse}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                    >
                        <XCircle size={18} />
                        Clear Response
                    </button>
                    <button
                        onClick={markForReview}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 transition-colors border border-purple-100"
                    >
                        <Bookmark size={18} />
                        Mark for Review & Next
                    </button>
                </div>

                <button
                    onClick={saveAndNext}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                    <Save size={18} />
                    {isLastQuestion ? "Save" : "Save & Next"}
                    {!isLastQuestion && <ChevronRight size={18} />}
                </button>
            </footer>
        </div>
    );
};

export default ExamLayout;
