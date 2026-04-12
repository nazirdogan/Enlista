import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BRAND_COLORS } from '../shared/BrandColors';
import { TYPOGRAPHY } from '../shared/Typography';
export const SplitScreenLayout = ({ leftChild, rightChild, leftBgColor = BRAND_COLORS.WHITE, rightBgColor = BRAND_COLORS.WHITE, }) => {
    return (_jsxs("div", { style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            fontFamily: TYPOGRAPHY.FAMILY,
        }, children: [_jsx("div", { style: {
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: leftBgColor,
                    padding: '40px 20px',
                }, children: leftChild }), _jsx("div", { style: {
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: rightBgColor,
                    padding: '40px 20px',
                }, children: rightChild })] }));
};
//# sourceMappingURL=SplitScreenLayout.js.map