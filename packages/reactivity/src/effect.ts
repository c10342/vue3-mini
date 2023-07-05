import { extend, isArray } from '@vue/shared';
import { Dep, createDep } from './dep';
import { ComputedRefTmpl } from './computed';

/**
 * 收集所有依赖的 WeakMap 实例：
 * 1. `key`：响应性对象
 * 2. `value`：`Map` 对象
 * 		1. `key`：响应性对象的指定属性
 * 		2. `value`：指定对象的指定属性的 执行函数
 */
type KeyToDepMap = Map<any, Dep>;
const targetMap = new WeakMap<any, KeyToDepMap>();

export interface ReactiveEffectOptions {
  // 懒执行
  lazy?: boolean;
  // 调度器，作用：控制执行顺序，控制执行规则
  scheduler?: EffectScheduler;
}
export function effect<T = any>(fn: () => T, options?: ReactiveEffectOptions) {
  const _effect = new ReactiveEffect(fn);
  if (options) {
    // 将scheduler合并到_effect中
    extend(_effect, options);
  }
  if (!options || !options.lazy) {
    //  如果不是懒执行， effect会立刻执行一次，触发getter依赖收集
    _effect.run();
  }
}

// 记录当前的effect
export let activeEffect: ReactiveEffect | null = null;

export type EffectScheduler = (...args: any[]) => any;

export class ReactiveEffect<T = any> {
  computed?: ComputedRefTmpl<T>;
  constructor(public fn: () => T, public scheduler?: EffectScheduler) {}

  run() {
    activeEffect = this;
    return this.fn();
  }

  stop() {
    // todo
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
  // 要先执行computed的effect
  // 然后再执行非计算属性的effect，防止死循环
  // why:自己收集了自己，导致死循环
  // eg:
  // const text = computed();
  // effect(() => {
  //   p1.innerHTML = text.value;
  // 第二次读取的时候，由于在第一次读取的时候，activeEffect就变成computed自己了
  // 再次读取的时候，会把自己当做依赖收集进去
  // 更新依赖的时候，由于执行了scheduler，scheduler里面又再次更新依赖，所以导致了死循环
  //   p1.innerHTML = text.value;
  // });
  for (const effect of effects) {
    if (effect.computed) {
      triggerEffect(effect);
    }
  }

  for (const effect of effects) {
    if (!effect.computed) {
      triggerEffect(effect);
    }
  }
}

// 触发依赖
export function triggerEffect(effect: ReactiveEffect) {
  if (effect.scheduler) {
    // computed依赖的值发生变化，需要执行调度器，而不是run
    effect.scheduler();
  } else {
    effect.run();
  }
}
