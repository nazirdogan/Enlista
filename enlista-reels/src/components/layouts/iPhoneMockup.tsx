import React from 'react';
import { BRAND_COLORS } from '../shared/BrandColors';

interface iPhoneMockupProps {
  children: React.ReactNode;
  width?: number;
  height?: number;
}

export const iPhoneMockup: React.FC<iPhoneMockupProps> = ({
  children,
  width = 320,
  height = 640,
}) => {
  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        backgroundColor: BRAND_COLORS.BLACK,
        borderRadius: 40,
        border: `12px solid ${BRAND_COLORS.BLACK}`,
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Notch */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 150,
          height: 28,
          backgroundColor: BRAND_COLORS.BLACK,
          borderRadius: '0 0 40px 40px',
          zIndex: 10,
        }}
      />

      {/* Screen Content Area */}
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: BRAND_COLORS.WHITE,
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
};
