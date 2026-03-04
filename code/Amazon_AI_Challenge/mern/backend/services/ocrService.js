const { extractCardDetails } = require('pan-aadhaar-ocr');
let sharp;
try {
    sharp = require('sharp');
    console.log('✅ Sharp module loaded successfully');
} catch (error) {
    console.warn('⚠️ Sharp module not available:', error.message);
    console.log('📝 Will use fallback image processing...');
}
const path = require('path');
const fs = require('fs').promises;
const { createWorker } = require('tesseract.js');

class AadhaarOCRService {
    constructor() {
        this.tempDir = path.join(__dirname, '../temp');
        this.ensureTempDir();
    }

    async ensureTempDir() {
        try {
            await fs.mkdir(this.tempDir, { recursive: true });
        } catch (error) {
            console.error('❌ Failed to create temp directory:', error);
        }
    }

    async preprocessImage(imageBuffer) {
        try {
            console.log('🖼️ Preprocessing image...');
            
            if (sharp) {
                console.log('🔧 Using Sharp for advanced preprocessing...');
                // Enhanced preprocessing using Sharp (proven approach)
                const processedBuffer = await sharp(imageBuffer)
                    .resize(1000)           // Resize to optimal width
                    .threshold(150)         // Apply threshold for better contrast
                    .sharpen()              // Sharpen image
                    .normalise()            // Normalize the image
                    .png()                  // Convert to PNG for better quality
                    .toBuffer();
                
                console.log('✅ Image preprocessing complete with Sharp');
                return processedBuffer;
            } else {
                console.log('📝 Sharp not available, using original image');
                return imageBuffer;
            }
        } catch (error) {
            console.error('❌ Image preprocessing failed, using original:', error);
            return imageBuffer;
        }
    }

    async processWithProvenOCR(imageBuffer, filename) {
        try {
            console.log('🔍 Using proven pan-aadhaar-ocr package...');
            
            // Save processed image to temp file for the package
            const tempImagePath = path.join(this.tempDir, `temp_${Date.now()}_${filename}`);
            const processedBuffer = await this.preprocessImage(imageBuffer);
            await fs.writeFile(tempImagePath, processedBuffer);
            
            // Use the proven pan-aadhaar-ocr package
            const result = await extractCardDetails(tempImagePath, 'AADHAAR');
            
            // Clean up temp file
            await fs.unlink(tempImagePath).catch(() => {});
            
            console.log('✅ Proven OCR completed:', result);
            return {
                aadhaarNumber: result.Number || '',
                extractedText: result.Number || 'No number found',
                success: !!result.Number,
                method: 'proven-package'
            };
        } catch (error) {
            console.error('❌ Proven OCR package failed:', error);
            throw error;
        }
    }

    async processWithAdvancedTesseract(imageBuffer) {
        let worker = null;
        try {
            console.log('🔍 Using advanced Tesseract with better patterns...');
            
            // Create worker for this request
            worker = await createWorker('eng');
            
            // Process with better preprocessing
            const processedBuffer = await this.preprocessImage(imageBuffer);
            const { data: { text } } = await worker.recognize(processedBuffer);
            
            // Enhanced extraction using proven patterns
            const aadhaarData = this.extractAadhaarDataAdvanced(text);
            
            await worker.terminate();
            
            console.log('✅ Advanced Tesseract completed');
            return {
                ...aadhaarData,
                extractedText: text,
                method: 'advanced-tesseract'
            };
        } catch (error) {
            if (worker) await worker.terminate().catch(() => {});
            console.error('❌ Advanced Tesseract failed:', error);
            throw error;
        }
    }

