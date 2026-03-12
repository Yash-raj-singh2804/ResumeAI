import React, { useState, useEffect } from 'react';
import { Send, Star, AlertCircle, AlertTriangle, Lightbulb } from 'lucide-react';

const AtsSimulator = ({ preSelectedResumeId = "" }) => {
    const [resumes, setResumes] = useState([]);
    const [selectedResumeId, setSelectedResumeId] = useState(preSelectedResumeId);
    const [jobDescription, setJobDescription] = useState("");
    const [atsResult, setAtsResult] = useState(null);
    const [evaluating, setEvaluating] = useState(false);

    const fetchResumes = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE}/resumes`);
            const data = await response.json();
            setResumes(data);
        } catch (error) {
            console.error("Failed to fetch resumes", error);
        }
    };

    const handleEvaluate = async () => {
        if (!selectedResumeId || !jobDescription) return;
        setEvaluating(true);
        setAtsResult(null);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE}/ats/evaluate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resume_id: parseInt(selectedResumeId),
                    job_description: jobDescription
                })
            });
            const data = await response.json();
            setAtsResult(data);
        } catch (error) {
            console.error("Evaluation failed", error);
        } finally {
            setEvaluating(false);
        }
    };

    useEffect(() => {
        fetchResumes();
    }, []);

    // Update selected ID if prop changes
    useEffect(() => {
        if (preSelectedResumeId) {
            setSelectedResumeId(preSelectedResumeId);
        }
    }, [preSelectedResumeId]);

    return (
        <section id="ats-simulator" className="py-20 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="mb-12 text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-sm font-semibold mb-3">
                        New Feature
                    </span>
                    <h2 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight mb-4">
                        AI ATS Simulator
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Test how your resume scores against real job descriptions using our advanced AI ranking system.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Input Panel */}
                    <div className="lg:col-span-1 bg-white dark:bg-slate-950 p-6 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Parsed Resume</label>
                                <select
                                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                                    value={selectedResumeId}
                                    onChange={(e) => setSelectedResumeId(e.target.value)}
                                >
                                    <option value="">-- Choose a Resume --</option>
                                    {resumes.map((resume) => (
                                        <option key={resume.id} value={resume.id}>
                                            {resume.filename} ({resume.role || "Unknown Role"}) - {resume.date}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500 mt-2">
                                    Don't see your resume? Upload it above first.
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Job Description (JD)</label>
                                <textarea
                                    rows="10"
                                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-colors"
                                    placeholder="Paste the Job Description here..."
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={handleEvaluate}
                                disabled={evaluating || !selectedResumeId || !jobDescription}
                                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2
                                    ${evaluating || !selectedResumeId || !jobDescription
                                        ? 'bg-slate-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:scale-105 active:scale-95 shadow-orange-200 dark:shadow-none'}`}
                            >
                                {evaluating ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-b-white"></div>
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Run ATS Check
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Result Panel */}
                    <div className="lg:col-span-2">
                        {atsResult ? (
                            <div className="bg-white dark:bg-slate-950 p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 h-full animate-fadeIn">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Evaluation Result</h3>
                                    <span className={`px-5 py-2 rounded-full text-base font-bold shadow-sm 
                                        ${atsResult.pass_probability === 'High' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                            atsResult.pass_probability === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                                        Probability: {atsResult.pass_probability}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    {/* Score Card */}
                                    <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl flex flex-col items-center justify-center border border-slate-100 dark:border-slate-800">
                                        <div className="text-sm text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider font-semibold">ATS Score</div>
                                        <div className={`text-7xl font-black ${atsResult.ats_score >= 80 ? 'text-emerald-500' :
                                            atsResult.ats_score >= 60 ? 'text-amber-500' :
                                                'text-rose-500'
                                            }`}>
                                            {atsResult.ats_score}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-2">out of 100</div>
                                    </div>

                                    {/* Issues Summary */}
                                    <div className="md:col-span-2 space-y-4">
                                        {atsResult.missing_skills?.length > 0 && (
                                            <div className="bg-rose-50 dark:bg-rose-900/10 p-4 rounded-xl border border-rose-100 dark:border-rose-800/20">
                                                <h4 className="flex items-center gap-2 font-semibold text-rose-700 dark:text-rose-400 mb-2 text-sm">
                                                    <AlertCircle className="w-4 h-4" />
                                                    Missing Skills
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {atsResult.missing_skills.map(skill => (
                                                        <span key={skill} className="px-2 py-1 bg-white dark:bg-slate-950 text-rose-600 dark:text-rose-400 text-xs rounded-md border border-rose-100 dark:border-rose-900/30 font-medium shadow-sm">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {atsResult.formatting_issues?.length > 0 && (
                                            <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-800/20">
                                                <h4 className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-400 mb-2 text-sm">
                                                    <AlertTriangle className="w-4 h-4" />
                                                    Formatting Issues
                                                </h4>
                                                <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1 list-disc list-inside">
                                                    {atsResult.formatting_issues.map((issue, idx) => (
                                                        <li key={idx}>{issue}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                        <Lightbulb className="w-5 h-5 text-indigo-500" />
                                        AI Reasoning & Feedback
                                    </h4>
                                    <p className="text-slate-600 dark:text-slate-400 bg-indigo-50 dark:bg-slate-900/50 p-5 rounded-2xl text-base leading-relaxed border border-indigo-100 dark:border-slate-800">
                                        {atsResult.reasoning}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-100 dark:bg-slate-900/50 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-3xl h-full flex flex-col items-center justify-center text-slate-400 min-h-[300px]">
                                <div className="p-4 bg-slate-200 dark:bg-slate-800 rounded-full mb-4">
                                    <Star className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400">Ready to Analyze</h3>
                                <p className="text-sm font-medium opacity-70">Select a resume and paste a JD to start</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AtsSimulator;
