import { useNavigate } from 'react-router-dom';

interface ErrorPageProps {
    error?: Error;
    resetError?: () => void;
}

const ErrorPage = ({ error, resetError }: ErrorPageProps) => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        if (resetError) {
            resetError();
        }
        navigate('/calendar');
    };

    const handleReload = () => {
        if (resetError) {
            resetError();
        }
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700 p-8 shadow-2xl">
                {/* Error Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center">
                        <svg
                            className="w-12 h-12 text-red-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                </div>

                {/* Error Title */}
                <h1 className="text-4xl font-bold text-white text-center mb-4">
                    Något gick fel!
                </h1>

                {/* Error Description */}
                <p className="text-slate-300 text-center mb-6">
                    Vi ber om ursäkt, men något oväntat hände. Försök att ladda om sidan eller gå tillbaka till startsidan.
                </p>

                {/* Error Details (only in development) */}
                {error && import.meta.env.DEV && (
                    <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-red-500/30">
                        <h3 className="text-red-400 font-semibold mb-2">Feldetaljer:</h3>
                        <p className="text-sm text-slate-400 font-mono break-all">
                            {error.message}
                        </p>
                        {error.stack && (
                            <details className="mt-2">
                                <summary className="text-sm text-slate-400 cursor-pointer hover:text-slate-300">
                                    Stack trace
                                </summary>
                                <pre className="text-xs text-slate-500 mt-2 overflow-x-auto">
                                    {error.stack}
                                </pre>
                            </details>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={handleReload}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                        Ladda om sidan
                    </button>

                    <button
                        onClick={handleGoHome}
                        className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                        </svg>
                        Gå till startsidan
                    </button>
                </div>

                {/* Help Text */}
                <p className="text-sm text-slate-500 text-center mt-6">
                    Om problemet kvarstår, kontakta support eller försök igen senare.
                </p>
            </div>
        </div>
    );
};

export default ErrorPage;