    // Advanced extraction methods based on proven GitHub implementations
    extractAadhaarDataAdvanced(text) {
        try {
            console.log('🔍 Starting advanced Aadhaar data extraction...');
            
            const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 2);
            
            // Use proven regex patterns from smart-docs-parser research
            const AADHAAR_REGEX = {
                number_format: /\d{4}\s?\d{4}\s?\d{4}/,
                name_format: /^[a-zA-Z\s\.]+$/,
                gender: /Male|MALE|Female|FEMALE/,
                date_format: /(\d{2}\/\d{2}\/\d{4})/,
                address_start: /([Ss]\/[Oo])|([Ww]\/[Oo])|([Dd]\/[Oo])|([Cc]\/[Oo])|(Address[:\s]*)|(ADDRESS[:\s]*)/,
                address_end: /([A-Z\s]+[a-z]*[,;:._\s-]+[0-9]{6}\.?$)|(^[0-9]{6}\.?$)/,
                fathers_name_split: /([Ss]\/[Oo])[\s:]+|([Dd]\/[Oo])[\s:]+|([Cc]\/[Oo])[\s:]+|([Ww]\/[Oo])[\s:]+/,
                english: /(^[\w,.:;&*\/|)('"#+^`-]*$)/,
                noise: /(^[\s]+$)|(^[A-Z]{0,2}[.,]+$)|(^[A-Z0-9]{2,}[a-z]+)|(^[A-Z0-9]+[.,]+[A-Z0-9]+)|(^[0-9]+[a-zA-Z]{3,})|(^www\.\w+)|(\.gov\.in*$)/
            };
            
            // Filter noise from text using proven patterns
            const cleanLines = this.removeNoiseFromText(lines, AADHAAR_REGEX);
            
            // Extract each field using advanced patterns
            const aadhaarNumber = this.extractAadhaarNumberAdvanced(cleanLines, AADHAAR_REGEX);
            const name = this.extractNameAdvanced(cleanLines, AADHAAR_REGEX);
            const gender = this.extractGenderAdvanced(cleanLines, AADHAAR_REGEX);
            const dateOfBirth = this.extractDateOfBirthAdvanced(cleanLines, AADHAAR_REGEX);
            const fatherName = this.extractFatherNameAdvanced(cleanLines, AADHAAR_REGEX);
            const address = this.extractAddressAdvanced(cleanLines, AADHAAR_REGEX);
            
            const result = {
                aadhaarNumber: aadhaarNumber || '',
                name: name || '',
                gender: gender || '',
                dateOfBirth: dateOfBirth || '',
                fatherName: fatherName || '',
                address: address || '',
                success: !!(aadhaarNumber || name || gender || dateOfBirth)
            };
            
            console.log('✅ Advanced extraction completed:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Advanced extraction failed:', error);
            return {
                aadhaarNumber: '',
                name: '',
                gender: '',
                dateOfBirth: '',
                fatherName: '',
                address: '',
                success: false,
                error: error.message
            };
        }
    }

    removeNoiseFromText(lines, AADHAAR_REGEX) {
        const filteredLines = [];
        
        for (const line of lines) {
            // Remove obvious noise patterns
            if (line.length < 3) continue;
            if (AADHAAR_REGEX.noise.test(line)) continue;
            
            // Filter words and keep only English text
            const words = line.split(/\s+/);
            const filteredWords = words.filter(word => {
                if (AADHAAR_REGEX.english.test(word)) return true;
                if (AADHAAR_REGEX.date_format.test(word)) return true;
                if (AADHAAR_REGEX.gender.test(word)) return true;
                return false;
            });
            
            if (filteredWords.length > 0) {
                filteredLines.push(filteredWords.join(' ').trim());
            }
        }
        
        return filteredLines;
    }

    extractAadhaarNumberAdvanced(lines, AADHAAR_REGEX) {
        for (const line of lines) {
            const match = line.match(AADHAAR_REGEX.number_format);
            if (match) {
                const number = match[0].replace(/\s/g, '');
                if (number.length === 12) {
                    return number.replace(/(.{4})/g, '$1 ').trim();
                }
            }
        }
        return '';
    }

    extractNameAdvanced(lines, AADHAAR_REGEX) {
        // Look for names using proven patterns
        for (let i = 0; i < Math.min(lines.length, 8); i++) {
            const line = lines[i];
            
            // Skip lines with numbers or government text
            if (/\d{4}\s*\d{4}\s*\d{4}/.test(line) ||
                /(government|india|identification|authority|aadhaar|unique)/i.test(line)) {
                continue;
            }
            
            // Check if it matches name format
            if (AADHAAR_REGEX.name_format.test(line) && line.length >= 3 && line.length <= 50) {
                return line.toUpperCase();
            }
        }
        return '';
    }

    extractGenderAdvanced(lines, AADHAAR_REGEX) {
        for (const line of lines) {
            const match = line.match(AADHAAR_REGEX.gender);
            if (match) {
                const gender = match[0].toLowerCase();
                return gender === 'male' ? 'Male' : 'Female';
            }
        }
        return '';
    }

    extractDateOfBirthAdvanced(lines, AADHAAR_REGEX) {
        for (const line of lines) {
            const match = line.match(AADHAAR_REGEX.date_format);
            if (match) {
                return match[1];
            }
        }
        return '';
    }

    extractFatherNameAdvanced(lines, AADHAAR_REGEX) {
        for (const line of lines) {
            if (AADHAAR_REGEX.fathers_name_split.test(line)) {
                const parts = line.split(AADHAAR_REGEX.fathers_name_split);
                if (parts.length > 1) {
                    const fatherName = parts[parts.length - 1].trim();
                    if (AADHAAR_REGEX.name_format.test(fatherName) && fatherName.length >= 3) {
                        return fatherName.toUpperCase();
                    }
                }
            }
        }
        return '';
    }

    extractAddressAdvanced(lines, AADHAAR_REGEX) {
        let addressStartIndex = -1;
        let addressEndIndex = -1;
        
        // Find address start and end
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (addressStartIndex === -1 && AADHAAR_REGEX.address_start.test(line)) {
                addressStartIndex = i;
            }
            if (addressStartIndex !== -1 && AADHAAR_REGEX.address_end.test(line)) {
                addressEndIndex = i;
                break;
            }
        }
        
        // Extract address lines
        if (addressStartIndex !== -1) {
            const endIndex = addressEndIndex !== -1 ? addressEndIndex + 1 : Math.min(addressStartIndex + 4, lines.length);
            const addressLines = lines.slice(addressStartIndex, endIndex);
            
            // Clean and join address
            let address = addressLines.join(' ')
                .replace(/Address[:\s]*|ADDRESS[:\s]*/gi, '')
                .replace(/[Ss]\/[Oo][\s:]+|[Dd]\/[Oo][\s:]+|[Cc]\/[Oo][\s:]+|[Ww]\/[Oo][\s:]+/g, '')
                .trim();
            
            if (address.length >= 10) {
                return address;
            }
        }
        return '';
    }

