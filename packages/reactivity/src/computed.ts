import { isFunction } from '@vue/shared';
import { Dep } from './dep';
import { ReactiveEffect, activeEffect } from './effect';
import { trackRefValue, triggerRefValue } from './ref';

export class ComputedRefTmpl<T> {
  public dep?: Dep = undefined;
  private _value!: T;
  // 标记位，如果computed中依赖的属性值发生了变化，_dirty需要变成true
  // 表示需要重新计算
  private _dirty = true;
  public readonly effect: ReactiveEffect<T>;
  public readonly __v_isRef = true;

  constructor(getter) {
    this.effect = new ReactiveEffect(getter, () => {
      // computed中依赖的属性值发生了变化，就会执行这个函数
      if (!this._dirty) {
        // 缓存实现关键
        this._dirty = true;
        triggerRefValue(this);
      }
    });
    // 保存当前实例
    this.effect.computed = this;
  }

  get value() {
    // 收集依赖
    trackRefValue(this);
    if (this._dirty) {
      // 缓存实现关键
      this._dirty = false;
      // 实际上就是执行了getter，计算结果
      this._value = this.effect.run();
    }

    return this._value;
  }
}

export function computed(getterOrOptions) {
  let getter;
  const onlyGetter = isFunction(getterOrOptions);
  if (onlyGetter) {
    getter = getterOrOptions;
  }
  const cRef = new ComputedRefTmpl(getter);
  return cRef;
}
