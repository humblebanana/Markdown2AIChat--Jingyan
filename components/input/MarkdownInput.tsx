'use client';

import React from 'react';

interface MarkdownInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Markdown内容输入组件 - 对应原型图下方的大输入框
 */
export default function MarkdownInput({ 
  value, 
  onChange, 
  placeholder = "粘贴Markdown内容...", 
  disabled = false 
}: MarkdownInputProps) {
  return (
    <div className="markdown-input-container">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-semibold text-gray-800">
          Markdown内容
        </label>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
          支持标准语法
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full min-h-96 h-[28rem] px-4 py-3 bg-white border border-gray-200 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 disabled:bg-gray-50 disabled:text-gray-500 font-mono transition-all duration-200 shadow-sm hover:border-gray-300"
        style={{
          fontSize: '13px',
          lineHeight: '1.5',
          fontFamily: 'JetBrains Mono, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
        }}
      />
      {/* 字符统计 */}
      <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <span>{value.length} 字符</span>
          <span>{value.split('\n').length} 行</span>
        </div>
        <div className="text-gray-400">
          实时预览
        </div>
      </div>
    </div>
  );
}
