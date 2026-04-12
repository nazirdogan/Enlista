export const CONFIG = {
    // API Configuration
    ELEVEN_LABS_API_KEY: process.env.ELEVEN_LABS_API_KEY || '',
    ELEVEN_LABS_VOICE_ID: 'Rachel',
    // Video Configuration
    VIDEO_WIDTH: 1080,
    VIDEO_HEIGHT: 1920,
    FPS: 30,
    // Reel Durations (in frames)
    REEL1_DURATION: 35 * 30,
    REEL2_DURATION: 40 * 30,
    REEL3_DURATION: 38 * 30,
    REEL4_DURATION: 42 * 30,
    // Brand Colors
    COLORS: {
        BLUE: '#0066FF',
        GREEN: '#00CC66',
        AMBER: '#FFB800',
        RED: '#FF3333',
        WHITE: '#FFFFFF',
        BLACK: '#000000',
        MUTED: '#666666',
    },
    // Typography
    FONTS: {
        SIZES: {
            XS: 12,
            SM: 14,
            BASE: 16,
            LG: 20,
            XL: 24,
            '2XL': 32,
            '3XL': 40,
            '4XL': 48,
        },
        WEIGHTS: {
            REGULAR: 400,
            MEDIUM: 500,
            SEMIBOLD: 600,
            BOLD: 700,
            EXTRABOLD: 800,
        },
    },
};
//# sourceMappingURL=config.js.map