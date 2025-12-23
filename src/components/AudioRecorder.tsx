'use client';

import React, { useState, useRef } from 'react';
import { Mic, Square, Trash2 } from 'lucide-react';

interface AudioRecorderProps {
    onAudioReady: (audioBlob: Blob | null) => void;
}

export function AudioRecorder({ onAudioReady }: AudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);

            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);
                onAudioReady(audioBlob); // Pass Blob to parent

                // Stop all tracks to release microphone
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setAudioUrl(null);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Impossible d'accéder au micro. Vérifiez vos permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const deleteRecording = () => {
        setAudioUrl(null);
        setRecordingTime(0);
        onAudioReady(null); // Clear blob in parent
        audioChunksRef.current = [];
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', backgroundColor: '#F8FAFC', textAlign: 'center' }}>
            <div style={{ marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--muted)' }}>
                Décrivez votre besoin vocalement 🎤
            </div>

            {!audioUrl ? (
                <button
                    type="button" // Prevent form submit
                    onClick={isRecording ? stopRecording : startRecording}
                    style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        backgroundColor: isRecording ? '#EF4444' : 'var(--primary)',
                        color: 'white', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        animation: isRecording ? 'pulse 1.5s infinite' : 'none'
                    }}
                >
                    {isRecording ? <Square size={28} fill="white" /> : <Mic size={32} />}
                </button>
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                    <audio controls src={audioUrl} style={{ height: '40px', maxWidth: '200px' }} />
                    <button
                        type="button"
                        onClick={deleteRecording}
                        style={{ padding: '0.5rem', borderRadius: '50%', border: '1px solid #EF4444', backgroundColor: 'white', color: '#EF4444', cursor: 'pointer' }}
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            )}

            {isRecording && (
                <div style={{ marginTop: '0.5rem', color: '#EF4444', fontWeight: 'bold' }}>
                    Enregistrement... {formatTime(recordingTime)}
                </div>
            )}

            <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
        </div>
    );
}
