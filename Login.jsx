import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { HAMCSLogo } from './HAMCSLogo';
import { FcGoogle } from 'react-icons/fc';

export function Login() {
    const { signInWithGoogle } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');

        const result = await signInWithGoogle();

        if (result.error) {
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <HAMCSLogo className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-1">HAMCS</h1>
                    <p className="text-sm text-slate-600">Human–AI Memory Continuity System</p>
                </div>

                {/* Login Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-lg">
                    <h2 className="text-xl font-semibold text-slate-900 text-center mb-2">Welcome Back</h2>
                    <p className="text-sm text-slate-600 text-center mb-8">
                        Sign in to save and sync your decisions across devices
                    </p>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
                            <p className="text-sm text-red-700 text-center">{error}</p>
                        </div>
                    )}

                    {/* Google Sign In Button */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-sky-600 hover:bg-sky-700 text-white font-medium py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <FcGoogle className="w-5 h-5" />
                                <span>Continue with Google</span>
                            </>
                        )}
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-slate-200"></div>
                        <span className="text-sm text-slate-500 font-medium">Features</span>
                        <div className="flex-1 h-px bg-slate-200"></div>
                    </div>

                    {/* Features Preview */}
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-sky-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-sky-600 text-sm font-bold">✓</span>
                            </div>
                            <div>
                                <p className="text-sm text-slate-900 font-medium">AI-Powered Decision Tracking</p>
                                <p className="text-xs text-slate-500">Log decisions with automatic reasoning extraction</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-sky-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-sky-600 text-sm font-bold">✓</span>
                            </div>
                            <div>
                                <p className="text-sm text-slate-900 font-medium">Context-Aware Chat</p>
                                <p className="text-xs text-slate-500">Get advice based on your past decisions</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-sky-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-sky-600 text-sm font-bold">✓</span>
                            </div>
                            <div>
                                <p className="text-sm text-slate-900 font-medium">Sync Across Devices</p>
                                <p className="text-xs text-slate-500">Your memories, always accessible</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-xs text-slate-600 text-center mt-6">
                    By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
}
