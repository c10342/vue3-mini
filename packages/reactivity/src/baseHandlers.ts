import { track, trigger } from './effect';

const get = createGetter();

function createGetter() {
  return function get(target: object, key: string | symbol, reciver: object) {
    // Reflect.get第三个参数作用：target.bind(reciver)，改变target的this指向
    const res = Reflect.get(target, key, reciver);
    // 收集依赖
    track(target, key);
    return res;
  };
}

const set = createSetter();

function createSetter() {
  return function set(
    target: object,
    key: string | symbol,
    value: unknown,
    reciver: object
  ) {
    const res = Reflect.set(target, key, value, reciver);
    // 触发依赖
    trigger(target, key, value);
    return res;
  };
}

export const mutableHandlers: ProxyHandler<object> = {
  get,
  set
};
