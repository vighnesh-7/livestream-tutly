import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Activity, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { useStreamAnalytics } from "@/hooks/use-stream-analytics"

interface StreamAnalyticsModalProps {
  analytics: ReturnType<typeof useStreamAnalytics>;
  roomName: string;
}

export function StreamAnalyticsModal({ analytics, roomName }: StreamAnalyticsModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!analytics) return null;

  const streamDuration = Date.now() - new Date(analytics.streamStartTime).getTime();
  const durationInMinutes = Math.floor(streamDuration / 1000 / 60);

  const chartData = analytics.userCountTimeline.map(point => ({
    time: format(new Date(point.timestamp), 'HH:mm'),
    users: point.count,
  }));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Activity className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Stream Analytics - {roomName}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4">
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
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.peakConcurrentUsers}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Viewer Timeline</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#2563eb"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Participant Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Minutes Watched</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>First seen</TableHead>
                  <TableHead>Last seen</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.values(analytics.participants).map((participant) => (
                  <TableRow key={participant.identity}>
                    <TableCell className="font-medium">{participant.identity}</TableCell>
                    <TableCell>{Math.round(participant.minutesWatched)}</TableCell>
                    <TableCell>{participant.sessions.length}</TableCell>
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
                            Video {participant.connectionQuality && `(${participant.connectionQuality})`}
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

