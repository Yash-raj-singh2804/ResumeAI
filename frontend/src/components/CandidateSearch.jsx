import React, { useState } from 'react';
import { Search, User, Briefcase, Code, Sparkles } from 'lucide-react';

const CandidateSearch = () => {
    const [query, setQuery] = useState("");
    const [skillsKey, setSkillsKey] = useState(""); // Comma separated string
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async () => {
        if (!query.trim()) return;

        setSearching(true);
        setError(null);
        setResults([]);

        try {
            const skillList = skillsKey.split(',').map(s => s.trim()).filter(s => s.length > 0);

            const payload = {
                query: query,
                skills: skillList.length > 0 ? skillList : null,
                limit: 10
            };

            const response = await fetch(`${import.meta.env.VITE_API_BASE}/search/candidates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error("Search failed");

            const data = await response.json();
            setResults(data);

        } catch (err) {
            console.error(err);
            setError("Failed to fetch candidates. Ensure backend is running.");
        } finally {
            setSearching(false);
        }
    };

    return (
        <section id="candidate-search" className="py-20 bg-white dark:bg-slate-950 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="mb-12 text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-semibold mb-3">
                        Recruiter Tools
                    </span>
                    <h2 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight mb-4">
                        Smart Candidate Search
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Find the perfect match using AI. Describe your ideal candidate in plain English.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto mb-16">
                    <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800">
                        <div className="flex flex-col gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Describe the Role (Semantic Search)
                                </label>
                                <div className="relative">
                                    <textarea
                                        rows="2"
                                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none shadow-sm"
                                        placeholder="e.g. Senior Backend Engineer with experience in Python, vector databases, and scalable search systems."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSearch())}
                                    />
                                    <Search className="absolute left-4 top-5 w-6 h-6 text-slate-400" />
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Required Skills (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                                        placeholder="Python, React, AWS (Comma separated)"
                                        value={skillsKey}
                                        onChange={(e) => setSkillsKey(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={handleSearch}
                                        disabled={searching || !query}
                                        className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center gap-2 h-[50px]
                                            ${searching || !query
                                                ? 'bg-slate-400 cursor-not-allowed'
                                                : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95 shadow-indigo-200 dark:shadow-none'}`}
                                    >
                                        {searching ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-b-white"></div>
                                                Running...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5" />
                                                Find Talent
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Grid */}
                {results.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                        {results.map((candidate) => (
                            <div key={candidate.candidate_id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-md border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all duration-300 group">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">
                                            {candidate.name || "Unknown Candidate"}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                                            <Briefcase className="w-3 h-3" />
                                            {candidate.role}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className={`text-2xl font-black ${candidate.score >= 85 ? 'text-emerald-500' :
                                            candidate.score >= 70 ? 'text-indigo-500' : 'text-slate-400'
                                            }`}>
                                            {candidate.score}%
                                        </span>
                                        <span className="text-xs text-slate-400">Match</span>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="flex flex-wrap gap-2">
                                        {candidate.skills.slice(0, 4).map((skill, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded-md font-medium">
                                                {skill}
                                            </span>
                                        ))}
                                        {candidate.skills.length > 4 && (
                                            <span className="px-2 py-1 bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-xs rounded-md font-medium">
                                                +{candidate.skills.length - 4} more
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                                        "{candidate.summary}"
                                    </p>
                                    <button className="w-full mt-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        View Profile
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {results.length === 0 && !searching && error && (
                    <div className="text-center text-rose-500 bg-rose-50 dark:bg-rose-900/10 p-4 rounded-xl max-w-lg mx-auto border border-rose-100 dark:border-rose-900/20">
                        {error}
                    </div>
                )}
            </div>
        </section>
    );
};

export default CandidateSearch;
