# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "京言 (Jingyan)" - a frontend rendering tool designed to convert DeepResearch project's Markdown output into high-fidelity mobile preview pages that match the production frontend design exactly. The tool eliminates the manual design process by automatically rendering Markdown content using existing SVG design sources.

## Architecture

- **Framework**: Next.js 15.5.3 with Turbopack enabled
- **TypeScript**: Full TypeScript support with React 19.1.0
- **Styling**: Tailwind CSS v4 with PostCSS
- **App Router**: Uses Next.js app directory structure

## Key Components Structure

```
app/
├── layout.tsx          # Root layout with Geist fonts
├── page.tsx           # Main homepage (currently default Next.js template)
└── globals.css        # Global styles

docs/
├── PRD.md            # Product Requirements Document (Chinese)
├── svg.txt           # Core SVG design source file (1.3MB)
└── image.png         # Product prototype mockup

public/
├── 单屏.png           # Single screen reference
└── 全屏.png           # Full screen reference
```

## Core Design Sources

- **`docs/svg.txt`**: 1.3MB SVG file containing the complete mobile UI design (374x2250px). This is the source of truth for all component styles, gradients, filters, and layout specifications.
- **`docs/image.png`**: Product wireframe showing the dual-panel layout (left: input areas, right: mobile preview)
- **Reference screenshots**: `public/单屏.png` and `public/全屏.png` for final visual standards

## Development Commands

```bash
# Development with Turbopack (faster builds)
npm run dev

# Production build with Turbopack
npm run build

# Start production server
npm run start

# Linting
npm run lint
```

## Development Context

The application needs to implement:

1. **Dual Input Panel**: 
   - User query input (top)
   - Markdown content input (bottom)

2. **Mobile Preview Renderer**:
   - Real-time markdown parsing and rendering
   - SVG-based styling that matches the design exactly
   - Mobile frame simulation

3. **Performance Optimization**:
   - Debounced input handling for real-time preview
   - Efficient SVG rendering without re-parsing

## Technical Implementation Notes

- Use `react-markdown` for markdown parsing
- Extract styling rules from the large SVG file in `docs/svg.txt`
- Implement debounced real-time preview (300ms recommended)
- No backend/sharing functionality needed (simplified architecture)
- Focus on matching the exact visual output shown in reference images