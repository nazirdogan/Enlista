import { jsx as _jsx } from "react/jsx-runtime";
import { BRAND_COLORS } from '../shared/BrandColors';
import { TYPOGRAPHY } from '../shared/Typography';
export const InstagramFrame = ({ children, backgroundColor = BRAND_COLORS.WHITE, safeAreaPadding = 0, }) => {
    return (_jsx("div", { style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor,
            fontFamily: TYPOGRAPHY.FAMILY,
            padding: safeAreaPadding,
        }, children: children }));
};
//# sourceMappingURL=InstagramFrame.js.map