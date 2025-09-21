import * as tf from '@tensorflow/tfjs';

class MLService {
    constructor() {
        this.model = null;
        this.labels = ['blackheads', 'cyst', 'papules', 'pustules', 'whiteheads'];
        this.isModelLoading = false;
        this.modelUrl = '/models/tfjs_model/model.json';
    }

    async loadModel() {
        if (this.model) return this.model;
        if (this.isModelLoading) {
            console.log('Model is already loading, waiting...');
            while (this.isModelLoading) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return this.model;
        }

        this.isModelLoading = true;
        try {
            console.log('Loading TensorFlow.js model from:', this.modelUrl);
            await tf.ready();
            console.log('TensorFlow.js backend ready:', tf.getBackend());

            // Verifikasi akses file model terlebih dahulu
            const isAccessible = await this.testModelPath();
            if (!isAccessible) {
                throw new Error('Model file not accessible');
            }

            console.log('Loading as LayersModel...');
            this.model = await tf.loadLayersModel(this.modelUrl, {
                strict: false,
                onProgress: (fraction) => {
                    console.log(`Loading progress: ${Math.round(fraction * 100)}%`);
                }
            });

            console.log('Model loaded successfully as LayersModel');

            // Log model info
            this.logModelInfo();

            // Warm up model dengan error handling yang lebih baik
            await this.warmUpModel();

            console.log('Model loaded and warmed up successfully');
            this.isModelLoading = false;
            return this.model;

        } catch (error) {
            this.isModelLoading = false;
            console.error('Failed to load model:', error);

            if (error.message.includes('Failed to fetch') || error.message.includes('404')) {
                throw new Error(`Model file not found at: ${this.modelUrl}. Please check the path and ensure all weight files are present.`);
            } else if (error.message.includes('target variable')) {
                throw new Error(`Model weight format incompatible. Please re-export the model with correct TensorFlow.js format.`);
            } else if (error.message.includes('producer')) {
                throw new Error(`Model metadata corrupted. Please re-convert the model using tensorflowjs_converter.`);
            } else {
                throw new Error(`Model loading failed: ${error.message}`);
            }
        }
    }

    logModelInfo() {
        try {
            if (this.model) {
                console.log('Model loaded successfully!');
                console.log('Model type:', this.model.constructor.name);

                // Log input shape
                if (this.model.inputs && this.model.inputs.length > 0) {
                    console.log('Input shape:', this.model.inputs[0].shape);
                } else if (this.model.input && this.model.input.shape) {
                    console.log('Input shape:', this.model.input.shape);
                }

                // Log output shape
                if (this.model.outputs && this.model.outputs.length > 0) {
                    console.log('Output shape:', this.model.outputs[0].shape);
                } else if (this.model.output && this.model.output.shape) {
                    console.log('Output shape:', this.model.output.shape);
                }

                // Log layer information
                console.log('Model layers:');
                this.model.layers.forEach((layer, i) => {
                    console.log(`Layer ${i}: ${layer.name} (${layer.className})`);
                    if (layer.getConfig().units) {
                        console.log(`  Units: ${layer.getConfig().units}`);
                    }
                    if (layer.getConfig().filters) {
                        console.log(`  Filters: ${layer.getConfig().filters}`);
                    }
                });

                // Log total parameters jika tersedia
                if (this.model.countParams) {
                    console.log('Total parameters:', this.model.countParams());
                }
            }
        } catch (error) {
            console.warn('Could not log model info:', error.message);
        }
    }

    async warmUpModel() {
        try {
            console.log('Warming up model...');
            // Buat input dummy dengan shape yang benar [1, 224, 224, 3]
            const warmupInput = tf.zeros([1, 224, 224, 3]);

            // Jalankan prediksi dummy
            const warmupOutput = this.model.predict(warmupInput);

            // Tunggu hasil dan bersihkan
            if (warmupOutput.data) {
                await warmupOutput.data();
            }

            // Bersihkan tensor
            warmupInput.dispose();
            if (warmupOutput.dispose) {
                warmupOutput.dispose();
            }

            console.log('Model warmup completed successfully');
        } catch (error) {
            console.warn('Model warmup failed (non-critical):', error.message);
            // Warmup failure tidak critical, model mungkin masih bisa digunakan
        }
    }

