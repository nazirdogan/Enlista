import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BRAND_COLORS } from '../shared/BrandColors';
export const iPhoneMockup = ({ children, width = 320, height = 640, }) => {
    return (_jsxs("div", { style: {
            position: 'relative',
            width,
            height,
            backgroundColor: BRAND_COLORS.BLACK,
            borderRadius: 40,
            border: `12px solid ${BRAND_COLORS.BLACK}`,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }, children: [_jsx("div", { style: {
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 150,
                    height: 28,
                    backgroundColor: BRAND_COLORS.BLACK,
                    borderRadius: '0 0 40px 40px',
                    zIndex: 10,
                } }), _jsx("div", { style: {
                    width: '100%',
                    height: '100%',
                    backgroundColor: BRAND_COLORS.WHITE,
                    overflow: 'hidden',
                }, children: children })] }));
};
//# sourceMappingURL=iPhoneMockup.js.map