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
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
            支持标准语法
          </span>
          {/* 帮助：商品卡片格式说明 */}
          <div className="relative group" aria-label="商品卡片格式帮助">
            <div
              className="w-5 h-5 rounded-full bg-gray-100 border border-gray-300 text-gray-600 flex items-center justify-center text-[12px] cursor-default select-none"
              title="商品卡片渲染格式"
            >
              ?
            </div>
            {/* Tooltip */}
            <div
              className="absolute right-0 top-full mt-2 w-[520px] max-w-[92vw] hidden group-hover:block group-focus-within:block z-50"
            >
              <div className="rounded-md border border-gray-200 shadow-xl bg-white p-3 text-[12px] leading-5 text-gray-700 max-h-[70vh] overflow-auto break-words">
                <div className="font-semibold text-gray-900 mb-1">商品卡片渲染格式</div>
                <div className="space-y-1">
                  <div>支持在 Markdown 中插入商品卡片：</div>
                  <div className="space-y-1">
                    <span className="text-gray-500">完整格式：</span>
                    <div className="font-mono text-[11px] bg-gray-50 px-2 py-1 rounded break-all whitespace-pre-wrap">
                      {`[sku_name](<sku_id>sku_id</sku_id>)[price][img_url]`}
                    </div>
                  </div>
                  <div className="text-gray-600">说明：<span className="text-gray-500">price 和 img_url 可选</span></div>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      仅 SKU：
                      <div className="font-mono text-[11px] bg-gray-50 px-2 py-1 rounded break-all whitespace-pre-wrap inline-block mt-0.5">{`[标题](<sku_id>10147798291074</sku_id>)`}</div>
                    </li>
                    <li>
                      带价格：
                      <div className="font-mono text-[11px] bg-gray-50 px-2 py-1 rounded break-all whitespace-pre-wrap inline-block mt-0.5">{`[标题](<sku_id>10147798291074</sku_id>)[¥3999]`}</div>
                    </li>
                    <li>
                      带价格和图片：
                      <div className="font-mono text-[11px] bg-gray-50 px-2 py-1 rounded break-all whitespace-pre-wrap inline-block mt-0.5">
                        {`[iPad Air 4](<sku_id>10147798291074</sku_id>)[3999][https://img13.360buyimg.com/n1/jfs/t1/100840/35/29773/163491/62949eeeE449ab513/2cf9c84c0ce30292.jpg]`}
                      </div>
                    </li>
                  </ul>
                  <div className="text-gray-500 mt-1">
                    价格示例：{`¥299 / 299元 / $29.99`}; 未提供图片时会自动使用稳定随机图。
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
