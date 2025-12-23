'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CameraCaptureProps {
    onCapture: (imageDataUrl: string) => void;
    label?: string;
}

export function CameraCapture({ onCapture, label = "Prendre un Selfie" }: CameraCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [image, setImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
                audio: false
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setError(null);
        } catch (err) {
            console.error("Erreur caméra:", err);
            setError("Accès caméra refusé ou impossible. Vérifiez vos permissions.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                const dataUrl = canvas.toDataURL('image/jpeg');
                setImage(dataUrl);
                onCapture(dataUrl);
                stopCamera();
            }
        }
    };

    const reset = () => {
        setImage(null);
        startCamera();
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => stopCamera();
    }, []);

    // Auto start
    useEffect(() => {
        if (!image) startCamera();
    }, [image]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
            {label && <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</label>}

            <div style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '4/3',
                backgroundColor: '#000',
                borderRadius: '12px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {error ? (
                    <div style={{ color: 'white', textAlign: 'center', padding: '1rem' }}>
                        <AlertCircle size={32} style={{ marginBottom: '0.5rem', margin: 'auto' }} />
                        {error}
                    </div>
                ) : image ? (
                    <img src={image} alt="Capture" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} // Mirror effect
                    />
                )}

                <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                {image ? (
                    <Button onClick={reset} variant="outline" fullWidth>
                        <RefreshCw size={18} style={{ marginRight: '0.5rem' }} /> Reprendre
                    </Button>
                ) : (
                    <Button onClick={capturePhoto} fullWidth disabled={!!error}>
                        <Camera size={18} style={{ marginRight: '0.5rem' }} /> Capturer
                    </Button>
                )}
            </div>

            {image && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10B981', fontSize: '0.85rem', justifyContent: 'center' }}>
                    <CheckCircle size={16} /> Photo validée pour sécurité
                </div>
            )}
        </div>
    );
}
