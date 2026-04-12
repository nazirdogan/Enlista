import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Composition } from 'remotion';
import { CONFIG } from '../config';
import { Reel1VoiceToCopy } from './Reel1_VoiceToCopy';
import { Reel2WhatsAppAuto } from './Reel2_WhatsAppAuto';
const Reel3TimeSavings = () => (_jsx("div", { style: { width: '100%', height: '100%', backgroundColor: '#000' } }));
const Reel4LeadRaceResponse = () => (_jsx("div", { style: { width: '100%', height: '100%', backgroundColor: '#000' } }));
export const RemotionRoot = () => {
    return (_jsxs(_Fragment, { children: [_jsx(Composition, { id: "Reel1_VoiceToCopy", component: Reel1VoiceToCopy, durationInFrames: CONFIG.REEL1_DURATION, fps: CONFIG.FPS, width: CONFIG.VIDEO_WIDTH, height: CONFIG.VIDEO_HEIGHT }), _jsx(Composition, { id: "Reel2_WhatsAppAuto", component: Reel2WhatsAppAuto, durationInFrames: CONFIG.REEL2_DURATION, fps: CONFIG.FPS, width: CONFIG.VIDEO_WIDTH, height: CONFIG.VIDEO_HEIGHT }), _jsx(Composition, { id: "Reel3_TimeSavings", component: Reel3TimeSavings, durationInFrames: CONFIG.REEL3_DURATION, fps: CONFIG.FPS, width: CONFIG.VIDEO_WIDTH, height: CONFIG.VIDEO_HEIGHT }), _jsx(Composition, { id: "Reel4_LeadRaceResponse", component: Reel4LeadRaceResponse, durationInFrames: CONFIG.REEL4_DURATION, fps: CONFIG.FPS, width: CONFIG.VIDEO_WIDTH, height: CONFIG.VIDEO_HEIGHT })] }));
};
//# sourceMappingURL=index.js.map