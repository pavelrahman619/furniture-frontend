'use client';

import React, { useState } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import {
    testCloudinaryConfig,
    testFileValidation,
    testUrlGeneration,
    testCloudinaryInstance,
    runAllCloudinaryTests
} from '@/lib/test-cloudinary';

export default function TestCloudinaryPage() {
    const [testImage, setTestImage] = useState<string>('');
    const [configStatus, setConfigStatus] = useState<boolean | null>(null);
    const [testResults, setTestResults] = useState<string[]>([]);

    // Test functions that capture console output
    const runConfigTest = () => {
        const originalLog = console.log;
        const logs: string[] = [];
        console.log = (...args) => logs.push(args.join(' '));

        const isValid = testCloudinaryConfig();
        setConfigStatus(isValid);

        console.log = originalLog;
        setTestResults([...testResults, ...logs]);
    };

    const runFileValidationTest = () => {
        const originalLog = console.log;
        const logs: string[] = [];
        console.log = (...args) => logs.push(args.join(' '));

        testFileValidation();

        console.log = originalLog;
        setTestResults([...testResults, ...logs]);
    };

    const runUrlGenerationTest = () => {
        const originalLog = console.log;
        const logs: string[] = [];
        console.log = (...args) => logs.push(args.join(' '));

        testUrlGeneration();

        console.log = originalLog;
        setTestResults([...testResults, ...logs]);
    };

    const runInstanceTest = () => {
        const originalLog = console.log;
        const logs: string[] = [];
        console.log = (...args) => logs.push(args.join(' '));

        testCloudinaryInstance();

        console.log = originalLog;
        setTestResults([...testResults, ...logs]);
    };

    const runAllTests = () => {
        const originalLog = console.log;
        const logs: string[] = [];
        console.log = (...args) => logs.push(args.join(' '));

        runAllCloudinaryTests();

        console.log = originalLog;
        setTestResults(logs);
    };

    const handleImageChange = (imageUrl: string) => {
        setTestImage(imageUrl);
        const results = [...testResults];
        results.push('--- Upload Test ---');
        results.push(`✅ Image uploaded successfully: ${imageUrl}`);
        setTestResults(results);
    };

    const handleImageRemove = () => {
        setTestImage('');
        const results = [...testResults];
        results.push('Image removed from test');
        setTestResults(results);
    };

    const clearResults = () => {
        setTestResults([]);
        setConfigStatus(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">
                        Cloudinary Integration Test
                    </h1>

                    {/* Configuration Status */}
                    <div className="mb-8">
                        {configStatus !== null && (
                            <div className={`px-3 py-1 rounded text-sm font-medium mb-4 ${configStatus
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {configStatus ? '✅ Configuration Valid' : '❌ Configuration Invalid'}
                            </div>
                        )}
                    </div>

                    {/* Test Buttons */}
                    <div className="flex flex-wrap gap-4 mb-6">
                        <button
                            onClick={runConfigTest}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                            Test Configuration
                        </button>
                        <button
                            onClick={runFileValidationTest}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                        >
                            Test File Validation
                        </button>
                        <button
                            onClick={runUrlGenerationTest}
                            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                        >
                            Test URL Generation
                        </button>
                        <button
                            onClick={runInstanceTest}
                            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                        >
                            Test Instance
                        </button>
                        <button
                            onClick={runAllTests}
                            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
                        >
                            Run All Tests
                        </button>
                        <button
                            onClick={clearResults}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                        >
                            Clear Results
                        </button>
                    </div>

                    {/* Image Upload Test */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Image Upload Test
                        </h2>
                        <div className="max-w-md">
                            <ImageUpload
                                currentImage={testImage}
                                onImageChange={handleImageChange}
                                onImageRemove={handleImageRemove}
                                uploadOptions={{
                                    folder: 'CONTENT_IMAGES',
                                    transformation: 'THUMBNAIL',
                                    tags: ['test', 'cloudinary-integration'],
                                }}
                                placeholder="Upload a test image to verify Cloudinary integration"
                            />
                        </div>
                        {testImage && (
                            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                                <p className="text-green-800 font-medium">✅ Upload Successful!</p>
                                <p className="text-sm text-green-700 mt-1">Image URL: {testImage}</p>
                            </div>
                        )}
                    </div>

                    {/* Test Results */}
                    {testResults.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                Test Results
                            </h2>
                            <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm">
                                {testResults.map((result, index) => (
                                    <div key={index} className="mb-1">
                                        {result}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Setup Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-3">
                            Setup Instructions
                        </h3>
                        <div className="text-blue-800 space-y-2">
                            <p><strong>1. Environment Variables:</strong></p>
                            <p className="ml-4">Add your Cloudinary credentials to <code>.env.local</code>:</p>
                            <pre className="ml-4 bg-blue-100 p-2 rounded text-xs overflow-x-auto">
                                {`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key  
CLOUDINARY_API_SECRET=your_api_secret`}
                            </pre>

                            <p className="mt-4"><strong>2. Upload Preset:</strong></p>
                            <p className="ml-4">Create an unsigned upload preset named <code>furniture_content_uploads</code> in your Cloudinary dashboard.</p>

                            <p className="mt-4"><strong>3. Test Upload:</strong></p>
                            <p className="ml-4">Once configured, use the image upload component above to test the integration.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}