    async detectAcne(imageElement) {
        try {
            console.log('Starting acne detection...');
            console.log('Image element dimensions:', imageElement.width, 'x', imageElement.height);

            // Load model if not already loaded
            if (!this.model) {
                console.log('Model not loaded, loading now...');
                await this.loadModel();
            }

            // Validasi input image
            if (!imageElement || imageElement.width === 0 || imageElement.height === 0) {
                throw new Error('Invalid image element provided');
            }

            // Preprocess image
            console.log('Preprocessing image...');
            let tensor;

            try {
                tensor = tf.tidy(() => {
                    // Konversi image ke tensor
                    let imageTensor = tf.browser.fromPixels(imageElement);
                    console.log('Original tensor shape:', imageTensor.shape);

                    // Pastikan tensor memiliki 3 channel (RGB)
                    if (imageTensor.shape[2] === 4) {
                        // Jika RGBA, hapus alpha channel
                        imageTensor = imageTensor.slice([0, 0, 0], [-1, -1, 3]);
                        console.log('Converted RGBA to RGB');
                    }

                    // Resize ke 224x224
                    imageTensor = tf.image.resizeBilinear(imageTensor, [224, 224]);
                    console.log('Resized tensor shape:', imageTensor.shape);

                    // Normalisasi ke range 0-1
                    imageTensor = imageTensor.toFloat().div(255.0);

                    // Tambahkan batch dimension
                    imageTensor = imageTensor.expandDims(0);
                    console.log('Final tensor shape:', imageTensor.shape);

                    return imageTensor;
                });
            } catch (preprocessError) {
                console.error('Preprocessing error:', preprocessError);
                throw new Error('Failed to preprocess image. Please try a different image.');
            }

            // Run inference dengan timeout dan error handling yang lebih baik
            console.log('Running model prediction...');
            const predictions = await this.runPredictionWithTimeout(tensor, 30000);

            // Clean up tensor
            tensor.dispose();

            // Process results
            const output = await predictions.data();
            predictions.dispose();

            const predictionsArray = Array.from(output);
            console.log('Raw predictions:', predictionsArray);

            // Validasi output
            if (predictionsArray.length !== this.labels.length) {
                console.warn(`Expected ${this.labels.length} predictions, got ${predictionsArray.length}`);
                // Pad dengan zeros jika kurang, atau truncate jika lebih
                while (predictionsArray.length < this.labels.length) {
                    predictionsArray.push(0);
                }
                predictionsArray.splice(this.labels.length);
            }

            const results = this.labels.map((label, index) => ({
                label: this.formatLabel(label),
                confidence: Math.round((predictionsArray[index] || 0) * 100) / 100,
            })).sort((a, b) => b.confidence - a.confidence);

            const result = {
                image: imageElement.src,
                predictions: results,
                dominantAcne: results[0].label,
                confidence: results[0].confidence,
                timestamp: new Date().toISOString(),
                recommendations: this.getRecommendations(results[0].label)
            };

            console.log('Detection completed successfully:', result);
            return result;

        } catch (error) {
            console.error('Detection error:', error);

            // Jangan gunakan fallback jika model tidak bisa dimuat
            if (error.message.includes('Model file not found') ||
                error.message.includes('Failed to fetch') ||
                error.message.includes('404') ||
                error.message.includes('weight format incompatible') ||
                error.message.includes('metadata corrupted')) {
                throw error; // Re-throw error untuk ditangani di level atas
            }

            // Untuk error lainnya, gunakan fallback
            console.log('Using fallback detection due to error:', error.message);
            return await this.detectAcneFallback(imageElement);
        }
    }

