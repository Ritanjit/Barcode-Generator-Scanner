// src\widgets\BarcodeScanner\BarcodeTools.tsx
import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    Suspense,
    lazy
} from 'react';
// import {BarScanner} from './BarcodeScanner'
import JsBarcode from 'jsbarcode';
import {
    ScanBarcode,
    ScanLine,
    Download,
    Copy,
    Camera,
    X,
    CheckCircle,
    AlertCircle,
    ArrowRight,
    Sparkles,
    Zap
} from 'lucide-react';

// Types
interface BarcodeFormat {
    value: string;
    label: string;
    description: string;
}

interface ScanResult {
    text: string;
    timestamp: number;
}

const BARCODE_FORMATS: BarcodeFormat[] = [
    { value: 'CODE128', label: 'CODE 128', description: 'Most versatile, supports all ASCII characters' },
    { value: 'EAN13', label: 'EAN-13', description: 'International retail standard (13 digits)' },
    { value: 'UPC', label: 'UPC-A', description: 'North American retail standard (12 digits)' },
    { value: 'CODE39', label: 'CODE 39', description: 'Alphanumeric, widely used in logistics' },
    { value: 'ITF', label: 'ITF-14', description: 'Shipping containers (14 digits)' },
];

// Lazy load scanner
const BarScanner = lazy(() => import('./BarcodeScanner'));

