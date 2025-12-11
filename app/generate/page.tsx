'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export default function GeneratePage() {
    const { data: session, isPending } = useSession();
    const router = useRouter();

    const [formData, setFormData] = useState({
        recipient: '',
        relationship: '',
        tone: '',
        vibe: '',
        style: '',
        story: '',
        personalization: 'medium',
        length: '2-3 minutes',
        include_name: true
    });

    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');
    const [taskId, setTaskId] = useState('');
    const [audioUrl, setAudioUrl] = useState('');
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        if (session) {
            fetchHistory();
        }
    }, [session]);

    const fetchHistory = async () => {
        try {
            const response = await fetch('/api/history');
            const data = await response.json();
            if (data.success) {
                setHistory(data.history);
                // Check if any items are still in progress and trigger status checks for them
                const inProgressItems = data.history.filter((item: any) =>
                    item.status === 'pending' || item.status === 'in_progress'
                );

                if (inProgressItems.length > 0) {
                    // Poll for each pending item
                    inProgressItems.forEach((item: any) => {
                        // Only poll if we aren't already polling this specific ID in the main view
                        if (item.taskId !== taskId) {
                            checkHistoryItemStatus(item.taskId);
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch history:', error);
        }
    };

    const checkHistoryItemStatus = async (id: string) => {
        try {
            const response = await fetch(`/api/status/${id}`);
            const data = await response.json();

            const status = data.status || data.state;
            const audioUrl = data.audio_url || data.audioUrl;

            if (status === 'COMPLETED' || status === 'complete' || status === 'failed' || status === 'error') {
                // Refresh history to update UI with final status
                fetchHistory();
            } else {
                // If still pending, check again in 5 seconds
                setTimeout(() => checkHistoryItemStatus(id), 5000);
            }
        } catch (err) {
            console.error('Error checking history item status:', err);
        }
    };

    // Redirect to login if not authenticated
    if (!isPending && !session) {
        router.push('/');
        return null;
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const generatePrompt = async () => {
        console.log('[FRONTEND] Generate prompt clicked');
        setLoading(true);
        setError('');
        setStatus('Creating your music prompt...');
        try {
            console.log('[FRONTEND] Sending request to /api/create-prompt');
            const response = await fetch('/api/create-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            console.log('[FRONTEND] Response status:', response.status);
            const data = await response.json();
            console.log('[FRONTEND] Response data:', data);
            if (data.success) {
                console.log('[FRONTEND] Setting generated prompt:', data.prompt);
                setGeneratedPrompt(data.prompt);
                // Automatically start music generation
                await startMusicGeneration(data.prompt);
            } else {
                console.error('[FRONTEND] Error from API:', data.message);
                setError(data.message || 'Failed to generate prompt');
                setLoading(false);
            }
        } catch (err: any) {
            console.error('[FRONTEND] Exception:', err);
            setError(err.message || 'Error generating prompt');
            setLoading(false);
        }
    };

    const startMusicGeneration = async (prompt: string) => {
        console.log('[FRONTEND] Starting music generation with prompt:', prompt);
        setStatus('Generating your music...');
        setError(''); // Clear any previous errors

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt,
                    make_instrumental: false,
                    wait_audio: false
                })
            });

            const data = await response.json();
            console.log('[FRONTEND] Generate response:', data);

            // Handle rate limiting
            if (response.status === 429) {
                setError('Rate limit reached. Please wait before trying again.');
                setLoading(false);
                return;
            }

            // MusicGPT returns task_id, not id
            const taskId = data.task_id || data.id;

            if (taskId) {
                setTaskId(taskId);
                const eta = data.eta ? `~${Math.ceil(data.eta / 60)} minutes` : 'a few minutes';
                setStatus(`Music generation started. ETA: ${eta}. Please wait...`);
                fetchHistory(); // Show the new pending item in history immediately
                pollStatus(taskId);
            } else {
                setError(data.message || data.detail || 'Failed to start music generation');
                setLoading(false);
            }
        } catch (err: any) {
            console.error('[FRONTEND] Music generation error:', err);
            setError(err.message || 'Error generating music');
            setLoading(false);
        }
    };

    const generateMusic = async () => {
        if (!generatedPrompt) {
            setError('Please generate a prompt first');
            return;
        }
        await startMusicGeneration(generatedPrompt);
    };

    const pollStatus = async (id: string) => {
        const checkStatus = async () => {
            try {
                console.log('[FRONTEND] Polling status for task:', id);
                const response = await fetch(`/api/status/${id}`);
                const data = await response.json();
                console.log('[FRONTEND] Status response:', data);

                // Check for completion - MusicGPT might use different field names
                const audioUrl = data.audio_url
                    || data.audioUrl
                    || data.url
                    || data.conversion?.conversion_path_1
                    || data.conversion?.conversion_path_2;
                const status = data.status || data.state;

                console.log('[FRONTEND] Extracted - Status:', status, 'Audio URL:', audioUrl);

                if ((status === 'COMPLETED' || status === 'complete') && audioUrl) {
                    console.log('[FRONTEND] ✅ Music complete! Audio URL:', audioUrl);
                    setAudioUrl(audioUrl);
                    setStatus('Music generated successfully!');
                    setLoading(false);
                    fetchHistory(); // Refresh history on completion
                } else if (status === 'error' || status === 'failed') {
                    console.error('[FRONTEND] Music generation failed:', data);
                    setError(data.error || data.message || 'Music generation failed');
                    setLoading(false);
                } else {
                    // Still processing
                    const currentStatus = status || 'processing';
                    console.log('[FRONTEND] Current status:', currentStatus);
                    setStatus(`Status: ${currentStatus}... (polling every 3s)`);
                    setTimeout(checkStatus, 3000); // Poll every 3 seconds
                }
            } catch (err: any) {
                console.error('[FRONTEND] Status check error:', err);
                setError(err.message || 'Error checking status');
                setLoading(false);
            }
        };

        checkStatus();
    };

    if (isPending) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#666' }}>Loading...</p>
            </div>
        );
    }

    const handleRetry = () => {
        if (generatedPrompt) {
            startMusicGeneration(generatedPrompt);
        } else {
            generatePrompt();
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '40px 20px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Header with Logout */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px', color: '#000' }}>Music Generator</h1>
                        <p style={{ color: '#666' }}>Create custom AI-generated music</p>
                    </div>
                    <button
                        onClick={() => signOut()}
                        style={{
                            padding: '10px 20px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Logout
                    </button>
                </div>

                {/* Form */}
                <div style={{ background: 'white', padding: '32px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: '#000' }}>Song Details</h2>

                    <div style={{ display: 'grid', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#171717' }}>Recipient</label>
                            <input
                                type="text"
                                name="recipient"
                                value={formData.recipient}
                                onChange={handleInputChange}
                                placeholder="Who is this song for?"
                                style={{ width: '100%', padding: '10px', border: '1px solid #e5e5e5', borderRadius: '8px', color: '#000' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#171717' }}>Relationship</label>
                            <input
                                type="text"
                                name="relationship"
                                value={formData.relationship}
                                onChange={handleInputChange}
                                placeholder="e.g., Wife, Friend, Mother"
                                style={{ width: '100%', padding: '10px', border: '1px solid #e5e5e5', borderRadius: '8px', color: '#000' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#171717' }}>Tone/Feelings</label>
                            <input
                                type="text"
                                name="tone"
                                value={formData.tone}
                                onChange={handleInputChange}
                                placeholder="e.g., Joyful, Romantic, Nostalgic"
                                style={{ width: '100%', padding: '10px', border: '1px solid #e5e5e5', borderRadius: '8px', color: '#000' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#171717' }}>Overall Vibe</label>
                            <input
                                type="text"
                                name="vibe"
                                value={formData.vibe}
                                onChange={handleInputChange}
                                placeholder="e.g., Upbeat, Calm, Energetic"
                                style={{ width: '100%', padding: '10px', border: '1px solid #e5e5e5', borderRadius: '8px', color: '#000' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#171717' }}>Music Style</label>
                            <input
                                type="text"
                                name="style"
                                value={formData.style}
                                onChange={handleInputChange}
                                placeholder="e.g., Pop, Jazz, Rock, Classical"
                                style={{ width: '100%', padding: '10px', border: '1px solid #e5e5e5', borderRadius: '8px', color: '#000' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#171717' }}>Story/Memories</label>
                            <textarea
                                name="story"
                                value={formData.story}
                                onChange={handleInputChange}
                                placeholder="Share the story or memories you want in the song..."
                                rows={4}
                                style={{ width: '100%', padding: '10px', border: '1px solid #e5e5e5', borderRadius: '8px', resize: 'vertical', color: '#000' }}
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                                type="checkbox"
                                name="include_name"
                                checked={formData.include_name}
                                onChange={handleInputChange}
                                id="include_name"
                            />
                            <label htmlFor="include_name" style={{ fontWeight: '600', color: '#171717' }}>Include recipient's name in the song</label>
                        </div>
                    </div>

                    <button
                        onClick={generatePrompt}
                        disabled={loading}
                        style={{
                            marginTop: '24px',
                            width: '100%',
                            padding: '12px',
                            background: '#6366f1',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {loading ? 'Generating Music...' : 'Generate Music'}
                    </button>
                </div>

                {/* Current Generation Card */}
                {(loading || status || error || (taskId && !audioUrl)) && (
                    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: error ? '4px solid #ef4444' : '4px solid #6366f1' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#000' }}>Current Generation</h3>

                        {error ? (
                            <div>
                                <p style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</p>
                                <button
                                    onClick={handleRetry}
                                    style={{
                                        padding: '8px 16px',
                                        background: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    Retry Generation
                                </button>
                            </div>
                        ) : (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    {loading && <div className="spinner" style={{ width: '20px', height: '20px', border: '2px solid #e5e7eb', borderTop: '2px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />}
                                    <p style={{ color: '#6366f1', fontWeight: '600' }}>{status || 'Processing...'}</p>
                                </div>
                                {taskId && <p style={{ color: '#666', fontSize: '14px' }}>Task ID: {taskId}</p>}
                                <style jsx>{`
                                    @keyframes spin {
                                        0% { transform: rotate(0deg); }
                                        100% { transform: rotate(360deg); }
                                    }
                                `}</style>
                            </div>
                        )}
                    </div>
                )}

                {/* Audio Player (Success State) */}
                {audioUrl && (
                    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #22c55e', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#000' }}>Your Generated Music</h3>
                        <p style={{ color: '#22c55e', fontWeight: '600', marginBottom: '16px' }}>Generation Successful!</p>
                        <audio controls style={{ width: '100%' }} src={audioUrl}>
                            Your browser does not support the audio element.
                        </audio>
                        <a
                            href={audioUrl}
                            download
                            style={{
                                display: 'block',
                                marginTop: '16px',
                                padding: '12px',
                                background: '#6366f1',
                                color: 'white',
                                textAlign: 'center',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontWeight: '600'
                            }}
                        >
                            Download Music
                        </a>
                    </div>
                )}

                {/* History Section */}
                <div style={{ marginTop: '40px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#000' }}>Your Music History</h2>
                    {history.length > 0 ? (
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {history.map((item) => (
                                <div key={item.id} style={{
                                    background: 'white',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '12px'
                                }}>
                                    <div style={{ flex: 1, minWidth: '200px' }}>
                                        <p style={{ fontWeight: '600', color: '#171717', marginBottom: '4px' }}>
                                            {item.generatedPrompt || 'No prompt'}
                                        </p>
                                        <div style={{ display: 'flex', gap: '12px', fontSize: '14px', color: '#666' }}>
                                            <span>
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </span>
                                            <span style={{
                                                textTransform: 'capitalize',
                                                color: item.status === 'completed' ? '#16a34a' :
                                                    item.status === 'failed' ? '#dc2626' : '#ea580c'
                                            }}>
                                                ● {item.status}
                                            </span>
                                        </div>
                                    </div>

                                    {item.status === 'completed' && (
                                        // Prefer WAV if available, otherwise fallback to MP3
                                        (item.audioUrlWav1 || item.audioUrlWav2 || item.audioUrl1 || item.audioUrl2) && (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                                <audio
                                                    controls
                                                    src={item.audioUrlWav1 || item.audioUrlWav2 || item.audioUrl1 || item.audioUrl2}
                                                    style={{ height: '40px', maxWidth: '300px' }}
                                                />
                                                <a
                                                    href={item.audioUrlWav1 || item.audioUrlWav2 || item.audioUrl1 || item.audioUrl2}
                                                    download
                                                    style={{ fontSize: '12px', color: '#6366f1', textDecoration: 'none' }}
                                                >
                                                    Download
                                                </a>
                                            </div>
                                        )
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            background: 'white',
                            padding: '40px',
                            borderRadius: '12px',
                            textAlign: 'center',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                            <p style={{ color: '#666', fontSize: '16px' }}>No music generated yet. Create your first song above!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
