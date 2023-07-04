import { isObject } from '@vue/shared';
import { mutableHandlers } from './baseHandlers';

export const reactiveMap = new WeakMap<object, any>();

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
  //   设置缓存
  proxyMap.set(target, proxy);
  return proxy;
}

export const toReavtive = <T extends unknown>(value: T) => {
  // 复杂数据类型，通过reactive转化为响应式
  return isObject(value) ? reactive(value) : value;
};
