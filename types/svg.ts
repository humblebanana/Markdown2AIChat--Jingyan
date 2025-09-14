/**
 * SVG相关类型定义
 */

export interface SVGViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SVGDefinitions {
  clipPaths: Record<string, string>;
  gradients: Record<string, string>;
  filters: Record<string, string>;
}

export interface SVGData {
  content: string;
  viewBox: SVGViewBox;
  definitions: SVGDefinitions;
}

export interface ContentArea {
  id: string;
  name: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  type: 'header' | 'content' | 'list' | 'table' | 'footer';
}

export interface SVGComponentProps {
  svgData: SVGData;
  className?: string;
  style?: React.CSSProperties;
}

export interface ContentOverlayProps {
  contentAreas: ContentArea[];
  renderedContent: Record<string, React.ReactNode>;
}