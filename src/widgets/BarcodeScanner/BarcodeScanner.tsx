// src/widgets/BarcodeScanner/BarcodeScanner.tsx
import { X } from 'lucide-react';
import React, { useState } from 'react';
import BarcodeScanner from 'react-qr-barcode-scanner';

// Import or define the correct format types
// If the library exports these types, use them directly
import { BarcodeFormat } from 'react-qr-barcode-scanner';

// If the library doesn't export them, you can define them based on the library's documentation
// These are the typical format values for zxing-js which react-qr-barcode-scanner uses internally
const Formats = {
    AZTEC: 'aztec',
    CODABAR: 'codabar',
    CODE_39: 'code_39',
    CODE_93: 'code_93',
    CODE_128: 'code_128',
    DATA_MATRIX: 'data_matrix',
    EAN_8: 'ean_8',
    EAN_13: 'ean_13',
    ITF: 'itf',
    PDF_417: 'pdf_417',
    QR_CODE: 'qr_code',
    UPC_A: 'upc_a',
    UPC_E: 'upc_e',
} as const;

type BarcodeFormatType = typeof Formats[keyof typeof Formats];

const BarScanner = ({
    onScan,
    onError,
    onStop
}: {
    onScan: (data: string | null) => void,
    onError: (err: any) => void,
    onStop: () => void
}) => {
    const [scanning, setScanning] = useState(true);
    const [lastError, setLastError] = useState<string | null>(null);

    const handleScan = (data: string | null) => {
        if (data) {
            setLastError(null);
            onScan(data);
        }
    };

    const handleError = (err: any) => {
        console.error('Scanner error:', err);

        // Filter out "no barcode found" errors
        if (!err.message.includes('No MultiFormat Readers')) {
            setLastError(err.message);
            onError(err);
        }
    };

    // Correct format array using the defined formats
    const supportedFormats = [
        BarcodeFormat.CODE_128,
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.CODE_39,
        BarcodeFormat.CODE_93,
        BarcodeFormat.CODABAR,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.ITF,
        BarcodeFormat.QR_CODE
    ];

    return (
        <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden">
                <BarcodeScanner
                    onUpdate={(err, result) => {
                        if (err) {
                            handleError(err);
                            return;
                        }
                        if (result) {
                            handleScan(result.getText());
                        }
                    }}
                    onError={handleError}
                    videoConstraints={{
                        facingMode: 'environment',
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                    }}
                    torch={false}
                    delay={500}
                    facingMode="environment"
                    formats={supportedFormats}
                />
                <div className="absolute inset-4 border-4 border-indigo-500 rounded-xl pointer-events-none shadow-lg">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                </div>
            </div>

            {/* Show scanning tips */}
            {lastError && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-700">{lastError}</p>
                </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Scanning Tips:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Hold steady 6-12 inches from barcode</li>
                    <li>• Ensure good lighting</li>
                    <li>• Align barcode with the guide</li>
                    <li>• Try different angles if not detected</li>
                </ul>
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