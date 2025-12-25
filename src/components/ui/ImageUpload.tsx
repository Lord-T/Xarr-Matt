'use client';

import React, { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ImageUploadProps {
    onUpload: (url: string) => void;
    bucket?: string;
    label?: string;
    currentImage?: string;
}

export function ImageUpload({ onUpload, bucket = 'marketing-assets', label = 'Image', currentImage }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const [dragActive, setDragActive] = useState(false);

    const handleFile = async (file: File) => {
        if (!file) return;
        setUploading(true);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            setPreview(publicUrl);
            onUpload(publicUrl);
        } catch (error: any) {
            alert('Erreur upload ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium mb-1">{label}</label>

            {preview ? (
                <div className="relative rounded-lg overflow-hidden border border-gray-200 group">
                    <img src={preview} alt="Preview" className="w-full h-48 object-cover bg-gray-50" />
                    <button
                        onClick={() => { setPreview(null); onUpload(''); }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transition-opacity opacity-0 group-hover:opacity-100"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <div
                    className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${dragActive ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById(`file-${label}`)?.click()}
                >
                    <input
                        id={`file-${label}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleChange}
                    />
                    {uploading ? (
                        <div className="animate-spin text-primary"><Loader size={24} /></div>
                    ) : (
                        <>
                            <Upload size={24} className="text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 font-medium">Cliquez ou glissez une image ici</p>
                            <p className="text-xs text-gray-400 mt-1">PNG, JPG jusqu'à 5MB</p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