    async runPredictionWithTimeout(tensor, timeoutMs = 30000) {
        const predictionPromise = this.runPrediction(tensor);
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Prediction timeout')), timeoutMs);
        });

        return await Promise.race([predictionPromise, timeoutPromise]);
    }

    async runPrediction(tensor) {
        try {
            // Coba predict dengan model
            const prediction = this.model.predict(tensor);

            // Handle different return types
            if (Array.isArray(prediction)) {
                // Jika model mengembalikan array, ambil yang pertama
                return prediction[0];
            }

            return prediction;
        } catch (predictionError) {
            console.error('Prediction execution error:', predictionError);
            throw new Error(`Model prediction failed: ${predictionError.message}`);
        }
    }

    // Format label for better display
    formatLabel(label) {
        const labelMap = {
            'blackheads': 'Blackheads (Komedo Hitam)',
            'cyst': 'Cyst (Kista)',
            'papules': 'Papules (Jerawat Padat)',
            'pustules': 'Pustules (Jerawat Bernanah)',
            'whiteheads': 'Whiteheads (Komedo Putih)'
        };
        return labelMap[label] || label;
    }

    // Get treatment recommendations based on acne type
    getRecommendations(acneType) {
        const recommendations = {
            'Blackheads (Komedo Hitam)': {
                treatment: [
                    'Gunakan produk dengan salicylic acid (BHA) 0.5-2%',
                    'Lakukan double cleansing dengan oil cleanser',
                    'Gunakan clay mask 1-2x seminggu',
                    'Hindari memencet komedo dengan tangan'
                ],
                ingredients: ['Salicylic Acid', 'Niacinamide', 'Retinol', 'Clay/Charcoal'],
                severity: 'Ringan'
            },
            'Whiteheads (Komedo Putih)': {
                treatment: [
                    'Gunakan gentle exfoliant dengan AHA/BHA',
                    'Aplikasikan retinoid secara bertahap',
                    'Gunakan non-comedogenic moisturizer',
                    'Konsultasi dengan dermatolog jika tidak membaik'
                ],
                ingredients: ['Salicylic Acid', 'Glycolic Acid', 'Retinol', 'Niacinamide'],
                severity: 'Ringan'
            },
            'Papules (Jerawat Padat)': {
                treatment: [
                    'Gunakan benzoyl peroxide 2.5-5%',
                    'Aplikasikan anti-inflammatory ingredients',
                    'Hindari produk yang terlalu harsh',
                    'Pertimbangkan konsultasi dermatolog'
                ],
                ingredients: ['Benzoyl Peroxide', 'Niacinamide', 'Azelaic Acid', 'Tea Tree Oil'],
                severity: 'Sedang'
            },
            'Pustules (Jerawat Bernanah)': {
                treatment: [
                    'Gunakan kombinasi benzoyl peroxide dan salicylic acid',
                    'Aplikasikan spot treatment pada area bermasalah',
                    'Jaga kebersihan wajah tanpa over-cleansing',
                    'Konsultasi dermatolog untuk treatment yang tepat'
                ],
                ingredients: ['Benzoyl Peroxide', 'Salicylic Acid', 'Sulfur', 'Zinc'],
                severity: 'Sedang-Berat'
            },
            'Cyst (Kista)': {
                treatment: [
                    'SEGERA konsultasi dengan dermatolog',
                    'Jangan mencoba memencet atau mengeluarkan sendiri',
                    'Gunakan gentle skincare routine',
                    'Pertimbangkan treatment medis seperti injeksi kortikosteroid'
                ],
                ingredients: ['Gentle Cleanser', 'Non-comedogenic Moisturizer'],
                severity: 'Berat'
            }
        };

        return recommendations[acneType] || {
            treatment: ['Konsultasi dengan dermatolog untuk diagnosis yang tepat'],
            ingredients: ['Gentle Skincare Products'],
            severity: 'Tidak Diketahui'
        };
    }

    // Fallback method for testing when model isn't available
    async detectAcneFallback(imageElement) {
        console.log('Using fallback detection (mock results)');

        // Simulasi delay untuk memberikan pengalaman yang realistis
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock results for testing
        const mockConfidences = [
            Math.random() * 0.4 + 0.1, // blackheads
            Math.random() * 0.3 + 0.05, // cyst
            Math.random() * 0.4 + 0.1, // papules
            Math.random() * 0.3 + 0.05, // pustules
            Math.random() * 0.4 + 0.1, // whiteheads
        ];

        const results = this.labels.map((label, index) => ({
            label: this.formatLabel(label),
            confidence: Math.round(mockConfidences[index] * 100) / 100,
        })).sort((a, b) => b.confidence - a.confidence);

        const result = {
            image: imageElement.src,
            predictions: results,
            dominantAcne: results[0].label,
            confidence: results[0].confidence,
            timestamp: new Date().toISOString(),
            recommendations: this.getRecommendations(results[0].label),
            isMockResult: true
        };

        return result;
    }

    // Method untuk debug dan troubleshooting
    async testModelPath() {
        try {
            const response = await fetch(this.modelUrl);
            if (response.ok) {
                console.log('Model file is accessible');
                return true;
            } else {
                console.error('Model file not accessible:', response.status, response.statusText);
                return false;
            }
        } catch (error) {
            console.error('Error testing model path:', error);
            return false;
        }
    }

    // Utility method untuk memverifikasi semua file model
    async verifyModelFiles() {
        try {
            // Ambil manifest
            const response = await fetch(this.modelUrl);
            const modelData = await response.json();

            if (modelData.weightsManifest && modelData.weightsManifest[0] && modelData.weightsManifest[0].paths) {
                const basePath = this.modelUrl.substring(0, this.modelUrl.lastIndexOf('/'));
                const paths = modelData.weightsManifest[0].paths;

                console.log('Verifying weight files...');
                const verifications = await Promise.all(
                    paths.map(async (path) => {
                        const fullPath = `${basePath}/${path}`;
                        const response = await fetch(fullPath);
                        return {
                            path: path,
                            exists: response.ok,
                            size: response.headers.get('content-length')
                        };
                    })
                );

                console.log('Weight file verification results:', verifications);
                return verifications.every(v => v.exists);
            }

            return true;
        } catch (error) {
            console.error('Error verifying model files:', error);
            return false;
        }
    }

    // Cleanup method
    dispose() {
        if (this.model && this.model.dispose) {
            this.model.dispose();
            this.model = null;
            console.log('Model disposed');
        }
    }
}

export default new MLService();