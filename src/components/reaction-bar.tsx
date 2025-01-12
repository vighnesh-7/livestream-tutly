"use client";

import { useChat, useDataChannel, useRoomContext, useIsRecording } from "@livekit/components-react";
import { Button, Flex, Tooltip } from "@radix-ui/themes";
import { useEffect, useState, useCallback } from "react";
import { supportsScreenSharing } from '@livekit/components-core';
import { TrackToggle } from '@livekit/components-react';
import { Track } from 'livekit-client';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"



export function ReactionBar({
  isHost = false,
}) {
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
      <Popover>
        <PopoverTrigger asChild>
          <Button size="4" variant="outline">
        Reactions
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 py-1">
          <div className="gap-2 flex items-center justify-center p-0 cursor-pointer">
            <Tooltip content="Fire" delayDuration={0}>
              <div onClick={() => onSend("🔥")}>
                🔥
              </div>
            </Tooltip>
            <Tooltip content="Applause">
              <div onClick={() => onSend("👏")}>
                👏
              </div>
            </Tooltip>
            <Tooltip content="LOL">
              <div onClick={() => onSend("🤣")}>
                🤣
              </div>
            </Tooltip>
            <Tooltip content="Love">
              <div onClick={() => onSend("❤️")}>
                ❤️
              </div>
            </Tooltip>
            <Tooltip content="Confetti">
              <div onClick={() => onSend("🎉")}>
                🎉
              </div>
            </Tooltip>
          </div>
        </PopoverContent>
      </Popover>
      { 
      isHost && <div 
      className="flex gap-2 "
      >
        <button disabled={processingRecRequest} 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-2"
        onClick={() => toggleRoomRecording()}>
          {isRecording ? 'Stop' : 'Start'} Recording
        </button>
        {
          browserSupportsScreenSharing &&
          <TrackToggle
              source={Track.Source.ScreenShare}
              captureOptions={{ audio: true, selfBrowserSurface: 'include' }}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-2 flex items-center gap-2"
              showIcon={true}
              onChange={onScreenShareChange}
              >
              {(isScreenShareEnabled ? 'Stop screen share' : 'Share screen')}
            </TrackToggle>
        }
          </div>
          }
    </Flex>
  );
}
