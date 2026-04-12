import { jsx as _jsx } from "react/jsx-runtime";
import { useCurrentFrame, interpolate } from 'remotion';
export const IconCheckmark = ({ startFrame, endFrame, size, color, }) => {
    const currentFrame = useCurrentFrame();
    // Calculate overall progress from 0 to 1
    const progress = interpolate(currentFrame, [startFrame, endFrame], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    // Scale animation: 0 -> 1.2 (bounce) -> 1
    let scale;
    if (progress < 0.3) {
        // First 30%: scale from 0.3 to 1.2 (bounce)
        scale = interpolate(progress, [0, 0.3], [0.3, 1.2], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
        });
    }
    else {
        // After 30%: scale from 1.2 to 1 (settle)
        scale = interpolate(progress, [0.3, 1], [1.2, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
        });
    }
    // Opacity: 0 to 1
    const opacity = interpolate(progress, [0, 0.1], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    return (_jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", style: {
            transform: `scale(${scale})`,
            opacity,
            transformOrigin: 'center',
        }, children: _jsx("polyline", { points: "20 6 9 17 4 12" }) }));
};
//# sourceMappingURL=IconCheckmark.js.map