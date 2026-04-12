import { jsx as _jsx } from "react/jsx-runtime";
import { useCurrentFrame, interpolate } from 'remotion';
export const CounterAnimation = ({ startValue, endValue, startFrame, endFrame, format, fontSize, color, fontFamily, fontWeight, }) => {
    const currentFrame = useCurrentFrame();
    // Interpolate from startValue to endValue
    const currentValue = interpolate(currentFrame, [startFrame, endFrame], [startValue, endValue], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    // Round the value for cleaner display
    const roundedValue = Math.round(currentValue);
    const formattedValue = format(roundedValue);
    return (_jsx("div", { style: {
            fontSize,
            color,
            fontFamily,
            fontWeight,
            lineHeight: 1.2,
            letterSpacing: '0.02em',
        }, children: formattedValue }));
};
//# sourceMappingURL=CounterAnimation.js.map