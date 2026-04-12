import React from 'react';
import { BRAND_COLORS } from '../shared/BrandColors';
import { TYPOGRAPHY } from '../shared/Typography';

interface SplitScreenLayoutProps {
  leftChild: React.ReactNode;
  rightChild: React.ReactNode;
  leftBgColor?: string;
  rightBgColor?: string;
}

export const SplitScreenLayout: React.FC<SplitScreenLayoutProps> = ({
  leftChild,
  rightChild,
  leftBgColor = BRAND_COLORS.WHITE,
  rightBgColor = BRAND_COLORS.WHITE,
}) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        fontFamily: TYPOGRAPHY.FAMILY,
      }}
    >
      {/* Left Side */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: leftBgColor,
          padding: '40px 20px',
        }}
      >
        {leftChild}
      </div>

      {/* Right Side */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: rightBgColor,
          padding: '40px 20px',
        }}
      >
        {rightChild}
      </div>
    </div>
  );
};
