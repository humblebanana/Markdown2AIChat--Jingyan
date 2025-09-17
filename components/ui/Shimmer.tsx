import React from 'react';

interface ShimmerProps {
  /**
   * 宽度 - 可以是像素值或百分比
   */
  width?: string | number;

  /**
   * 高度 - 可以是像素值或百分比
   */
  height?: string | number;

  /**
   * 圆角大小
   */
  borderRadius?: string | number;

  /**
   * 自定义CSS类名
   */
  className?: string;

  /**
   * 是否为矩形形状（默认为true）
   */
  isRectangle?: boolean;
}

/**
 * Shimmer占位符组件 - 骨架屏加载效果
 * 用于在内容加载时显示优雅的占位动画
 */
export default function Shimmer({
  width = '100%',
  height = '200px',
  borderRadius = '8px',
  className = '',
  isRectangle = true
}: ShimmerProps) {

  const shimmerStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
  };

  return (
    <div
      className={`shimmer-container ${className}`}
      style={shimmerStyle}
    >
      <div className="shimmer-animation" />

      <style jsx>{`
        .shimmer-container {
          position: relative;
          background: linear-gradient(90deg, #f3f4f6 25%, transparent 50%, #f3f4f6 75%);
          background-size: 200% 100%;
          overflow: hidden;
        }

        .shimmer-animation {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          animation: shimmer 1.5s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% {
            left: -100%;
          }
          50% {
            left: 100%;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>
    </div>
  );
}