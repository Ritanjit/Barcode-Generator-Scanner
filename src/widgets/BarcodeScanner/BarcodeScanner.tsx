// src/widgets/BarcodeScanner/BarcodeScanner.tsx
import { X } from 'lucide-react';
import React from 'react';
// The library name in the import might be different based on your package.json,
// but the component usage is the key.
import BarcodeScanner from 'react-qr-barcode-scanner';

const BarScanner = ({
    onScan,
    onError,
    onStop
}: {
    onScan: (data: string | null) => void,
    onError: (err: any) => void,
    onStop: () => void
}) => {
    return (
        <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden">
                <BarcodeScanner
                    onUpdate={(err, result) => {
                        // Use optional chaining for safety
                        if (result) onScan(result?.getText()); 
                        // Note: onUpdate provides both err and result, so handling the error here might be redundant
                        // if you also have the onError prop, but it's safe.
                        if (err) onError(err);
                    }}
                    onError={onError} // This is for fatal errors like camera access denied
                    // --- FIX: Rename 'constraints' to 'videoConstraints' ---
                    videoConstraints={{ 
                        facingMode: 'environment',
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    }}
                />
                <div className="absolute inset-4 border-4 border-indigo-500 rounded-xl pointer-events-none shadow-lg">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                </div>
            </div>

            <button
                onClick={onStop}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium border border-gray-200"
            >
                <X className="w-5 h-5" />
                Stop Scanner
            </button>
        </div>
    );
};

export default BarScanner;