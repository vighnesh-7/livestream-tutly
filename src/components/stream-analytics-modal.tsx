'use client';

import { useState } from 'react';
import { useStreamAnalytics } from '@/hooks/use-stream-analytics';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface StreamAnalyticsModalProps {
  analytics: ReturnType<typeof useStreamAnalytics>;
}

export function StreamAnalyticsModal({ analytics }: StreamAnalyticsModalProps) {
  const [isOpen, setIsOpen] = useState(true);
  const streamDuration = Date.now() - new Date(analytics.streamStartTime).getTime();
  const durationInMinutes = Math.floor(streamDuration / 1000 / 60);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Activity className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Stream Analytics</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stream Duration</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{durationInMinutes}min</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Peak Viewers</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.peakConcurrentUsers}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Participant Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>First seen at</TableHead>
                  <TableHead>Last seen at</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.values(analytics.participants).map((participant) => (
                  <TableRow key={participant.identity}>
                    <TableCell className="font-medium">{participant.identity}</TableCell>
                    <TableCell>{format(new Date(participant.joinTime), 'hh:mm a')}</TableCell>
                    <TableCell>{format(new Date(participant.lastSeenAt), 'hh:mm a')}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {participant.audioEnabled && (
                          <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-700">
                            Audio
                          </span>
                        )}
                        {participant.videoEnabled && (
                          <span className="rounded-full bg-blue-500/20 px-2 py-1 text-xs text-blue-700">
                            Video
                          </span>
                        )}
                        {participant.hasScreenShared && (
                          <span className="rounded-full bg-purple-500/20 px-2 py-1 text-xs text-purple-700">
                            Shared Screen
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

