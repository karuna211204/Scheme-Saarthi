import React, { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';

const AadhaarOCR = ({ onExtractedData, onError }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef(null);

    // Function to extract data from Aadhaar card using OCR
    const extractAadhaarData = async (imageFile) => {
        setIsProcessing(true);
        setProgress(0);

        try {
            const { data: { text } } = await Tesseract.recognize(
                imageFile,
                'eng',
                {
                    logger: (m) => {
                        if (m.status === 'recognizing text') {
                            setProgress(Math.round(m.progress * 100));
                        }
                    }
                }
            );

            // Parse the extracted text to get relevant information
            const extractedData = parseAadhaarText(text);
            
            if (onExtractedData) {
                onExtractedData(extractedData);
            }
            
        } catch (error) {
            console.error('Error processing Aadhaar card:', error);
            if (onError) {
                onError('Failed to process Aadhaar card. Please try again with a clearer image.');
            }
        } finally {
            setIsProcessing(false);
            setProgress(0);
        }
    };

    // Function to parse extracted text and extract useful information
    const parseAadhaarText = (text) => {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        const extractedData = {
            aadhaarNumber: '',
            name: '',
            fatherName: '',
            dateOfBirth: '',
            gender: '',
            address: '',
            pincode: '',
            mobile: '',
            email: ''
        };

        // Patterns for different data extraction
        const patterns = {
            aadhaar: /\b\d{4}\s?\d{4}\s?\d{4}\b/g,
            dateOfBirth: /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})\b/g,
            pincode: /\b\d{6}\b/g,
            mobile: /\b[789]\d{9}\b/g,
            email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
        };

        // Extract Aadhaar number
        const aadhaarMatch = text.match(patterns.aadhaar);
        if (aadhaarMatch && aadhaarMatch.length > 0) {
            extractedData.aadhaarNumber = aadhaarMatch[0].replace(/\s/g, '');
        }

        // Extract date of birth
        const dobMatch = text.match(patterns.dateOfBirth);
        if (dobMatch && dobMatch.length > 0) {
            extractedData.dateOfBirth = dobMatch[0];
        }

        // Extract pincode
        const pincodeMatch = text.match(patterns.pincode);
        if (pincodeMatch && pincodeMatch.length > 0) {
            extractedData.pincode = pincodeMatch[0];
        }

        // Extract mobile number
        const mobileMatch = text.match(patterns.mobile);
        if (mobileMatch && mobileMatch.length > 0) {
            extractedData.mobile = mobileMatch[0];
        }

        // Extract email
        const emailMatch = text.match(patterns.email);
        if (emailMatch && emailMatch.length > 0) {
            extractedData.email = emailMatch[0];
        }

        // Extract gender (look for keywords)
        const genderKeywords = ['male', 'female', 'पुरुष', 'महिला', 'MALE', 'FEMALE'];
        const foundGender = genderKeywords.find(keyword => 
            text.toLowerCase().includes(keyword.toLowerCase())
        );
        if (foundGender) {
            extractedData.gender = foundGender.toLowerCase().includes('male') ? 'Male' : 'Female';
        }

        // Extract name (usually the first meaningful line after any headers)
        const namePatterns = [
            /Name[\\s:]+([A-Za-z\\s]+)/i,
            /नाम[\\s:]+([A-Za-z\\s\\u0900-\\u097F]+)/i
        ];
        
        for (const pattern of namePatterns) {
            const nameMatch = text.match(pattern);
            if (nameMatch && nameMatch[1]) {
                extractedData.name = nameMatch[1].trim();
                break;
            }
        }

        // If no pattern match, try to find name by position (usually after DOB or at the beginning)
        if (!extractedData.name) {
            const meaningful_lines = lines.filter(line => 
                line.length > 3 && 
                !line.match(/\\d{4}/) && 
                !line.toLowerCase().includes('government') &&
                !line.toLowerCase().includes('india') &&
                !line.toLowerCase().includes('aadhaar')
            );
            
            if (meaningful_lines.length > 0) {
                extractedData.name = meaningful_lines[0];
            }
        }

        // Extract father's name (look for patterns)
        const fatherPatterns = [
            /Father[\s:]+([A-Za-z\s]+)/i,
            /S\/O[\s:]+([A-Za-z\s]+)/i,
            /पिता[\s:]+([A-Za-z\s\u0900-\u097F]+)/i
        ];
        
        for (const pattern of fatherPatterns) {
            const fatherMatch = text.match(pattern);
            if (fatherMatch && fatherMatch[1]) {
                extractedData.fatherName = fatherMatch[1].trim();
                break;
            }
        }

        // Extract address (usually the longest line or lines after personal details)
        const addressLines = lines.filter(line => 
            line.length > 10 && 
            !line.match(/\\b\\d{4}\\s?\\d{4}\\s?\\d{4}\\b/) && // not aadhaar number
            !line.match(/\\b\\d{1,2}[\\/\\-]\\d{1,2}[\\/\\-]\\d{4}\\b/) && // not date
            line !== extractedData.name &&
            line !== extractedData.fatherName
        );
        
        if (addressLines.length > 0) {
            extractedData.address = addressLines.join(', ');
        }

        return extractedData;
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            extractAadhaarData(file);
        } else {
            if (onError) {
                onError('Please select a valid image file.');
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
                            Supports JPG, PNG, JPEG formats
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AadhaarOCR;