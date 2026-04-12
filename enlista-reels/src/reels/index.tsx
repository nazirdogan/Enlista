import React from 'react';
import { Composition } from 'remotion';
import { CONFIG } from '../config';
import { Reel1VoiceToCopy } from './Reel1_VoiceToCopy';

const Reel2WhatsAppAuto: React.FC = () => (
  <div style={{ width: '100%', height: '100%', backgroundColor: '#000' }} />
);

const Reel3TimeSavings: React.FC = () => (
  <div style={{ width: '100%', height: '100%', backgroundColor: '#000' }} />
);

const Reel4LeadRaceResponse: React.FC = () => (
  <div style={{ width: '100%', height: '100%', backgroundColor: '#000' }} />
);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Reel1_VoiceToCopy"
        component={Reel1VoiceToCopy}
        durationInFrames={CONFIG.REEL1_DURATION}
        fps={CONFIG.FPS}
        width={CONFIG.VIDEO_WIDTH}
        height={CONFIG.VIDEO_HEIGHT}
      />
      <Composition
        id="Reel2_WhatsAppAuto"
        component={Reel2WhatsAppAuto}
        durationInFrames={CONFIG.REEL2_DURATION}
        fps={CONFIG.FPS}
        width={CONFIG.VIDEO_WIDTH}
        height={CONFIG.VIDEO_HEIGHT}
      />
      <Composition
        id="Reel3_TimeSavings"
        component={Reel3TimeSavings}
        durationInFrames={CONFIG.REEL3_DURATION}
        fps={CONFIG.FPS}
        width={CONFIG.VIDEO_WIDTH}
        height={CONFIG.VIDEO_HEIGHT}
      />
      <Composition
        id="Reel4_LeadRaceResponse"
        component={Reel4LeadRaceResponse}
        durationInFrames={CONFIG.REEL4_DURATION}
        fps={CONFIG.FPS}
        width={CONFIG.VIDEO_WIDTH}
        height={CONFIG.VIDEO_HEIGHT}
      />
    </>
  );
};
