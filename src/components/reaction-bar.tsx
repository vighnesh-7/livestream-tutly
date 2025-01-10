"use client";

import { useChat, useDataChannel, useRoomContext, useIsRecording } from "@livekit/components-react";
import { Button, Flex, Tooltip } from "@radix-ui/themes";
import { useEffect, useState, useCallback } from "react";
import { supportsScreenSharing } from '@livekit/components-core';
import { TrackToggle } from '@livekit/components-react';
import { Track } from 'livekit-client';



export function ReactionBar() {
  const [encoder] = useState(() => new TextEncoder());
  const { send } = useDataChannel("reactions");
  const { send: sendChat } = useChat();

  const onSend = (emoji: string) => {
    send(encoder.encode(emoji), {});
    if (sendChat) {
      sendChat(emoji);
    }
  };

  // recording

  const room = useRoomContext();
  const recordingEndpoint = process.env.NEXT_PUBLIC_LK_RECORD_ENDPOINT;

  const isRecording = useIsRecording();
  const [initialRecStatus, setInitialRecStatus] = useState(isRecording);
  const [processingRecRequest, setProcessingRecRequest] = useState(false);

  useEffect(() => {
    if (initialRecStatus !== isRecording) {
      setProcessingRecRequest(false);
    }
  }, [isRecording, initialRecStatus]);

  const toggleRoomRecording = async () => {
    if (!recordingEndpoint) {
      throw TypeError('No recording endpoint specified');
    }
    if (room.isE2EEEnabled) {
      throw Error('Recording of encrypted meetings is currently not supported');
    }
    setProcessingRecRequest(true);
    setInitialRecStatus(isRecording);
    let response: Response;
    if (isRecording) {
      response = await fetch(recordingEndpoint + `/stop?roomName=${room.name}`);
    } else {
      response = await fetch(recordingEndpoint + `/start?roomName=${room.name}`);
    }
    if (response.ok) {
    } else {
      console.error(
        'Error handling recording request, check server logs:',
        response.status,
        response.statusText,
      );
      setProcessingRecRequest(false);
    }
  };


  const browserSupportsScreenSharing = supportsScreenSharing();

  const [isScreenShareEnabled, setIsScreenShareEnabled] = useState(false);

  const onScreenShareChange = useCallback(
    (enabled: boolean) => {
      setIsScreenShareEnabled(enabled);
    },
    [setIsScreenShareEnabled],
  );

  return (
    <Flex
      gap="2"
      justify="center"
      align="center"
      className="border-t border-accent-5 bg-accent-3 h-[100px] text-center"
    >
      <Tooltip content="Fire" delayDuration={0}>
        <Button size="4" variant="outline" onClick={() => onSend("🔥")}>
          🔥
        </Button>
      </Tooltip>
      <Tooltip content="Applause">
        <Button size="4" variant="outline" onClick={() => onSend("👏")}>
          👏
        </Button>
      </Tooltip>
      <Tooltip content="LOL">
        <Button size="4" variant="outline" onClick={() => onSend("🤣")}>
          🤣
        </Button>
      </Tooltip>
      <Tooltip content="Love">
        <Button size="4" variant="outline" onClick={() => onSend("❤️")}>
          ❤️
        </Button>
      </Tooltip>
      <Tooltip content="Confetti">
        <Button size="4" variant="outline" onClick={() => onSend("🎉")}>
          🎉
        </Button>
      </Tooltip>
      <button disabled={processingRecRequest} onClick={() => toggleRoomRecording()}>
        {isRecording ? 'Stop' : 'Start'} Recording
      </button>
      <TrackToggle
          source={Track.Source.ScreenShare}
          captureOptions={{ audio: true, selfBrowserSurface: 'include' }}
          showIcon={true}
          onChange={onScreenShareChange}
        >
          {(isScreenShareEnabled ? 'Stop screen share' : 'Share screen')}
        </TrackToggle>
    </Flex>
  );
}
