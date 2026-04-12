import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

interface CounterAnimationProps {
  startValue: number;
  endValue: number;
  startFrame: number;
  endFrame: number;
  format: (value: number) => string;
  fontSize: number;
  color: string;
  fontFamily: string;
  fontWeight: number;
}

export const CounterAnimation: React.FC<CounterAnimationProps> = ({
  startValue,
  endValue,
  startFrame,
  endFrame,
  format,
  fontSize,
  color,
  fontFamily,
  fontWeight,
}) => {
  const currentFrame = useCurrentFrame();

  // Interpolate from startValue to endValue
  const currentValue = interpolate(
    currentFrame,
    [startFrame, endFrame],
    [startValue, endValue],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Round the value for cleaner display
  const roundedValue = Math.round(currentValue);
  const formattedValue = format(roundedValue);

  return (
    <div
      style={{
        fontSize,
        color,
        fontFamily,
        fontWeight,
        lineHeight: 1.2,
        letterSpacing: '0.02em',
      }}
    >
      {formattedValue}
    </div>
  );
};
