import React from 'react';
import { BRAND_COLORS } from '../shared/BrandColors';
import { TYPOGRAPHY } from '../shared/Typography';

interface InstagramFrameProps {
  children: React.ReactNode;
  backgroundColor?: string;
  safeAreaPadding?: number;
}

export const InstagramFrame: React.FC<InstagramFrameProps> = ({
  children,
  backgroundColor = BRAND_COLORS.WHITE,
  safeAreaPadding = 0,
}) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor,
        fontFamily: TYPOGRAPHY.FAMILY,
        padding: safeAreaPadding,
      }}
    >
      {children}
    </div>
  );
};
