'use client';

import { useEffect, useState } from 'react';
import AuthErrorModal from './AuthErrorModal';

export default function GlobalAuthListener() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const handleUnauthorized = (event) => {
            console.log('GlobalAuthListener caught unauthorized event:', event.detail);
            setMessage(event.detail?.message || 'Session expired. Please log in again.');
            setIsOpen(true);
        };

        // Listen for the custom event dispatched by api.js
        window.addEventListener('auth:unauthorized', handleUnauthorized);

        return () => {
            window.removeEventListener('auth:unauthorized', handleUnauthorized);
        };
    }, []);

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <AuthErrorModal
            isOpen={isOpen}
            onClose={handleClose}
            message={message}
        />
    );
}