export default function EnhancedBarcodeToolkit() {
    // Generator states
    const [barcodeData, setBarcodeData] = useState('https://example.com');
    const [barcodeFormat, setBarcodeFormat] = useState('CODE128');
    const [barcodeSvgString, setBarcodeSvgString] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);

    // Scanner states
    const [showScanner, setShowScanner] = useState(false);
    const [scannedResults, setScannedResults] = useState<ScanResult[]>([]);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // UI states
    const [copiedText, setCopiedText] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'generate' | 'scan'>('generate');

    // Generate barcode with improved error handling
    const generateBarcode = useCallback(async () => {
        if (!barcodeData.trim()) {
            setBarcodeSvgString(null);
            return;
        }

        setIsGenerating(true);
        setGenerationError(null);

        try {
            // Add a small delay for better UX
            await new Promise(resolve => setTimeout(resolve, 200));

            // Create an in-memory SVG element to render the barcode
            const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

            // Call JsBarcode to populate the SVG element
            JsBarcode(svgNode, barcodeData.trim(), {
                format: barcodeFormat,
                lineColor: '#1f2937',
                width: 2,
                height: 100,
                displayValue: true,
                margin: 15,
                fontSize: 14,
                fontOptions: 'bold',
                textMargin: 8,
            });

            // Get the SVG markup as a string
            const svgString = svgNode.outerHTML;
            setBarcodeSvgString(svgString);

        } catch (err: any) {
            console.error('Barcode generation error:', err);
            setGenerationError(err.message || 'Failed to generate barcode. Please check your input.');
            setBarcodeSvgString(null);
        } finally {
            setIsGenerating(false);
        }
    }, [barcodeData, barcodeFormat]);

    useEffect(() => {
        generateBarcode();
    }, [generateBarcode]);

    // Enhanced copy function with feedback
    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedText(text);
            setTimeout(() => setCopiedText(null), 2000);
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopiedText(text);
            setTimeout(() => setCopiedText(null), 2000);
        }
    };

    // Enhanced download with better filename
    const downloadBarcode = () => {
        if (!barcodeSvgString) return;

        const formatName = BARCODE_FORMATS.find(f => f.value === barcodeFormat)?.label || barcodeFormat;
        const sanitizedData = barcodeData.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
        const filename = `${formatName}_${sanitizedData}_${Date.now()}.svg`;

        const dataUrl = `data:image/svg+xml,${encodeURIComponent(barcodeSvgString)}`;
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Scanner handlers with improved UX
    const handleScan = (data: string | null) => {
        if (data && data.trim()) {
            const newResult: ScanResult = {
                text: data.trim(),
                timestamp: Date.now()
            };

            setScannedResults(prev => [newResult, ...prev.slice(0, 4)]); // Keep last 5 results
            setShowScanner(false);
            setIsLoading(false);
        }
    };

    const handleScanError = (err: any) => {
        console.error('Scanner error:', err);
        setCameraError('Unable to access camera. Please check permissions and try again.');
        setShowScanner(false);
        setIsLoading(false);
    };

    const startScanner = async () => {
        setIsLoading(true);
        setCameraError(null);

        // Check camera permissions
        try {
            await navigator.mediaDevices.getUserMedia({ video: true });
            setShowScanner(true);
        } catch (err) {
            setCameraError('Camera access denied. Please enable camera permissions and try again.');
            setIsLoading(false);
        }
    };

    const stopScanner = () => {
        setShowScanner(false);
        setIsLoading(false);
    };

    const useScannedResult = (result: string) => {
        setBarcodeData(result);
        setActiveTab('generate');
        // Smooth scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clearScanHistory = () => {
        setScannedResults([]);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Header */}
            <header className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="relative">
                                <ScanBarcode className="w-12 h-12 text-indigo-600" />
                                <Sparkles className="w-5 h-5 text-purple-500 absolute -top-1 -right-1" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
                                Barcode Toolkit
                            </h1>
                        </div>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            Professional barcode generation and scanning tools with real-time preview and batch processing capabilities
                        </p>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tab Navigation */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-lg border border-gray-200/50">
                        <div className="flex gap-1">
                            <button
                                onClick={() => setActiveTab('generate')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${activeTab === 'generate'
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                                    }`}
                            >
                                <ScanBarcode className="w-5 h-5" />
                                Generate
                            </button>
                            <button
                                onClick={() => setActiveTab('scan')}
                                className={`flex items-center gap-2 px-10 py-3 rounded-lg font-medium transition-all duration-200 ${activeTab === 'scan'
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                                    }`}
                            >
                                <ScanLine className="w-5 h-5" />
                                Scan
                            </button>
                        </div>
                    </div>
                </div>

                {/* Generator Section */}
                {activeTab === 'generate' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Input Controls */}
                        <div className="lg:col-span-1">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 sticky top-8">
                                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <Zap className="w-6 h-6 text-indigo-600" />
                                    Configuration
                                </h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Content to Encode
                                        </label>
                                        <textarea
                                            value={barcodeData}
                                            onChange={(e) => setBarcodeData(e.target.value)}
                                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none bg-gray-50/50"
                                            rows={4}
                                            placeholder="Enter text, URL, or any data..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Barcode Format
                                        </label>
                                        <div className="space-y-2">
                                            {BARCODE_FORMATS.map((format) => (
                                                <label key={format.value} className="flex items-start gap-3 p-3 rounded-lg hover:bg-indigo-50 cursor-pointer transition-colors">
                                                    <input
                                                        type="radio"
                                                        name="barcodeFormat"
                                                        value={format.value}
                                                        checked={barcodeFormat === format.value}
                                                        onChange={(e) => setBarcodeFormat(e.target.value)}
                                                        className="mt-1 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-gray-800">{format.label}</div>
                                                        <div className="text-sm text-gray-500">{format.description}</div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Preview and Actions */}
                        <div className="lg:col-span-2">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
                                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <ScanBarcode className="w-6 h-6 text-indigo-600" />
                                    Live Preview
                                </h2>

                                <div className="space-y-6">
                                    {/* Barcode Display */}
                                    <div className="relative">
                                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-xl border-2 border-dashed border-gray-200 min-h-[250px] flex items-center justify-center">
                                            {isGenerating ? (
                                                <div className="text-center">
                                                    <div className="animate-spin w-8 h-8 border-3 border-indigo-300 border-t-indigo-600 rounded-full mx-auto mb-3"></div>
                                                    <p className="text-indigo-600 font-medium">Generating barcode...</p>
                                                </div>
                                            ) : generationError ? (
                                                <div className="text-center text-red-500">
                                                    <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                                    <p className="font-medium">{generationError}</p>
                                                </div>
                                            ) : barcodeSvgString ? (
                                                <div className="text-center w-full barcode-container"
                                                    dangerouslySetInnerHTML={{ __html: barcodeSvgString }} />
                                            ) : (
                                                <div className="text-center text-gray-400">
                                                    <ScanBarcode className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                                    <p className="text-lg">Your barcode will appear here</p>
                                                    <p className="text-sm mt-2">Enter content above to generate</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {barcodeSvgString && !generationError && (
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <button
                                                onClick={downloadBarcode}
                                                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-3 font-medium shadow-lg hover:shadow-xl"
                                            >
                                                <Download className="w-5 h-5" />
                                                Download SVG
                                            </button>
                                            <button
                                                onClick={() => copyToClipboard(barcodeData)}
                                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 font-medium border border-gray-200"
                                            >
                                                {copiedText === barcodeData ? (
                                                    <>
                                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                                        Copied!
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-5 h-5" />
                                                        Copy Content
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Scanner Section */}
                {activeTab === 'scan' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Scanner */}
                        <div className="lg:col-span-2">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
                                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <ScanLine className="w-6 h-6 text-indigo-600" />
                                    Barcode Scanner
                                </h2>

                                {!showScanner ? (
                                    <div className="text-center">
                                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-dashed border-indigo-200 rounded-xl h-64 flex flex-col items-center justify-center mb-6">
                                            <Camera className="w-16 h-16 text-indigo-400 mb-4" />
                                            <p className="text-gray-600 text-lg font-medium">Ready to scan</p>
                                            <p className="text-gray-500 text-sm mt-2">Position barcode in camera view</p>
                                        </div>

                                        <button
                                            onClick={startScanner}
                                            disabled={isLoading}
                                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-8 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div>
                                                    Starting Camera...
                                                </>
                                            ) : (
                                                <>
                                                    <Camera className="w-5 h-5" />
                                                    Start Scanner
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <Suspense fallback={
                                        <div className="flex items-center justify-center h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                                            <div className="text-center">
                                                <div className="animate-spin w-8 h-8 border-3 border-indigo-300 border-t-indigo-600 rounded-full mx-auto mb-3"></div>
                                                <p className="text-indigo-600 font-medium">Loading scanner...</p>
                                            </div>
                                        </div>
                                    }>
                                        <BarScanner
                                            onScan={handleScan}
                                            onError={handleScanError}
                                            onStop={stopScanner}
                                        />
                                    </Suspense>
                                )}

                                {cameraError && (
                                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                            <p className="text-red-700">{cameraError}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Scan Results */}
                        <div className="lg:col-span-1">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 sticky top-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                        Scan History
                                    </h2>
                                    {scannedResults.length > 0 && (
                                        <button
                                            onClick={clearScanHistory}
                                            className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>

                                {scannedResults.length === 0 ? (
                                    <div className="text-center py-8">
                                        <ScanLine className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No scans yet</p>
                                        <p className="text-sm text-gray-400 mt-1">Scanned results will appear here</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {scannedResults.map((result, index) => (
                                            <div key={result.timestamp} className="p-4 bg-green-50 border border-green-200 rounded-xl">
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <p className="text-sm font-mono text-gray-700 break-all leading-relaxed">
                                                        {result.text}
                                                    </p>
                                                    <button
                                                        onClick={() => copyToClipboard(result.text)}
                                                        className="text-green-600 hover:text-green-800 transition-colors flex-shrink-0"
                                                        title="Copy to clipboard"
                                                    >
                                                        {copiedText === result.text ? (
                                                            <CheckCircle className="w-4 h-4" />
                                                        ) : (
                                                            <Copy className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(result.timestamp).toLocaleTimeString()}
                                                    </span>
                                                    <button
                                                        onClick={() => useScannedResult(result.text)}
                                                        className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 font-medium"
                                                    >
                                                        Use in generator
                                                        <ArrowRight className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="mt-16 bg-white/50 backdrop-blur-sm border-t border-gray-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center text-gray-600">
                        <p className="text-lg font-medium">Barcode Toolkit</p>
                        <p className="text-sm mt-1">Professional barcode generation and scanning solution</p>
                    </div>
                    {/* Divider Line */}
                    <div className="border-t border-gray-600 my-6"></div>

                    {/* Copyright Section */}
                    <div className="text-center text-gray-600 text-sm pb-15 sm:pb-0">
                        © {new Date().getFullYear()} Barcode Toolkit. All rights reserved by Ritanjit Das.
                    </div>
                </div>
            </footer>
        </div>
    );
}