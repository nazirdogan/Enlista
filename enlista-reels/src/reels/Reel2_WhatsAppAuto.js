import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCurrentFrame, interpolate } from 'remotion';
import { InstagramFrame } from '../components/layouts/InstagramFrame';
import { iPhoneMockup as IPhoneMockup } from '../components/layouts/iPhoneMockup';
import { BRAND_COLORS, TYPOGRAPHY } from '../components/shared';
// Frame timing constants (40 seconds at 30 FPS = 1200 total frames)
const INTRO_FRAMES = { start: 0, end: 120 };
const SCENARIO1_FRAMES = { start: 120, end: 600 };
const SCENARIO2_FRAMES = { start: 600, end: 900 };
const IMPACT_FRAMES = { start: 900, end: 1080 };
const CTA_FRAMES = { start: 1080, end: 1200 };
// WhatsApp specific colors
const WA_GREEN = '#25D366';
const WA_RESPONSE_BG = '#f0f0f0';
const WA_LIGHT_BG = '#E7F9F0';
const MessageBubble = ({ text, isIncoming, opacity, slideInProgress, }) => {
    const offset = isIncoming ? -50 * (1 - slideInProgress) : 50 * (1 - slideInProgress);
    return (_jsx("div", { style: {
            opacity,
            transform: `translateX(${offset}px)`,
            display: 'flex',
            justifyContent: isIncoming ? 'flex-start' : 'flex-end',
            marginBottom: 12,
            paddingLeft: 8,
            paddingRight: 8,
        }, children: _jsx("div", { style: {
                maxWidth: '85%',
                backgroundColor: isIncoming ? WA_GREEN : WA_RESPONSE_BG,
                color: isIncoming ? '#ffffff' : '#1a1a1a',
                borderRadius: isIncoming ? '2px 12px 12px 12px' : '12px 2px 12px 12px',
                padding: '8px 12px',
                fontSize: 13,
                lineHeight: 1.4,
                fontFamily: TYPOGRAPHY.FAMILY,
                wordWrap: 'break-word',
            }, children: text }) }));
};
const WhatsAppScreen = ({ messages, backgroundColor = WA_LIGHT_BG, }) => {
    const frame = useCurrentFrame();
    return (_jsxs("div", { style: {
            width: '100%',
            height: '100%',
            backgroundColor,
            display: 'flex',
            flexDirection: 'column',
        }, children: [_jsx("div", { style: {
                    backgroundColor: '#128C7E',
                    color: '#ffffff',
                    padding: '12px 14px',
                    fontSize: 16,
                    fontWeight: 600,
                    fontFamily: TYPOGRAPHY.FAMILY,
                    borderBottom: '1px solid #e0e0e0',
                }, children: "Enlista Bot" }), _jsx("div", { style: {
                    flex: 1,
                    padding: '10px 8px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                }, children: messages.map(msg => {
                    const messageOpacity = interpolate(frame, [msg.frameStart, msg.frameStart + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                    const slideInProgress = interpolate(frame, [msg.frameStart, msg.frameStart + 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                    return (_jsx(MessageBubble, { text: msg.text, isIncoming: msg.isIncoming, opacity: messageOpacity, slideInProgress: slideInProgress }, msg.id));
                }) }), _jsxs("div", { style: {
                    backgroundColor: '#f0f0f0',
                    padding: '8px 10px',
                    borderTop: '1px solid #e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                }, children: [_jsx("input", { type: "text", placeholder: "Type a message...", disabled: true, style: {
                            flex: 1,
                            backgroundColor: '#fff',
                            border: 'none',
                            borderRadius: 20,
                            padding: '8px 14px',
                            fontSize: 12,
                            color: '#999',
                            fontFamily: TYPOGRAPHY.FAMILY,
                            outline: 'none',
                        } }), _jsx("div", { style: {
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            backgroundColor: WA_GREEN,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                        }, children: _jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "#fff", children: _jsx("path", { d: "M2 21L23 12 2 3v7l15 2-15 2z" }) }) })] })] }));
};
export const Reel2WhatsAppAuto = () => {
    const frame = useCurrentFrame();
    // Section 1: Intro - iPhone mockup with "Your lead replies..." text
    const introOpacity = interpolate(frame, [INTRO_FRAMES.start, INTRO_FRAMES.end - 20], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    const introTextOpacity = interpolate(frame, [INTRO_FRAMES.start + 30, INTRO_FRAMES.end - 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    // Section 2: Scenario 1 messages and response
    const scenario1Opacity = interpolate(frame, [SCENARIO1_FRAMES.start, SCENARIO1_FRAMES.start + 20, SCENARIO1_FRAMES.end - 20, SCENARIO1_FRAMES.end], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const responseSpeedOpacity = interpolate(frame, [SCENARIO1_FRAMES.start + 240, SCENARIO1_FRAMES.start + 260, SCENARIO1_FRAMES.end - 30, SCENARIO1_FRAMES.end], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    // Section 3: Scenario 2
    const scenario2Opacity = interpolate(frame, [SCENARIO2_FRAMES.start, SCENARIO2_FRAMES.start + 20, SCENARIO2_FRAMES.end - 20, SCENARIO2_FRAMES.end], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    // Section 4: Impact statement
    const impactOpacity1 = interpolate(frame, [IMPACT_FRAMES.start, IMPACT_FRAMES.start + 20, IMPACT_FRAMES.start + 120, IMPACT_FRAMES.start + 140], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const impactOpacity2 = interpolate(frame, [IMPACT_FRAMES.start + 120, IMPACT_FRAMES.start + 140, IMPACT_FRAMES.end - 20, IMPACT_FRAMES.end], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    // Section 5: CTA
    const ctaOpacity = interpolate(frame, [CTA_FRAMES.start, CTA_FRAMES.start + 20, CTA_FRAMES.end], [0, 1, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return (_jsxs(InstagramFrame, { backgroundColor: WA_LIGHT_BG, children: [frame < INTRO_FRAMES.end && (_jsxs("div", { style: {
                    opacity: introOpacity,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 32,
                    flex: 1,
                }, children: [_jsx("div", { style: { transform: 'scale(0.9)' }, children: _jsx(IPhoneMockup, { width: 320, height: 640, children: _jsx(WhatsAppScreen, { messages: [] }) }) }), _jsx("div", { style: {
                            opacity: introTextOpacity,
                            fontSize: TYPOGRAPHY.SIZES.XL,
                            fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
                            color: '#128C7E',
                            fontFamily: TYPOGRAPHY.FAMILY,
                            textAlign: 'center',
                            paddingLeft: 32,
                            paddingRight: 32,
                        }, children: "Your lead replies..." })] })), frame >= SCENARIO1_FRAMES.start && frame < SCENARIO1_FRAMES.end && (_jsxs("div", { style: {
                    opacity: scenario1Opacity,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 24,
                    flex: 1,
                    paddingLeft: 24,
                    paddingRight: 24,
                }, children: [_jsx("div", { style: { transform: 'scale(0.85)' }, children: _jsx(IPhoneMockup, { width: 320, height: 640, children: _jsx(WhatsAppScreen, { messages: [
                                    {
                                        id: '1',
                                        text: 'Hi, I\'m interested in that villa. Can you send more details?',
                                        isIncoming: true,
                                        frameStart: SCENARIO1_FRAMES.start + 20,
                                        frameDuration: 60,
                                    },
                                    {
                                        id: '2',
                                        text: 'Great! Check this out: 3BR Villa, AED 2.5M, golf views. [Link]',
                                        isIncoming: false,
                                        frameStart: SCENARIO1_FRAMES.start + 120,
                                        frameDuration: 120,
                                    },
                                ] }) }) }), _jsx("div", { style: {
                            opacity: responseSpeedOpacity,
                            fontSize: TYPOGRAPHY.SIZES.LG,
                            fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
                            color: WA_GREEN,
                            fontFamily: TYPOGRAPHY.FAMILY,
                            textAlign: 'center',
                        }, children: "\u26A1 Responded in 2 seconds" })] })), frame >= SCENARIO2_FRAMES.start && frame < SCENARIO2_FRAMES.end && (_jsxs("div", { style: {
                    opacity: scenario2Opacity,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 24,
                    flex: 1,
                    paddingLeft: 24,
                    paddingRight: 24,
                }, children: [_jsx("div", { style: { transform: 'scale(0.85)' }, children: _jsx(IPhoneMockup, { width: 320, height: 640, children: _jsx(WhatsAppScreen, { messages: [
                                    {
                                        id: '3',
                                        text: 'Is this available for viewing tomorrow?',
                                        isIncoming: true,
                                        frameStart: SCENARIO2_FRAMES.start + 20,
                                        frameDuration: 60,
                                    },
                                    {
                                        id: '4',
                                        text: 'Absolutely! Available 10am–4pm. [Booking Link]',
                                        isIncoming: false,
                                        frameStart: SCENARIO2_FRAMES.start + 120,
                                        frameDuration: 120,
                                    },
                                ] }) }) }), _jsx("div", { style: {
                            fontSize: TYPOGRAPHY.SIZES.LG,
                            fontWeight: TYPOGRAPHY.WEIGHTS.SEMIBOLD,
                            color: BRAND_COLORS.BLACK,
                            fontFamily: TYPOGRAPHY.FAMILY,
                            textAlign: 'center',
                        }, children: "Different property, same speed." })] })), frame >= IMPACT_FRAMES.start && frame < IMPACT_FRAMES.end && (_jsxs("div", { style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 40,
                    flex: 1,
                    paddingLeft: 32,
                    paddingRight: 32,
                    textAlign: 'center',
                }, children: [_jsx("div", { style: {
                            opacity: impactOpacity1,
                            fontSize: TYPOGRAPHY.SIZES.XXL,
                            fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
                            color: WA_GREEN,
                            fontFamily: TYPOGRAPHY.FAMILY,
                        }, children: "No more delays." }), _jsx("div", { style: {
                            opacity: impactOpacity2,
                            fontSize: TYPOGRAPHY.SIZES.XXL,
                            fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
                            color: WA_GREEN,
                            fontFamily: TYPOGRAPHY.FAMILY,
                        }, children: "No more lost leads." })] })), frame >= CTA_FRAMES.start && frame < CTA_FRAMES.end && (_jsx("div", { style: {
                    opacity: ctaOpacity,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    flex: 1,
                    paddingBottom: 80,
                }, children: _jsx("div", { style: {
                        fontSize: TYPOGRAPHY.SIZES.XL,
                        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
                        color: WA_GREEN,
                        fontFamily: TYPOGRAPHY.FAMILY,
                        textAlign: 'center',
                    }, children: "Contact us for setup" }) }))] }));
};
//# sourceMappingURL=Reel2_WhatsAppAuto.js.map