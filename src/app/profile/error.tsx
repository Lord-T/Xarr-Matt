'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Profile Page Error:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center space-y-4">
            <h2 className="text-xl font-bold text-red-600">Une erreur est survenue !</h2>
            <p className="text-gray-600 max-w-md bg-gray-100 p-4 rounded text-sm font-mono overflow-auto">
                {error.message || "Erreur inconnue"}
            </p>
            <Button
                onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                }
            >
                Réessayer
            </Button>
        </div>
    );
}
