import { useEffect, useState } from 'react';
import { Participant } from 'livekit-client';

interface ParticipantActivity {
  identity: string;
  joinTime: string;
  lastSeenAt: string;
  sessions: Array<{
    joinedAt: string;
    leftAt: string;
  }>;
  audioEnabled: boolean;
  videoEnabled: boolean;
  hasScreenShared: boolean;
}

export function useStreamAnalytics(participants: Participant[]) {
  const [analytics, setAnalytics] = useState<{
    participants: Record<string, ParticipantActivity>;
    peakConcurrentUsers: number;
    totalMessages: number;
    streamStartTime: string;
  }>(() => {
    const stored = localStorage.getItem('stream-analytics');
    return stored ? JSON.parse(stored) : {
      participants: {},
      peakConcurrentUsers: 0,
      totalMessages: 0,
      streamStartTime: new Date().toISOString(),
    };
  });

  useEffect(() => {
    const now = new Date().toISOString();
    
    participants.forEach((participant) => {
      setAnalytics((prev) => {
        const existing = prev.participants[participant.identity] || {
          identity: participant.identity,
          joinTime: now,
          lastSeenAt: now,
          sessions: [],
          audioEnabled: false,
          videoEnabled: false,
          hasScreenShared: false,
        };

        // Update last seen
        existing.lastSeenAt = now;

        // Track media state
        existing.audioEnabled = participant.isMicrophoneEnabled
        existing.videoEnabled = participant.isCameraEnabled

        // Check for screen sharing
        const hasScreenShare = participant.isScreenShareEnabled
        if (hasScreenShare) {
          existing.hasScreenShared = true;
        }

        return {
          ...prev,
          participants: {
            ...prev.participants,
            [participant.identity]: existing,
          },
          peakConcurrentUsers: Math.max(prev.peakConcurrentUsers, participants.length),
        };
      });
    });

    // Save to localStorage
    localStorage.setItem('stream-analytics', JSON.stringify(analytics));
  }, [participants]);

  return analytics;
}

