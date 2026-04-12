import { jsx as _jsx } from "react/jsx-runtime";
import { useCurrentFrame, interpolate } from 'remotion';
export const TextReveal = ({ text, startFrame, endFrame, fontSize, fontWeight, color, fontFamily, }) => {
    const currentFrame = useCurrentFrame();
    // Calculate progress from 0 to 1
    const progress = interpolate(currentFrame, [startFrame, endFrame], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    // Calculate how many characters to show
    const visibleCharCount = Math.round(progress * text.length);
    const visibleText = text.substring(0, visibleCharCount);
    return (_jsx("div", { style: {
            fontSize,
            fontWeight,
            color,
            fontFamily,
            lineHeight: 1.2,
            letterSpacing: '0.02em',
        }, children: visibleText }));
};
//# sourceMappingURL=TextReveal.js.map