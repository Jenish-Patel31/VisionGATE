import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '../context/ExamContext';
import { Upload, FileText, CheckCircle, Loader2, Play } from 'lucide-react';
import { toast } from 'react-toastify';
import clsx from 'clsx';

const Home = () => {
    const navigate = useNavigate();
    const { fetchExam } = useExam();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isReady, setIsReady] = useState(false);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            toast.error("Please upload a valid PDF file.");
            return;
        }

        setIsProcessing(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8000/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            // Fetch the processed data
            const success = await fetchExam();
            if (success) {
                setIsReady(true);
                toast.success("Exam Ready!");
            } else {
                throw new Error("Failed to load exam data");
            }
        } catch (error) {
            console.error(error);
            toast.error("Processing failed. Ensure backend is running.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center border border-gray-200">
                <div className="mb-6">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto text-white font-bold text-2xl shadow-lg">
                        G
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mt-4">GATE Mock Test System</h1>
                    <p className="text-gray-500 text-sm mt-1">Upload PDF to Generate Exam</p>
                </div>

                {!isReady ? (
                    <div className="space-y-6">
                        <label className={clsx(
                            "block border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all",
                            isProcessing ? "border-gray-300 bg-gray-50 cursor-wait" : "border-blue-200 hover:border-blue-500 hover:bg-blue-50"
                        )}>
                            <input
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                onChange={handleFileUpload}
                                disabled={isProcessing}
                            />
                            <div className="flex flex-col items-center gap-3">
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="animate-spin text-blue-500" size={32} />
                                        <span className="text-sm text-gray-500 font-medium">Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="text-blue-500" size={32} />
                                        <span className="text-sm text-gray-600 font-medium">Click to Upload PDF</span>
                                        <span className="text-xs text-gray-400">Supports Standard GATE Format</span>
                                    </>
                                )}
                            </div>
                        </label>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                        <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3 text-left">
                            <CheckCircle className="text-green-500 flex-shrink-0" size={24} />
                            <div>
                                <h3 className="font-semibold text-green-800">Exam Ready</h3>
                                <p className="text-xs text-green-600">Data loaded successfully.</p>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/exam')}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                            <Play size={20} />
                            Start Test
                        </button>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-400">
                    GATE Mock Engine v1.0
                </div>
            </div>
        </div>
    );
};

export default Home;
