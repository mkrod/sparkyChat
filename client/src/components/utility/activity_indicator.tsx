import type { CSSProperties, FC, JSX } from 'react'
import "./css/activity_indicator.css";

interface Props {
  color?: CSSProperties['color'];
  size?: 'small' | 'medium' | 'large';
  style?: 'spin' | 'dots' | 'typing';
}
const ActivityIndicator :FC<Props> = ({ color = (("#000") as CSSProperties['color']) , size = 'medium', style = 'dots' }): JSX.Element => {
  const sizeStyles: Record<NonNullable<Props['size']>, CSSProperties> = {
    small: {
      width: '2px',
      height: '2px',
    },
    medium: {
      width: '4px',
      height: '4px',
    },
    large: {
      width: '6px',
      height: '6px',
    },
  };

  const appliedSizeStyle = size ? sizeStyles[size] : {};


    switch(style) {
    case 'spin':
        return (
            <div
            style={{
              backgroundColor: color, ...appliedSizeStyle
            }}
            className='activity_indicator_spin_container'>
            </div>
        );
    case 'dots':
        return (
            <div
            style={{
              color, ...appliedSizeStyle
            }}
            className='activity_indicator_dots_container'>
            </div>
        );
    case 'typing':
        return (
            <div className='activity_indicator_typing_container'>
            </div>
        );
    default:
        return (
            <div
            style={{
              color, ...appliedSizeStyle
            }}
            className='activity_indicator_dots_container'>
            </div>
        );
    }
}

export default ActivityIndicator;