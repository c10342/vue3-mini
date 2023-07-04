import { isArray } from '@vue/shared';
import { Dep, createDep } from './dep';

/**
 * 收集所有依赖的 WeakMap 实例：
 * 1. `key`：响应性对象
 * 2. `value`：`Map` 对象
 * 		1. `key`：响应性对象的指定属性
 * 		2. `value`：指定对象的指定属性的 执行函数
 */
type KeyToDepMap = Map<any, Dep>;
const targetMap = new WeakMap<any, KeyToDepMap>();

export function effect<T = any>(fn: () => T) {
  const _effect = new ReactiveEffect(fn);
  //   effect会立刻执行一次，触发getter依赖收集
  _effect.run();
}

// 记录当前的effect
export let activeEffect: ReactiveEffect | null = null;

export class ReactiveEffect<T = any> {
  constructor(public fn: () => T) {}

  run() {
    activeEffect = this;
    return this.fn();
  }
}

// 收集依赖
export function track(target: object, key: unknown) {
  if (!activeEffect) {
    return;
  }
  // 先查看缓存
  let depMap = targetMap.get(target);
  if (!depMap) {
    // 设置缓存
    targetMap.set(target, (depMap = new Map()));
  }
  //   收集依赖
  let dep = depMap.get(key);
  if (!dep) {
    // 可能会有多个依赖，一对多，所以需要数组，利用Set自动去重
    depMap.set(key, (dep = createDep()));
  }
  trackEffects(dep);
}

// 利用dep收集指定key的所有effect
export function trackEffects(dep: Dep) {
  dep.add(activeEffect!);
}

// 触发依赖
export function trigger(target: object, key: unknown, newVal: unknown) {
  // 查询缓存
  const depMap = targetMap.get(target);
  if (!depMap) {
    return;
  }
  // 获取对应的key的依赖
  const dep = depMap.get(key);
  if (!dep) {
    return;
  }
  // 触发依赖更新
  triggerEffects(dep);
}

// 依次触发dep中保存的依赖
export function triggerEffects(dep: Dep) {
  const effects = isArray(dep) ? dep : [...dep];
  for (const effect of effects) {
    triggerEffect(effect);
  }
}

// 触发依赖
export function triggerEffect(effect: ReactiveEffect) {
  effect.run();
}
