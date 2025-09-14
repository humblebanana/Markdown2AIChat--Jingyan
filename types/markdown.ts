/**
 * Markdown相关类型定义
 */

export interface MarkdownContent {
  raw: string;
  parsed: MarkdownElement[];
}

export interface MarkdownElement {
  id: string;
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'ul' | 'ol' | 'table' | 'blockquote' | 'code';
  content: string;
  children?: MarkdownElement[];
  metadata?: {
    level?: number; // for headings
    ordered?: boolean; // for lists
    columns?: string[]; // for tables
    rows?: string[][]; // for tables
  };
}

export interface RenderedElement {
  id: string;
  type: string;
  content: string;
  component: React.ReactNode;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
  };
  targetArea: string;
  children?: RenderedElement[];
}

export interface MarkdownRenderOptions {
  maxWidth?: number;
  maxHeight?: number;
  enableTableRendering?: boolean;
  enableListFormatting?: boolean;
}

export interface ParsedMarkdown {
  elements: MarkdownElement[];
  wordCount: number;
  readingTime: number; // in minutes
}