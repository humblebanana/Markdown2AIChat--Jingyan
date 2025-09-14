/**
 * 防抖Hook - 用于优化实时预览性能
 */

import { useState, useEffect } from 'react';

/**
 * 防抖Hook - 延迟处理频繁变化的值
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 防抖回调Hook - 延迟执行函数
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): [T, () => void] {
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const debouncedCallback = ((...args: Parameters<T>) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      callback(...args);
      setDebounceTimer(null);
    }, delay);

    setDebounceTimer(timer);
  }) as T;

  const cancelDebounce = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      setDebounceTimer(null);
    }
  };

  return [debouncedCallback, cancelDebounce];
}

/**
 * 防抖状态Hook - 结合状态管理和防抖
 */
export function useDebouncedState<T>(
  initialValue: T,
  delay: number
): [T, T, (value: T) => void, boolean] {
  const [immediateValue, setImmediateValue] = useState<T>(initialValue);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const debouncedValue = useDebouncedValue(immediateValue, delay);

  const setValue = (value: T) => {
    setIsDebouncing(true);
    setImmediateValue(value);
  };

  useEffect(() => {
    if (immediateValue !== debouncedValue) {
      setIsDebouncing(true);
    } else {
      setIsDebouncing(false);
    }
  }, [immediateValue, debouncedValue]);

  return [immediateValue, debouncedValue, setValue, isDebouncing];
}