import { queuePreFlushCb } from '@vue/runtime-core';
import { EMPTY_OBJ, hasChanged, isObject } from '@vue/shared';
import { ReactiveEffect } from 'packages/reactivity/src/effect';
import { isReactive } from 'packages/reactivity/src/reactive';

export interface WatchOptions<immediate = boolean> {
  deep?: boolean;
  immediate?: immediate;
}

// 监听数据变化
export function watch(source, cb: Function, options?: WatchOptions) {
  return doWatch(source, cb, options);
}

function doWatch(
  source,
  cb: Function,
  { immediate, deep }: WatchOptions = EMPTY_OBJ
) {
  let getter: () => any;

  if (isReactive(source)) {
    getter = () => source;
    // 如果是响应式数据，需要把deep设置为true
    deep = true;
  } else {
    getter = () => {};
  }
  if (cb && deep) {
    const baseGetter = getter;
    // 循环读取对象中的每个属性，触发依赖收集
    getter = () => traverse(baseGetter());
  }

  // 旧数据
  let oldValue = {};

  const job = () => {
    if (cb) {
      // 执行获取新数据
      const newValue = effect.run();
      // 对比数据是否发生了变化
      if (deep || hasChanged(newValue, oldValue)) {
        // 执行回调函数
        cb(newValue, oldValue);
        oldValue = newValue;
      }
    }
  };

  // 使用调度器，来执行任务
  let scheduler = () => queuePreFlushCb(job);

  const effect = new ReactiveEffect(getter, scheduler);

  if (cb) {
    if (immediate) {
      // 立即执行一次
      job();
    } else {
      oldValue = effect.run();
    }
  } else {
    effect.run();
  }

  return () => {
    // 停止监听
    effect.stop();
  };
}

// 循环读取对象中的每个属性值
export function traverse(value: unknown) {
  if (!isObject(value)) {
    return value;
  }

  for (const key in value as object) {
    traverse(value[key]);
  }
  return value;
}
