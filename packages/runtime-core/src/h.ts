import { isArray, isObject } from '@vue/shared';
import { VNode, createVNode, isVNode } from './vnode';

export function h(type: any, propsOrChildren?: any, children?: any): VNode {
  const l = arguments.length;
  if (l === 2) {
    // 根据参数长度对参数进行处理
    if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
      if (isVNode(propsOrChildren)) {
        return createVNode(type, null, [propsOrChildren]);
      }
      return createVNode(type, propsOrChildren, []);
    } else {
      return createVNode(type, null, propsOrChildren);
    }
  } else {
    if (l > 3) {
      // 超过三个参数的，后面的都是子节点
      children = Array.prototype.slice.call(arguments, 2);
    } else if (l === 3 && isVNode(children)) {
      children = [children];
    }
    return createVNode(type, propsOrChildren, children);
  }
}
