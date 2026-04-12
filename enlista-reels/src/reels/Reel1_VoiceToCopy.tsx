import React from 'react';
import { useCurrentFrame, interpolate, Audio } from 'remotion';
import { InstagramFrame } from '../components/layouts/InstagramFrame';
import { TextReveal } from '../components/animations/TextReveal';
import { CardSlideIn } from '../components/animations/CardSlideIn';
import { IconCheckmark } from '../components/animations/IconCheckmark';
import { BRAND_COLORS, TYPOGRAPHY } from '../components/shared';
import { CONFIG } from '../config';
import reel1Audio from '../assets/audio/reel1_voice.mp3';

// Frame timing constants (35 seconds at 30 FPS = 1050 total frames)
const OPEN_FRAMES = { start: 0, end: 90 };
const VOICE_FRAMES = { start: 90, end: 360 };
const GENERATION_FRAMES = { start: 360, end: 750 };
const MULTI_CHANNEL_FRAMES = { start: 750, end: 960 };
const CTA_FRAMES = { start: 960, end: 1050 };

// Sample content for display
const TRANSCRIBED_TEXT =
  'This stunning three-bedroom villa in Arabian Ranches offers luxury living at its finest...';

const ENGLISH_PROPERTY = {
  title: 'Luxury Villa - Arabian Ranches',
  description: 'Stunning three-bedroom villa with modern amenities',
};

const ARABIC_PROPERTY = {
  title: 'فيلا فاخرة - رانشيز العربية',
  description: 'فيلا أنيقة مع مرافق حديثة',
};

const PLATFORMS = [
  { name: 'Bayut', color: BRAND_COLORS.BLUE },
  { name: 'Dubizzle', color: BRAND_COLORS.GREEN },
  { name: 'Instagram', color: BRAND_COLORS.AMBER },
  { name: 'WhatsApp', color: BRAND_COLORS.GREEN },
];

