"use client";

import { StreamPlayer } from "@/components/stream-player";
import { TokenContext } from "@/components/token-context";
import { LiveKitRoom } from "@livekit/components-react";

export default function HostPage({
  authToken,
  roomToken,
  serverUrl,
}: {
  authToken: string;
  roomToken: string;
  serverUrl: string;
}) {
  return (
    <TokenContext.Provider value={authToken}>
      <LiveKitRoom serverUrl={serverUrl} token={roomToken}>
        <StreamPlayer isHost />
      </LiveKitRoom>
    </TokenContext.Provider>
  );
}
