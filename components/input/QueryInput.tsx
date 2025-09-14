'use client';

import React from 'react';

interface QueryInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * 用户查询输入组件 - 对应原型图上方输入框
 */
export default function QueryInput({ value, onChange, placeholder = "输入...", disabled = false }: QueryInputProps) {
  return (
    <div className="query-input-container">
      <label className="block text-sm font-semibold text-gray-800 mb-3">
        用户输入
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full h-20 px-4 py-3 bg-white border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200 shadow-sm hover:border-gray-300"
        style={{
          fontSize: '14px',
          lineHeight: '1.6',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      />
    </div>
  );
}