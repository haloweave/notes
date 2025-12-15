'use client';

import { useState, useRef, useEffect } from 'react';
import { type MusicGeneration } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Square, Download, Calendar, Share2, Check, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getShareUrl } from '@/lib/share-utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface SongCardProps {
    item: MusicGeneration;
    currentPlayingId?: string | null;
    onPlay?: (id: string) => void;
    onUpdate?: () => void;
}

export function SongCard({ item, currentPlayingId, onPlay, onUpdate }: SongCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const [selectedVersion, setSelectedVersion] = useState<'v1' | 'v2'>('v1');
    const [copied, setCopied] = useState(false);

    // Edit dialog state
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [customMessage, setCustomMessage] = useState('');
    const [customTitle, setCustomTitle] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Prefill dialog when it opens
    useEffect(() => {
        if (showEditDialog) {
            setCustomMessage(item.customMessage || '');
            setCustomTitle(item.customTitle || '');
        }
    }, [showEditDialog, item.customMessage, item.customTitle]);

    // Determine the active audio URL based on selection
    // Prioritize MP3 for better streaming (smaller, faster loading)
    const activeAudioUrl = selectedVersion === 'v1'
        ? (item.audioUrl1 || item.audioUrlWav1)
        : (item.audioUrl2 || item.audioUrlWav2);

    // Fallback if the selected version is missing (unlikely if completed, but good for safety)
    const audioUrl = activeAudioUrl || (item.audioUrl1 || item.audioUrlWav1);

    // Check if we actually have two versions to toggle between
    const hasSecondVersion = !!(item.audioUrlWav2 || item.audioUrl2);

    useEffect(() => {
        if (audioRef.current) {
            // Reset state when audio source changes
            setProgress(0);
            setIsPlaying(false);
            if (audioRef.current) audioRef.current.currentTime = 0;
            setIsExpanded(false); // Collapse when switching versions
        }
    }, [audioUrl]);

    // Stop playing if another song starts
    useEffect(() => {
        if (currentPlayingId && currentPlayingId !== item.id && isPlaying) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            setIsPlaying(false);
            setProgress(0);
        }
    }, [currentPlayingId, item.id, isPlaying]);

    const togglePlay = (e?: React.MouseEvent) => {
        e?.stopPropagation();

        // Get the share slug for the selected version
        const slug = selectedVersion === 'v1' ? item.shareSlugV1 : item.shareSlugV2;

        if (!slug) {
            console.error('No share slug available');
            return;
        }

        // Open the immersive player in a new tab
        const shareUrl = getShareUrl(slug);
        window.open(shareUrl, '_blank');
    };

    // ... (rest of handlers remain same)

    const handleVersionChange = (version: 'v1' | 'v2') => {
        if (selectedVersion === version) return;
        setSelectedVersion(version);
        // State reset handled by useEffect on audioUrl dependency
    };

    // ...



    const stopPlayback = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
            setProgress(0);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime;
            const total = audioRef.current.duration;
            setCurrentTime(current);
            if (!isNaN(total)) {
                setDuration(total);
                setProgress((current / total) * 100);
            }
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
        if (audioRef.current) audioRef.current.currentTime = 0;
    };

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        if (audioRef.current && !isNaN(audioRef.current.duration)) {
            const time = (val / 100) * audioRef.current.duration;
            audioRef.current.currentTime = time;
            setProgress(val);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const copyShareLink = async (e?: React.MouseEvent) => {
        e?.stopPropagation();
        const slug = selectedVersion === 'v1' ? item.shareSlugV1 : item.shareSlugV2;

        if (!slug) {
            console.error('No share slug available for this version');
            return;
        }

        const shareUrl = getShareUrl(slug);

        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const saveEdits = async () => {
        setIsSaving(true);
        try {
            const response = await fetch(`/api/songs/${item.id}/edit`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customMessage,
                    customTitle
                })
            });

            if (response.ok) {
                setShowEditDialog(false);
                onUpdate?.(); // Refresh the list
            } else {
                console.error('Failed to save edits');
            }
        } catch (error) {
            console.error('Error saving edits:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const isProcessing = item.status === 'pending' || item.status === 'in_progress' || !audioUrl;
    const isFailed = item.status === 'failed' || item.status === 'error';

    return (
        <Card className={cn(
            "group relative overflow-hidden transition-all duration-300 border border-gray-100 hover:shadow-lg hover:border-blue-100 bg-white",
            isExpanded ? "shadow-md ring-1 ring-blue-100" : ""
        )}>
            {/* Background Gradient Effect on Hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-50/30 to-blue-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="p-4 md:p-6 relative z-10">
                <div className="flex items-start md:items-center justify-between gap-3 md:gap-6 flex-col md:flex-row">
                    {/* Left: Info */}
                    <div className="flex-1 min-w-0 w-full">
                        <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
                            <span className={cn(
                                "text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1",
                                item.status === 'completed' ? 'bg-green-100 text-green-700' :
                                    isProcessing ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                            )}>
                                {isProcessing && <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full border-2 border-current border-t-transparent animate-spin" />}
                                {item.status === 'in_progress' ? 'Processing' : (item.status || 'Pending')}
                            </span>
                            <div className="flex items-center text-[10px] md:text-xs text-gray-400 gap-1">
                                <Calendar className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                {new Date(item.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                        <h3 className="font-bold text-gray-900 text-base md:text-lg leading-tight truncate pr-2 md:pr-4" title={item.customTitle || (selectedVersion === 'v1' ? item.title1 : item.title2) || item.generatedPrompt || 'Untitled'}>
                            {item.customTitle || (selectedVersion === 'v1' ? item.title1 : item.title2) || item.generatedPrompt || 'Untitled Composition'}
                        </h3>
                        {((item.customTitle || (selectedVersion === 'v1' ? item.title1 : item.title2)) && item.generatedPrompt) && (
                            <p className="text-[10px] md:text-xs text-gray-500 mt-1 line-clamp-1">
                                {item.generatedPrompt}
                            </p>
                        )}
                        {isProcessing && (
                            <p className="text-[10px] md:text-xs text-muted-foreground mt-1 animate-pulse">
                                Composing your song, This usually takes about 2 minutes...
                            </p>
                        )}
                        {isFailed && (
                            <p className="text-[10px] md:text-xs text-red-500 mt-1">
                                Generation failed. Please try again.
                            </p>
                        )}
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex flex-col items-end gap-2 self-end md:self-auto">
                        {hasSecondVersion && item.status === 'completed' && (
                            <div className="flex items-center bg-gray-100 rounded-full p-1 w-fit mb-1" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleVersionChange('v1'); }}
                                    className={cn(
                                        "px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs font-semibold rounded-full transition-all",
                                        selectedVersion === 'v1'
                                            ? "bg-white text-blue-600 shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                    )}
                                >
                                    V1
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleVersionChange('v2'); }}
                                    className={cn(
                                        "px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs font-semibold rounded-full transition-all",
                                        selectedVersion === 'v2'
                                            ? "bg-white text-blue-600 shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                    )}
                                >
                                    V2
                                </button>
                            </div>
                        )}

                        {isProcessing ? (
                            <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center bg-gray-50 border border-gray-100">
                                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border-4 border-blue-500/30 border-t-blue-600 animate-spin" />
                            </div>
                        ) : isFailed ? (
                            <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center bg-red-50 border border-red-100 text-red-500">
                                <Square className="w-5 h-5 md:w-6 md:h-6 fill-current opacity-50" />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                {/* Edit Button */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowEditDialog(true); }}
                                    className={cn(
                                        "flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm",
                                        item.customMessage
                                            ? "bg-purple-100 text-purple-600 hover:bg-purple-200"
                                            : "bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-600 hover:scale-105"
                                    )}
                                    title={item.customMessage ? "Edit title & message" : "Add title & message"}
                                >
                                    <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
                                </button>

                                {/* Share Button */}
                                {(selectedVersion === 'v1' ? item.shareSlugV1 : item.shareSlugV2) && (
                                    <button
                                        onClick={copyShareLink}
                                        disabled={!item.shareSlugV1 && !item.shareSlugV2}
                                        className={cn(
                                            "flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm",
                                            copied
                                                ? "bg-green-100 text-green-600 scale-95"
                                                : "bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-600 hover:scale-105"
                                        )}
                                        title="Copy share link"
                                    >
                                        {copied ? (
                                            <Check className="w-4 h-4 md:w-5 md:h-5" />
                                        ) : (
                                            <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                                        )}
                                    </button>
                                )}

                                {/* Play Button */}
                                <button
                                    onClick={togglePlay}
                                    disabled={!audioUrl}
                                    className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm bg-gray-900 text-white hover:bg-blue-600 hover:scale-105 hover:shadow-blue-200 hover:shadow-xl"
                                    title="Open player in new tab"
                                >
                                    <Play className="w-6 h-6 md:w-8 md:h-8 fill-current ml-0.5 md:ml-1" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Edit Song Details</DialogTitle>
                        <DialogDescription>
                            Customize the title and message for your song. The message will be displayed on the public play page.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Title Input */}
                        <div>
                            <Label htmlFor="song-title" className="text-sm font-medium mb-2 block">
                                Song Title
                            </Label>
                            <Input
                                id="song-title"
                                placeholder="Enter a custom title for your song"
                                value={customTitle}
                                onChange={(e) => setCustomTitle(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                This title applies to both versions. Leave empty to use the AI-generated title.
                            </p>
                        </div>

                        {/* Custom Message */}
                        <div>
                            <Label htmlFor="custom-message" className="text-sm font-medium mb-2 block">
                                Custom Message
                            </Label>
                            <Textarea
                                id="custom-message"
                                placeholder="e.g., 'Merry Christmas! Hope you love this special song I made for you!'"
                                value={customMessage}
                                onChange={(e) => setCustomMessage(e.target.value)}
                                rows={5}
                                className="resize-none"
                            />

                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowEditDialog(false)}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={saveEdits}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card >
    );
}
