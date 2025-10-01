'use client';

import React, { useState } from 'react';
import QueryInput from './QueryInput';
import MarkdownInput from './MarkdownInput';

interface InputPanelProps {
  queryValue: string;
  markdownValue: string;
  onQueryChange: (value: string) => void;
  onMarkdownChange: (value: string) => void;
  isProcessing?: boolean;
  showSidebar?: boolean;
  onToggleSidebar?: () => void;
  productImageMode?: 'mock' | 'shimmer';
  onProductImageModeChange?: (mode: 'mock' | 'shimmer') => void;
}

/**
 * 输入面板容器 - 包含查询输入和Markdown输入
 * 对应原型图左侧的双输入面板布局
 */
export default function InputPanel({
  queryValue,
  markdownValue,
  onQueryChange,
  onMarkdownChange,
  isProcessing = false,
  showSidebar = true,
  onToggleSidebar,
  productImageMode = 'mock',
  onProductImageModeChange
}: InputPanelProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  return (
    <div className="input-panel h-full bg-white overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* 标题和侧边栏切换按钮 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col">
            <h2 className="text-base font-semibold text-gray-900 tracking-tight">编辑区域</h2>
          </div>
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-all duration-200"
              title="隐藏侧边栏"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* 查询输入 */}
        <QueryInput
          value={queryValue}
          onChange={onQueryChange}
          disabled={isProcessing}
        />

        {/* 快速测试（重构版） */}
        <QuickTests
          onSelect={(presetId) => setSelectedPreset(presetId)}
          selectedId={selectedPreset}
          onApply={(payload) => {
            onMarkdownChange(payload.content);
            onQueryChange(payload.title);
          }}
        />

        {/* 商品卡片图片显示模式切换 */}
        {onProductImageModeChange && (
          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-800">商品卡片图片模式</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onProductImageModeChange('mock')}
                className={`px-3 py-2 text-[13px] rounded-md border transition-colors duration-150 ${
                  productImageMode === 'mock'
                    ? 'border-gray-300 bg-gray-50 text-gray-900'
                    : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-start gap-1">
                  <span className="font-medium">模拟图片</span>
                  <span className="text-[11px] text-gray-500">显示随机商品图</span>
                </div>
              </button>
              <button
                onClick={() => onProductImageModeChange('shimmer')}
                className={`px-3 py-2 text-[13px] rounded-md border transition-colors duration-150 ${
                  productImageMode === 'shimmer'
                    ? 'border-gray-300 bg-gray-50 text-gray-900'
                    : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-start gap-1">
                  <span className="font-medium">Shimmer特效</span>
                  <span className="text-[11px] text-gray-500">全部显示加载动画</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Markdown输入 */}
        <MarkdownInput
          value={markdownValue}
          onChange={onMarkdownChange}
          disabled={isProcessing}
        />

        {/* 处理状态指示器 */}
        {isProcessing && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-200 border-t-gray-600"></div>
            <span className="ml-3 text-sm text-gray-600 font-medium">渲染中...</span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 重构后的“快速测试”区块
 */
function QuickTests({
  selectedId,
  onSelect,
  onApply,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onApply: (payload: { title: string; content: string }) => void;
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // 预设用例集合（含远程与内置）
  const presets: Array<{
    id: string;
    title: string;
    subtitle: string;
    type: 'remote' | 'inline';
    source?: string; // remote path
    content?: string; // inline markdown
  }> = [
    {
      id: 'basic',
      title: '基础Markdown测试',
      subtitle: '标题/段落/列表/表格基础元素',
      type: 'remote',
      source: '/test-simple.md',
    },
    {
      id: 'ipad',
      title: '数字绘画二手 iPad 推荐',
      subtitle: '长文结构 + 列表/图片占位',
      type: 'remote',
      source: '/test-ipad.md',
    },
    {
      id: 'pants',
      title: '笔记本电脑推荐',
      subtitle: '多场景笔记本推荐 + 商品卡片',
      type: 'inline',
      content: `根据您的需求，我为您精选了几款不同定位的笔记本电脑，您可以根据主要用途来选择：

## 轻薄办公本（适合日常办公、学习）

联想异能者P15H：15.6英寸大屏，16G+512G配置，仅1.7kg重，接口齐全，适合基础办公学习

[product:1]

惠普锐15：AMD锐龙处理器，16G+512G，国家补贴后仅2999元，性价比极高

[product:5]

## 高性能全能本（适合设计、剪辑等专业需求）

联想小新16高配版：13代i5处理器，24G大内存+512G，16:10黄金比例屏幕

[product:6]

## 游戏本（适合大型游戏、3D渲染）

拯救者Y7000P：i7处理器+RTX4060显卡，165Hz高刷屏，专业电竞配置

[product:2]

拯救者Y9000P：i7-14650H+RTX5060，180Hz高刷屏，专业级性能

[product:4]

您对笔记本电脑的主要用途是什么？<ClickText>日常办公</ClickText>，<ClickText>游戏娱乐</ClickText>，<ClickText>设计创作</ClickText>，<ClickText>学习上网</ClickText>，<ClickText>商务出差</ClickText>`,
    },
    {
      id: 'laptop',
      title: '高性能笔记本推荐',
      subtitle: '三机型对比 + 表格',
      type: 'inline',
      content: `根据您的需求，我为您精选了几款不同定位的笔记本电脑，您可以根据主要用途来选择：

## 轻薄办公本（适合日常办公、学习）

联想异能者P15H：15.6英寸大屏，16G+512G配置，仅1.7kg重，接口齐全，适合基础办公学习

[product:1]

惠普锐15：AMD锐龙处理器，16G+512G，国家补贴后仅2999元，性价比极高

[product:5]

## 高性能全能本（适合设计、剪辑等专业需求）

联想小新16高配版：13代i5处理器，24G大内存+512G，16:10黄金比例屏幕

[product:6]

## 游戏本（适合大型游戏、3D渲染）

拯救者Y7000P：i7处理器+RTX4060显卡，165Hz高刷屏，专业电竞配置

[product:2]

拯救者Y9000P：i7-14650H+RTX5060，180Hz高刷屏，专业级性能

[product:4]

您对笔记本电脑的主要用途是什么？<ClickText>日常办公</ClickText>，<ClickText>游戏娱乐</ClickText>，<ClickText>设计创作</ClickText>，<ClickText>学习上网</ClickText>，<ClickText>商务出差</ClickText>`,
    },
  ];

  const handleClick = async (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return;
    onSelect(presetId);

    try {
      setLoadingId(presetId);
      if (preset.type === 'remote' && preset.source) {
        const res = await fetch(preset.source);
        const text = await res.text();
        onApply({ title: preset.title, content: text });
      } else if (preset.type === 'inline' && preset.content) {
        onApply({ title: preset.title, content: preset.content });
      }
    } catch (e) {
      console.error('加载测试预设失败:', e);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-800">快速测试</span>
        <button
          onClick={() => {
            onSelect('');
            onApply({ title: '空白文档', content: '' });
          }}
          className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100 transition"
          title="清空输入"
        >
          清空
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {presets.map((p) => {
          const active = selectedId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handleClick(p.id)}
              aria-pressed={active}
              className={`flex items-center justify-between px-3 py-2 text-[13px] rounded-md border min-h-[40px] transition-colors duration-150 select-none ${
                active
                  ? 'border-gray-300 bg-gray-50 text-gray-900'
                  : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50 hover:border-gray-300'
              }`}
              title={p.subtitle || p.title}
            >
              <span className="flex items-center gap-2 min-w-0">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-[10px] text-gray-700 border border-gray-200 flex-shrink-0">
                  {p.type === 'remote' ? 'R' : 'I'}
                </span>
                <span className="truncate">{p.title}</span>
              </span>
              {loadingId === p.id ? (
                <span className="inline-block w-3 h-3 ml-2 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
              ) : active ? (
                <svg className="w-4 h-4 text-gray-600 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gray-300 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
