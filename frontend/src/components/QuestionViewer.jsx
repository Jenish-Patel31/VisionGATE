import React from 'react';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { useExam } from '../context/ExamContext';

const QuestionViewer = () => {
    const { currentQuestion } = useExam();

    if (!currentQuestion) return <div className="flex items-center justify-center h-full text-gray-400">No Question Selected</div>;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Question {currentQuestion.id}</h2>
                <div className="flex gap-3 text-sm font-medium">
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                        {currentQuestion.type}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 border border-green-100">
                        +{currentQuestion.marks}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-100">
                        -{currentQuestion.negativeMarks}
                    </span>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100 overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center p-4">
                    <Zoom>
                        <img
                            src={currentQuestion.imagePath}
                            alt={`Question ${currentQuestion.id}`}
                            className="max-w-full max-h-full object-contain shadow-sm"
                        />
                    </Zoom>
                </div>
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">Click image to zoom</p>
        </div>
    );
};

export default QuestionViewer;
