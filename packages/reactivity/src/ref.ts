import { hasChanged } from '@vue/shared';
import { Dep, createDep } from './dep';
import { activeEffect, trackEffects, triggerEffects } from './effect';
import { toReavtive } from './reactive';

export interface Ref<T = any> {
  value: T;
}

export function ref(value?: unknown) {
  return createRef(value, false);
}

function createRef(rawValue: unknown, shallow: boolean) {
  if (isRef(rawValue)) {
    // 已经是ref数据
    return rawValue;
  }
  return new RefImpl(rawValue, shallow);
}

class RefImpl<T> {
  private _value: T;
  //   原始数据
  private _rawValue: T;
  public dep?: Dep = undefined;
  public readonly __v__isRef = true;
  constructor(value: T, public readonly __v__isShallow: boolean) {
    // 是否浅层响应式
    this._value = __v__isShallow ? value : toReavtive(value);
    this._rawValue = value;
  }

  get value() {
    // 收集依赖
    trackRefValue(this);
    return this._value;
  }

  set value(newVal) {
    // 对比新旧数据是否发生了变化
    if (hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal;
      this._value = toReavtive(newVal);
      triggerRefValue(this);
    }
  }
}

// 收集依赖
export function trackRefValue(ref: RefImpl<any>) {
  if (activeEffect) {
    trackEffects(ref.dep || (ref.dep = createDep()));
  }
}

// 触发依赖
export function triggerRefValue(ref: RefImpl<any>) {
  if (ref.dep) {
    triggerEffects(ref.dep);
  }
}

// 是否为ref
export function isRef(r: any): r is Ref {
  return !!(r && r.__v__isRef === true);
}
