import React, { useState, useRef } from 'react';
import { Upload, File, Loader2 } from 'lucide-react';

const FileUpload = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setError(null);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const onButtonClick = () => {
        inputRef.current.click();
    };

    const cleanJsonString = (str) => {
        if (str.startsWith("```json")) {
            str = str.replace("```json", "").replace("```", "");
        }
        return str.trim();
    }

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file first.");
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE}/extract`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            const data = await response.json();
            onUploadSuccess(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <div className="p-8">
                <div
                    className={`
                relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300
                ${dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}
                ${file ? 'bg-green-50 dark:bg-green-900/10 border-green-500 dark:border-green-500' : ''}
            `}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx"
                        onChange={handleChange}
                    />

                    {!file ? (
                        <>
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                                <Upload className="w-8 h-8" />
                            </div>
                            <p className="text-gray-900 dark:text-white font-medium text-lg mb-1">
                                Drag & Drop your resume here
                            </p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                                or click to browse (PDF, DOCX)
                            </p>
                            <button
                                onClick={onButtonClick}
                                className="px-6 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                            >
                                Select File
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
                                <File className="w-8 h-8" />
                            </div>
                            <p className="text-gray-900 dark:text-white font-medium text-lg truncate w-full px-4">
                                {file.name}
                            </p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                                Ready to extract
                            </p>
                            <button
                                onClick={() => setFile(null)}
                                className="text-sm text-red-500 hover:text-red-600 font-medium"
                            >
                                Remove file
                            </button>
                        </>
                    )}
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleUpload}
                    disabled={loading || !file}
                    className={`
            w-full mt-6 py-3.5 px-4 rounded-xl text-white font-semibold text-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2
            ${loading || !file
                            ? 'bg-gray-400 cursor-not-allowed dark:bg-gray-700'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/30 hover:-translate-y-0.5'}
          `}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Analyzing Resume...
                        </>
                    ) : (
                        'Extract Details'
                    )}
                </button>
            </div>
        </div>
    );
};

export default FileUpload;
