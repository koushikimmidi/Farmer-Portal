import React, { useState, useEffect, useRef } from 'react';
import { Sprout, ArrowRight, Loader2, Smartphone, Lock, AlertTriangle, Copy, Check, Globe } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { auth, initializationError } from '../services/firebase';

interface LoginProps {
  onLoginSuccess: (data: any) => void;
}

// Define window interface to include recaptchaVerifier
declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [currentDomain, setCurrentDomain] = useState('');
  const isVerifierRendering = useRef(false);

  useEffect(() => {
    // Domain detection for user convenience
    const detectDomain = () => {
        if (typeof window !== 'undefined') {
            const domain = window.location.host || window.location.hostname || window.location.origin?.replace(/^https?:\/\//, '') || window.location.href;
            setCurrentDomain(domain);
        }
    };
    detectDomain();

    if (initializationError) {
        setError(`System Error: ${initializationError.message || 'Firebase failed to load'}`);
        return;
    }

    if (!auth) {
        setError("System Error: Auth service is not ready. Check internet connection.");
        return;
    }

    // Initialize Recaptcha with proper cleanup
    const initRecaptcha = async () => {
        // Check if verifier already exists to avoid duplicates
        if (window.recaptchaVerifier) {
             return;
        }
        
        if (isVerifierRendering.current) return;
        isVerifierRendering.current = true;

        try {
            // Explicitly clear the container content to remove old iframes
            const container = document.getElementById('recaptcha-container');
            if (container) {
                container.innerHTML = '';
            }

            // Create new verifier
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': () => {
                    // reCAPTCHA solved
                },
                'expired-callback': () => {
                    setError('Recaptcha expired, please try again');
                    setLoading(false);
                    if (window.recaptchaVerifier) {
                        try { window.recaptchaVerifier.clear(); } catch (e) {}
                        window.recaptchaVerifier = null;
                    }
                }
            });
            
            await window.recaptchaVerifier.render();
        } catch (err: any) {
            console.error("Recaptcha Init Error:", err);
            // Do not set global verifier to null here blindly, just log.
            // The component might be unmounting.
        } finally {
            isVerifierRendering.current = false;
        }
    };

    // Small delay to ensure DOM is ready and previous cleanup finished
    const timer = setTimeout(() => {
        initRecaptcha();
    }, 500);

    // Cleanup function
    return () => {
        clearTimeout(timer);
        if (window.recaptchaVerifier) {
            try {
                window.recaptchaVerifier.clear();
            } catch (e) {
                console.warn("Recaptcha cleanup error (benign)", e);
            }
            window.recaptchaVerifier = null;
        }
        isVerifierRendering.current = false;
    };
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (phoneNumber.length < 10) {
        setError('Please enter a valid 10-digit mobile number');
        return;
    }

    if (!auth) {
        setError("Auth not initialized. Refresh page.");
        return;
    }

    const formattedNumber = `+91${phoneNumber}`;
    setLoading(true);
    
    try {
        // Ensure verifier exists before calling sign in
        if (!window.recaptchaVerifier) {
             // Re-initialize if missing (should be rare)
             const container = document.getElementById('recaptcha-container');
             if (container) container.innerHTML = '';
             window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible'
             });
             await window.recaptchaVerifier.render();
        }
        
        const result = await signInWithPhoneNumber(auth, formattedNumber, window.recaptchaVerifier);
        setConfirmationResult(result);
        setStep('OTP');
    } catch (err: any) {
        console.error("SMS Error:", err);
        
        if (err.code === 'auth/invalid-api-key') {
             setError("Config Error: Invalid API Key.");
        } else if (err.message?.includes("domain") || err.code === "auth/unauthorized-domain") {
             const domainInError = err.message.match(/\((.*?)\)/)?.[1] || currentDomain;
             setError(`Domain Unauthorized: ${domainInError}`);
             setCurrentDomain(domainInError); 
        } else if (err.code === 'auth/internal-error') {
             // Force cleanup on internal error so user can retry
             if (window.recaptchaVerifier) {
                 try { window.recaptchaVerifier.clear(); } catch (e) {}
                 window.recaptchaVerifier = null;
             }
             setError("Internal Error. Please refresh the page or try again in 5 seconds.");
        } else if (err.code === 'auth/too-many-requests') {
             setError("Too many attempts. Please try again later.");
        } else {
             setError(err.message || 'Failed to send OTP.');
        }
    } finally {
        setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length < 6) {
        setError('Please enter the 6-digit OTP');
        return;
    }

    if (!confirmationResult) {
        setError('Session expired. Please request OTP again.');
        setStep('PHONE');
        return;
    }

    setLoading(true);

    try {
        const result = await confirmationResult.confirm(otp);
        const user = result.user;
        
        onLoginSuccess({
            user_country_code: "+91",
            user_phone_number: phoneNumber, 
            user_first_name: "Farmer",
            user_last_name: "",
            uid: user.uid
        });
    } catch (err: any) {
        console.error("Verify Error:", err);
        setError("Invalid OTP. Please check and try again.");
    } finally {
        setLoading(false);
    }
  };

  const copyDomain = () => {
      if (currentDomain) {
        navigator.clipboard.writeText(currentDomain);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-leaf-50 to-white flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-leaf-400 to-leaf-600"></div>

        <div className="flex flex-col items-center mb-8">
            <div className="bg-leaf-100 p-4 rounded-full mb-4">
                <Sprout className="w-10 h-10 text-leaf-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome to KrishiUday</h1>
            <p className="text-gray-500 text-sm mt-1">Smart Advisory for Indian Farmers</p>
        </div>
        
        {step === 'PHONE' ? (
            <form onSubmit={handleSendOtp} className="space-y-6 animate-fade-in">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <span className="text-gray-500 font-bold">+91</span>
                        </div>
                        <input 
                            type="tel" 
                            className="block w-full pl-12 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-leaf-500 focus:border-leaf-500 transition outline-none text-lg tracking-wide" 
                            placeholder="98765 43210"
                            value={phoneNumber}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                setPhoneNumber(val);
                            }}
                            autoFocus
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <Smartphone className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                    {error && (
                        <div className="flex items-start gap-2 text-red-600 text-xs mt-3 bg-red-50 p-3 rounded-lg border border-red-100">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> 
                            <span className="flex-1 font-medium break-words">{error}</span>
                        </div>
                    )}
                </div>

                <div id="recaptcha-container"></div>

                <button 
                    type="submit" 
                    disabled={loading || phoneNumber.length < 10}
                    className="w-full flex items-center justify-center bg-leaf-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-leaf-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                    {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <>Send OTP <ArrowRight className="ml-2 w-5 h-5" /></>}
                </button>
            </form>
        ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6 animate-fade-in">
                <div className="text-center mb-4">
                    <p className="text-sm text-gray-600">Enter the 6-digit OTP sent to</p>
                    <p className="font-bold text-gray-900">+91 {phoneNumber} <button type="button" onClick={() => setStep('PHONE')} className="text-leaf-600 text-xs font-normal underline ml-1">Edit</button></p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-center">One Time Password</label>
                    <div className="relative max-w-[240px] mx-auto">
                        <input 
                            type="text" 
                            className="block w-full text-center py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-leaf-500 focus:border-leaf-500 transition outline-none text-2xl tracking-[0.5em] font-mono" 
                            placeholder="••••••"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            autoFocus
                        />
                         <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                            <Lock className="h-4 w-4 text-gray-300" />
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
                </div>

                <button 
                    type="submit" 
                    disabled={loading || otp.length < 6}
                    className="w-full flex items-center justify-center bg-leaf-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-leaf-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                    {loading ? <Loader2 className="animate-spin w-6 h-6" /> : 'Verify & Login'}
                </button>
            </form>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 text-left">
                <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-3 h-3 text-blue-600" />
                    <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">Setup Required</p>
                </div>
                <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                   Add this domain to <span className="font-medium">Firebase Console &rarr; Auth &rarr; Settings &rarr; Authorized domains</span>:
                </p>
                <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                         <input 
                            readOnly
                            value={currentDomain || "Detecting domain..."}
                            className="block w-full bg-white border border-gray-200 p-2 rounded text-xs font-mono text-gray-700 outline-none pr-8 truncate"
                            onClick={(e) => e.currentTarget.select()}
                        />
                    </div>
                    <button 
                        onClick={copyDomain}
                        className="p-2 bg-white border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-200 transition text-gray-500 hover:text-blue-600"
                        title="Copy Domain"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};