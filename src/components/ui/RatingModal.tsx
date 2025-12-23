'use client';

import React, { useState } from 'react';
import { Button } from './Button';
import { Star, X } from 'lucide-react';

interface RatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: number, comment: string) => void;
    providerName: string;
}

export function RatingModal({ isOpen, onClose, onSubmit, providerName }: RatingModalProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (rating === 0) {
            alert("Merci de sélectionner au moins une étoile !");
            return;
        }
        onSubmit(rating, comment);
        // Reset state
        setRating(0);
        setComment('');
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000,
            padding: '1rem'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '1.5rem',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <X size={24} color="#64748B" />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Notez la prestation</h2>
                    <p style={{ color: '#64748B' }}>Comment s'est passée la mission avec <strong>{providerName}</strong> ?</p>
                </div>

                {/* Stars */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                            <Star
                                size={32}
                                fill={(hoverRating || rating) >= star ? '#FBBF24' : 'none'}
                                color={(hoverRating || rating) >= star ? '#FBBF24' : '#CBD5E1'}
                                strokeWidth={2}
                            />
                        </button>
                    ))}
                </div>

                {/* Comment */}
                <textarea
                    placeholder="Un petit commentaire ? (Optionnel)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={{
                        width: '100%',
                        height: '100px',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        marginBottom: '1.5rem',
                        fontFamily: 'inherit',
                        resize: 'none'
                    }}
                />

                <Button fullWidth onClick={handleSubmit} size="lg">
                    Envoyer l'avis
                </Button>
            </div>
        </div>
    );
}
