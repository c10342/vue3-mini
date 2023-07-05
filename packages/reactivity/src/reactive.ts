import { isObject } from '@vue/shared';
import { mutableHandlers } from './baseHandlers';

export const reactiveMap = new WeakMap<object, any>();

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive'
}

// 创建响应式数据
export function reactive(target: object) {
  return createReactiveObject(target, mutableHandlers, reactiveMap);
}

function createReactiveObject(
  target: object,
  baseHandlers: ProxyHandler<any>,
  proxyMap: WeakMap<object, any>
) {
  // 缓存机制
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    // 已经代理过就不需要进行再次代理
    return existingProxy;
  }
  const proxy = new Proxy(target, baseHandlers);
  // 用来判断是否为reactive数据
  proxy[ReactiveFlags.IS_REACTIVE] = true;
  //   设置缓存
  proxyMap.set(target, proxy);
  return proxy;
}

// 根据数据类型，把对象转化为响应式
export const toReavtive = <T extends unknown>(value: T) => {
  // 复杂数据类型，通过reactive转化为响应式
  return isObject(value) ? reactive(value) : value;
};

// 是否为reactive响应式数据
export function isReactive(value): boolean {
  return !!(value && value[ReactiveFlags.IS_REACTIVE]);
}
