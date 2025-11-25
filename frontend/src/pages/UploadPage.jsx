import React, { useState, useEffect } from 'react';
import { useExam } from '../context/ExamContext';
import { Upload, FileText, CheckCircle, Loader2, Quote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { toast } from 'react-toastify';

const QUOTES = [
    "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    "The only way to do great work is to love what you do.",
    "Believe you can and you're halfway there.",
    "Your time is limited, don't waste it living someone else's life.",
    "The future belongs to those who believe in the beauty of their dreams."
];

const UploadPage = () => {
    const { fetchExam } = useExam();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [quote, setQuote] = useState("");

    useEffect(() => {
        setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    }, []);

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

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            setIsProcessing(false);
            setIsComplete(true);
            toast.success("PDF Processed Successfully!");

            // Auto start after short delay
            setTimeout(async () => {
                const success = await fetchExam();
                if (success) {
                    navigate('/exam');
                }
            }, 1500);

        } catch (error) {
            console.error(error);
            toast.error("Failed to process PDF. Is the backend running?");
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
            {/* Quote Section */}
            <div className="mb-12 text-center max-w-2xl">
                <Quote className="mx-auto text-blue-200 mb-4" size={48} />
                <h2 className="text-2xl md:text-3xl font-light text-gray-700 italic leading-relaxed">
                    "{quote}"
                </h2>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 max-w-lg w-full text-center transition-all hover:shadow-2xl relative overflow-hidden">
                {isProcessing && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                        <Loader2 size={60} className="text-blue-500 animate-spin mb-4" />
                        <p className="text-gray-600 font-medium animate-pulse">Processing Exam Paper...</p>
                    </div>
                )}

                <div className={clsx(
                    "w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors duration-500",
                    isComplete ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                )}>
                    {isComplete ? <CheckCircle size={40} /> : <FileText size={40} />}
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">GATE Mock Engine</h1>
                <p className="text-gray-500 mb-8">Upload your exam PDF to generate the test environment.</p>

                <label className="block group cursor-pointer">
                    <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} disabled={isProcessing || isComplete} />
                    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-8 mb-8 transition-all hover:border-blue-400 hover:bg-blue-50/30 group-hover:scale-[1.02]">
                        <div className="flex flex-col items-center gap-2">
                            <Upload className="text-gray-400 group-hover:text-blue-500 transition-colors" size={32} />
                            <span className="text-sm font-medium text-gray-600">Click to upload PDF</span>
                            <span className="text-xs text-gray-400">Supported Format: GATE Standard</span>
                        </div>
                    </div>
                </label>

                <div className="text-xs text-gray-400 font-medium">
                    Powered by GateMockEngine AI
                </div>
            </div>
        </div>
    );
};

export default UploadPage;
