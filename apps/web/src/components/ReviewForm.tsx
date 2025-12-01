// apps/web/src/components/ReviewForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '@homechef/ui';

interface ReviewFormProps {
    orderId: number;
    onReviewSubmit: () => void;
}

export default function ReviewForm({ orderId, onReviewSubmit }: ReviewFormProps) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const token = 'placeholder_jwt'; // NOTE: Placeholder for auth
        const res = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ order_id: orderId, rating, comment }),
        });

        if (res.ok) {
            alert('Review submitted for moderation!');
            onReviewSubmit();
        } else {
            const data = await res.json();
            setError(data.error || 'Failed to submit review.');
        }
        setIsSubmitting(false);
    };

    return (
        <div style={{ marginTop: '30px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
            <h3>Leave a Review</h3>
            <form onSubmit={handleReviewSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Rating (1-5)</label>
                    <input 
                        type="number" 
                        value={rating} 
                        onChange={e => setRating(parseInt(e.target.value))} 
                        min="1" 
                        max="5" 
                        required 
                        style={{ display: 'block', width: '100px', padding: '8px' }} 
                    />
                </div>
                <div style={{ marginTop: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Comment</label>
                    <textarea 
                        value={comment} 
                        onChange={e => setComment(e.target.value)} 
                        required 
                        style={{ display: 'block', width: '100%', minHeight: '100px', padding: '8px' }} 
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <Button type="submit" disabled={isSubmitting} style={{ marginTop: '10px' }}>
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </Button>
            </form>
        </div>
    );
};