export const Reel1VoiceToCopy: React.FC = () => {
  const frame = useCurrentFrame();

  // Section 1: Opening - Microphone button with pulsing glow
  const openingOpacity = interpolate(frame, [OPEN_FRAMES.start, OPEN_FRAMES.end - 10], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const microphoneScale = 1 + 0.1 * Math.sin((frame - OPEN_FRAMES.start) * 0.05);
  const glowOpacity = 0.3 + 0.2 * Math.sin((frame - OPEN_FRAMES.start) * 0.05);

  // Section 2: Voice input - Text reveal
  const voiceOpacity = interpolate(frame, [VOICE_FRAMES.start, VOICE_FRAMES.start + 20, VOICE_FRAMES.end - 20, VOICE_FRAMES.end], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Section 3: Generation - Cards sliding in
  const englishCardOpacity = interpolate(frame, [GENERATION_FRAMES.start, GENERATION_FRAMES.start + 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const arabicCardOpacity = interpolate(frame, [GENERATION_FRAMES.start + 120, GENERATION_FRAMES.start + 140], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Section 4: Multi-channel ready
  const multiChannelOpacity = interpolate(frame, [MULTI_CHANNEL_FRAMES.start, MULTI_CHANNEL_FRAMES.start + 20, MULTI_CHANNEL_FRAMES.end - 20, MULTI_CHANNEL_FRAMES.end], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Section 5: CTA
  const ctaOpacity = interpolate(frame, [CTA_FRAMES.start, CTA_FRAMES.start + 10, CTA_FRAMES.end], [0, 1, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <>
      <Audio src={reel1Audio} />
      <InstagramFrame backgroundColor={BRAND_COLORS.WHITE}>
        {/* Section 1: Opening (0–90 frames) */}
        {frame < OPEN_FRAMES.end && (
          <div style={{ opacity: openingOpacity, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            {/* Microphone glow effect */}
            <div
              style={{
                position: 'relative',
                width: 120,
                height: 120,
                marginBottom: 40,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  backgroundColor: BRAND_COLORS.BLUE,
                  opacity: glowOpacity,
                  filter: 'blur(20px)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  backgroundColor: BRAND_COLORS.BLUE,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `scale(${microphoneScale})`,
                }}
              >
                <svg width={60} height={60} viewBox="0 0 24 24" fill="white">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 16.91c-1.48 1.45-3.47 2.33-5.7 2.33-2.24 0-4.23-.88-5.7-2.33M19 12h2c0 2.96-1.48 5.6-3.74 7.21l1.41 1.41C21.5 19.54 23 16.54 23 13v-1h-2v-2z" />
                </svg>
              </div>
            </div>

            {/* "Say it once." text */}
            <div
              style={{
                fontSize: TYPOGRAPHY.SIZES.XXL,
                fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
                color: BRAND_COLORS.BLACK,
                fontFamily: TYPOGRAPHY.FAMILY,
                textAlign: 'center',
              }}
            >
              Say it once.
            </div>
          </div>
        )}

        {/* Section 2: Voice Input (90–360 frames) */}
        {frame < VOICE_FRAMES.end && frame >= VOICE_FRAMES.start && (
          <div
            style={{
              opacity: voiceOpacity,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              paddingLeft: 32,
              paddingRight: 32,
              textAlign: 'center',
            }}
          >
            {/* Listening indicator */}
            <div
              style={{
                fontSize: TYPOGRAPHY.SIZES.LG,
                fontWeight: TYPOGRAPHY.WEIGHTS.SEMIBOLD,
                color: BRAND_COLORS.BLUE,
                fontFamily: TYPOGRAPHY.FAMILY,
                marginBottom: 32,
              }}
            >
              🎤 Listening...
            </div>

            {/* Text reveal of transcription */}
            <TextReveal
              text={TRANSCRIBED_TEXT}
              startFrame={VOICE_FRAMES.start}
              endFrame={VOICE_FRAMES.end - 60}
              fontSize={TYPOGRAPHY.SIZES.LG}
              fontWeight={TYPOGRAPHY.WEIGHTS.REGULAR}
              color={BRAND_COLORS.BLACK}
              fontFamily={TYPOGRAPHY.FAMILY}
            />
          </div>
        )}

        {/* Section 3: Generation Phase (360–750 frames) */}
        {frame >= GENERATION_FRAMES.start && frame < GENERATION_FRAMES.end && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 32,
              paddingLeft: 24,
              paddingRight: 24,
            }}
          >
            {/* English Card */}
            <CardSlideIn startFrame={GENERATION_FRAMES.start} endFrame={GENERATION_FRAMES.start + 90} direction="left" distance={200}>
              <div
                style={{
                  opacity: englishCardOpacity,
                  backgroundColor: BRAND_COLORS.BLUE_TINT,
                  borderLeft: `4px solid ${BRAND_COLORS.BLUE}`,
                  borderRadius: 12,
                  padding: 20,
                  width: '100%',
                  maxWidth: 300,
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    fontSize: TYPOGRAPHY.SIZES.LG,
                    fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
                    color: BRAND_COLORS.BLACK,
                    fontFamily: TYPOGRAPHY.FAMILY,
                    marginBottom: 12,
                    paddingRight: 40,
                  }}
                >
                  {ENGLISH_PROPERTY.title}
                </div>
                <div
                  style={{
                    fontSize: TYPOGRAPHY.SIZES.BASE,
                    fontWeight: TYPOGRAPHY.WEIGHTS.REGULAR,
                    color: BRAND_COLORS.MUTED,
                    fontFamily: TYPOGRAPHY.FAMILY,
                    marginBottom: 12,
                  }}
                >
                  {ENGLISH_PROPERTY.description}
                </div>
                {/* Checkmark on English card */}
                <div style={{ position: 'absolute', top: 20, right: 20 }}>
                  <IconCheckmark startFrame={GENERATION_FRAMES.start + 90} endFrame={GENERATION_FRAMES.start + 120} size={24} color={BRAND_COLORS.BLUE} />
                </div>
              </div>
            </CardSlideIn>

            {/* Arabic Card */}
            <CardSlideIn startFrame={GENERATION_FRAMES.start + 120} endFrame={GENERATION_FRAMES.start + 210} direction="right" distance={200}>
              <div
                style={{
                  opacity: arabicCardOpacity,
                  backgroundColor: BRAND_COLORS.GREEN_TINT,
                  borderLeft: `4px solid ${BRAND_COLORS.GREEN}`,
                  borderRadius: 12,
                  padding: 20,
                  width: '100%',
                  maxWidth: 300,
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    fontSize: TYPOGRAPHY.SIZES.LG,
                    fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
                    color: BRAND_COLORS.BLACK,
                    fontFamily: TYPOGRAPHY.FAMILY,
                    marginBottom: 12,
                    paddingRight: 40,
                    textAlign: 'right',
                    direction: 'rtl',
                  }}
                >
                  {ARABIC_PROPERTY.title}
                </div>
                <div
                  style={{
                    fontSize: TYPOGRAPHY.SIZES.BASE,
                    fontWeight: TYPOGRAPHY.WEIGHTS.REGULAR,
                    color: BRAND_COLORS.MUTED,
                    fontFamily: TYPOGRAPHY.FAMILY,
                    marginBottom: 12,
                    textAlign: 'right',
                    direction: 'rtl',
                  }}
                >
                  {ARABIC_PROPERTY.description}
                </div>
                {/* Checkmark on Arabic card */}
                <div style={{ position: 'absolute', top: 20, right: 20 }}>
                  <IconCheckmark startFrame={GENERATION_FRAMES.start + 210} endFrame={GENERATION_FRAMES.start + 240} size={24} color={BRAND_COLORS.GREEN} />
                </div>
              </div>
            </CardSlideIn>
          </div>
        )}

        {/* Section 4: Multi-Channel Ready (750–960 frames) */}
        {frame >= MULTI_CHANNEL_FRAMES.start && frame < MULTI_CHANNEL_FRAMES.end && (
          <div
            style={{
              opacity: multiChannelOpacity,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 20,
              paddingLeft: 24,
              paddingRight: 24,
            }}
          >
            <div
              style={{
                fontSize: TYPOGRAPHY.SIZES.XL,
                fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
                color: BRAND_COLORS.BLACK,
                fontFamily: TYPOGRAPHY.FAMILY,
                marginBottom: 20,
              }}
            >
              Ready for:
            </div>

            {/* 2x2 Grid of platforms */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
                width: '100%',
                maxWidth: 280,
              }}
            >
              {PLATFORMS.map((platform, index) => {
                const platformStartFrame = MULTI_CHANNEL_FRAMES.start + index * 30;
                const platformEndFrame = platformStartFrame + 30;
                const platformOpacity = interpolate(frame, [platformStartFrame, platformEndFrame], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                });

                return (
                  <div
                    key={platform.name}
                    style={{
                      opacity: platformOpacity,
                      backgroundColor: BRAND_COLORS.LIGHT_BG,
                      borderRadius: 12,
                      padding: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                      border: `2px solid ${platform.color}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: TYPOGRAPHY.SIZES.BASE,
                        fontWeight: TYPOGRAPHY.WEIGHTS.SEMIBOLD,
                        color: BRAND_COLORS.BLACK,
                        fontFamily: TYPOGRAPHY.FAMILY,
                      }}
                    >
                      {platform.name}
                    </div>
                    <IconCheckmark startFrame={platformEndFrame - 10} endFrame={platformEndFrame + 10} size={20} color={platform.color} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 5: CTA (960–1050 frames) */}
        {frame >= CTA_FRAMES.start && frame < CTA_FRAMES.end && (
          <div
            style={{
              opacity: ctaOpacity,
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
              paddingBottom: 60,
            }}
          >
            <div
              style={{
                fontSize: TYPOGRAPHY.SIZES.XL,
                fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
                color: BRAND_COLORS.BLUE,
                fontFamily: TYPOGRAPHY.FAMILY,
                textAlign: 'center',
              }}
            >
              Try free at enlista.ai
            </div>
          </div>
        )}
      </InstagramFrame>
    </>
  );
};
