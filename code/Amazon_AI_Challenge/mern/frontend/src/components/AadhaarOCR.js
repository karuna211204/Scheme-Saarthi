import React, { useState, useRef } from 'react';

const AadhaarOCR = ({ onExtractedData, onError }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef(null);

    // OCR API endpoint
    const OCR_API_URL = process.env.REACT_APP_API_URL ? 
        `${process.env.REACT_APP_API_URL}/api/ocr/aadhaar` : 
        'http://localhost:5000/api/ocr/aadhaar';

    // Helper function to convert date format from MM/DD/YYYY to YYYY-MM-DD
    const convertDateFormat = (dateString) => {
        if (!dateString) return '';
        
        try {
            // Handle MM/DD/YYYY format
            const parts = dateString.split('/');
            if (parts.length === 3) {
                const [month, day, year] = parts;
                // Ensure two-digit month and day
                const formattedMonth = month.padStart(2, '0');
                const formattedDay = day.padStart(2, '0');
                return `${year}-${formattedMonth}-${formattedDay}`;
            }
            
            // If already in YYYY-MM-DD format, return as is
            if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
                return dateString;
            }
            
            // For other formats, try to parse and format
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
            }
            
            return dateString; // Return original if can't parse
        } catch (error) {
            console.warn('Date conversion error:', error);
            return dateString;
        }
    };

    // Function to extract data from Aadhaar card using OCR service
    const extractAadhaarData = async (imageFile) => {
        setIsProcessing(true);
        setProgress(0);

        try {
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('image', imageFile);

            // Simulate progress updates
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev < 90) return prev + 10;
                    return prev;
                });
            }, 500);

            console.log('🔄 Uploading image for OCR processing...');

            // Make API call to OCR service
            const response = await fetch(OCR_API_URL, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            clearInterval(progressInterval);
            setProgress(100);

            console.log('📥 OCR Response:', result);

            if (result.success && result.data) {
                // Real OCR or demo mode success - extract data
                const extractedData = {
                    aadhaarNumber: result.data.aadhaarNumber || '',
                    name: result.data.name || '',
                    fatherName: result.data.fatherName || '',
                    dateOfBirth: convertDateFormat(result.data.dateOfBirth) || '',
                    gender: result.data.gender || '',
                    address: result.data.address || '',
                    pincode: result.data.pincode || '',
                    mobile: result.data.mobile || '',
                    email: result.data.email || ''
                };

                console.log('✅ Extracted data:', extractedData);
                
                if (onExtractedData) {
                    onExtractedData(extractedData);
                }
                
                // Show appropriate message for demo mode
                if (result.demo_mode) {
                    console.log('🧪 Demo mode active:', result.message);
                }
                
            } else if (result.fallback && result.demo_data) {
                // OCR service not available - show error with instructions
                const errorMessage = result.error + '\n\n' + result.instructions;
                console.warn('⚠️ OCR Service unavailable:', errorMessage);
                if (onError) {
                    onError(errorMessage);
                }
            } else {
                // Handle OCR service errors
                const errorMessage = result.error || 'Failed to process Aadhaar card. Please try again with a clearer image.';
                console.error('❌ OCR Error:', errorMessage);
                if (onError) {
                    onError(errorMessage);
                }
            }
            
        } catch (error) {
            console.error('💥 Network/Processing Error:', error);
            
            let errorMessage = 'Failed to process Aadhaar card. ';
            
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage += 'Network connection failed. Please check your connection.';
            } else if (error.message.includes('413')) {
                errorMessage += 'Image file is too large. Please use a smaller image.';
            } else if (error.message.includes('400')) {
                errorMessage += 'Invalid image format. Please use JPG, PNG, or other supported formats.';
            } else {
                errorMessage += 'Please try again or upload a different image.';
            }
            
            if (onError) {
                onError(errorMessage);
            }
        } finally {
            setIsProcessing(false);
            setProgress(0);
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            // Validate file size (16MB limit)
            const maxSize = 16 * 1024 * 1024; // 16MB
            if (file.size > maxSize) {
                if (onError) {
                    onError('Image file is too large. Please use an image smaller than 16MB.');
                }
                return;
            }
            
            extractAadhaarData(file);
        } else {
            if (onError) {
                onError('Please select a valid image file (JPG, PNG, GIF, BMP, TIFF).');
            }
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="aadhaar-ocr-component">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />
            
            <div className="upload-area bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                {isProcessing ? (
                    <div className="processing-indicator">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-text-light dark:text-text-dark mb-2">Processing Aadhaar Card...</p>
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                            <div 
                                className="bg-primary h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{progress}% complete</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            This may take up to 30 seconds for clear results...
                        </p>
                    </div>
                ) : (
                    <div className="upload-prompt">
                        <div className="mb-4">
                            <span className="material-symbols-outlined text-4xl text-gray-400">document_scanner</span>
                        </div>
                        <h3 className="text-lg font-medium text-text-light dark:text-text-dark mb-2">
                            Scan Aadhaar Card
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Upload a clear image of your Aadhaar card to automatically fill your profile details
                        </p>
                        <button
                            onClick={triggerFileSelect}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-black font-medium rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined">file_upload</span>
                            Select Aadhaar Image
                        </button>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Supports JPG, PNG, JPEG, GIF, BMP, TIFF formats (max 16MB)
                        </p>
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                                💡 <strong>Tips for best results:</strong><br/>
                                • Ensure good lighting and clear image<br/>
                                • Keep the card flat and fully visible<br/>
                                • Avoid shadows or glare
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AadhaarOCR;