    // Main processing method - uses proven strategies

    async extractAadhaarData(imageBuffer, filename = 'aadhaar.jpg') {
        try {
            console.log('🎯 Starting proven OCR processing strategy...');
            
            // Strategy 1: Try proven pan-aadhaar-ocr package first
            try {
                console.log('📋 Strategy 1: Using proven package...');
                const provenResult = await this.processWithProvenOCR(imageBuffer, filename);
                
                // If we got Aadhaar number, try to get more fields with advanced Tesseract
                if (provenResult.success && provenResult.aadhaarNumber) {
                    console.log('🔍 Strategy 1 got Aadhaar number, enhancing with advanced Tesseract...');
                    try {
                        const tesseractResult = await this.processWithAdvancedTesseract(imageBuffer);
                        
                        // Combine results - use proven package for Aadhaar number, Tesseract for other fields
                        const combinedData = {
                            aadhaarNumber: provenResult.aadhaarNumber,
                            name: tesseractResult.name || '',
                            fatherName: tesseractResult.fatherName || '',
                            dateOfBirth: tesseractResult.dateOfBirth || '',
                            gender: tesseractResult.gender || '',
                            address: tesseractResult.address || '',
                            pincode: this.extractPincode(tesseractResult.extractedText || '') || '',
                            mobile: '',
                            email: ''
                        };
                        
                        console.log('✅ Combined strategy successful!');
                        return {
                            success: true,
                            data: combinedData,
                            rawText: tesseractResult.extractedText || provenResult.extractedText,
                            message: 'OCR completed using proven package + advanced Tesseract',
                            method: 'combined-proven-advanced'
                        };
                        
                    } catch (tesseractError) {
                        console.log('⚠️ Advanced Tesseract failed, using proven result only');
                        return {
                            success: true,
                            data: {
                                aadhaarNumber: provenResult.aadhaarNumber,
                                name: '',
                                fatherName: '',
                                dateOfBirth: '',
                                gender: '',
                                address: '',
                                pincode: '',
                                mobile: '',
                                email: ''
                            },
                            rawText: provenResult.extractedText,
                            message: 'OCR completed using proven package only',
                            method: 'proven-only'
                        };
                    }
                }
            } catch (provenError) {
                console.log('⚠️ Strategy 1 (proven package) failed:', provenError.message);
            }
            
            // Strategy 2: Fall back to advanced Tesseract only
            console.log('📋 Strategy 2: Using advanced Tesseract...');
            const tesseractResult = await this.processWithAdvancedTesseract(imageBuffer);
            
            if (tesseractResult.success) {
                console.log('✅ Advanced Tesseract successful!');
                return {
                    success: true,
                    data: {
                        aadhaarNumber: tesseractResult.aadhaarNumber || '',
                        name: tesseractResult.name || '',
                        fatherName: tesseractResult.fatherName || '',
                        dateOfBirth: tesseractResult.dateOfBirth || '',
                        gender: tesseractResult.gender || '',
                        address: tesseractResult.address || '',
                        pincode: this.extractPincode(tesseractResult.extractedText || '') || '',
                        mobile: '',
                        email: ''
                    },
                    rawText: tesseractResult.extractedText,
                    message: 'OCR completed using advanced Tesseract',
                    method: 'advanced-tesseract-only'
                };
            }
            
            // If all strategies fail
            throw new Error('All OCR strategies failed to extract data');

        } catch (error) {
            console.error('❌ ALL OCR strategies failed:', error);
            return {
                success: false,
                error: `OCR processing failed: ${error.message}`,
                data: {},
                method: 'failed'
            };
        }
    }

    // Keep existing pincode extraction as it's still useful
    extractPincode(text) {
        const pincodePattern = /\b\d{6}\b/g;
        const matches = text.match(pincodePattern);
        if (matches) {
            // Return the last pincode found (usually the correct one)
            return matches[matches.length - 1];
        }
        return '';
    }

    getDemoData() {
        return {
            success: true,
            data: {
                aadhaarNumber: '1234 5678 9012',
                name: 'DEMO USER',
                fatherName: 'DEMO FATHER',
                dateOfBirth: '01/01/1990',
                gender: 'Male',
                address: '123 Demo Street, Demo City, Demo State - 123456',
                pincode: '123456',
                mobile: '9876543210',
                email: 'demo@example.com'
            },
            demo_mode: true,
            message: '🧪 Demo mode: Using sample data for testing purposes.'
        };
    }

    async terminate() {
        if (this.worker) {
            await this.worker.terminate();
            this.worker = null;
            this.isInitialized = false;
            console.log('🔴 Tesseract OCR worker terminated');
        }
    }
}

// Create singleton instance
const ocrService = new AadhaarOCRService();

module.exports = ocrService;