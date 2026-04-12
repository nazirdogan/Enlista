import { jsx as _jsx } from "react/jsx-runtime";
import { useCurrentFrame, interpolate } from 'remotion';
export const CardSlideIn = ({ children, startFrame, endFrame, direction, distance, }) => {
    const currentFrame = useCurrentFrame();
    // Calculate progress from 0 to 1
    const progress = interpolate(currentFrame, [startFrame, endFrame], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    // Calculate opacity with slight delay (starts fading in at 20% of animation)
    const opacity = Math.max(0, (progress - 0.1) / 0.9);
    // Calculate translate based on direction
    let translateX = 0;
    let translateY = 0;
    if (direction === 'left') {
        translateX = interpolate(progress, [0, 1], [-distance, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
        });
    }
    else if (direction === 'right') {
        translateX = interpolate(progress, [0, 1], [distance, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
        });
    }
    else if (direction === 'top') {
        translateY = interpolate(progress, [0, 1], [-distance, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
        });
    }
    else if (direction === 'bottom') {
        translateY = interpolate(progress, [0, 1], [distance, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
        });
    }
    return (_jsx("div", { style: {
            transform: `translate(${translateX}px, ${translateY}px)`,
            opacity,
            transition: 'none',
        }, children: children }));
};
//# sourceMappingURL=CardSlideIn.js.map