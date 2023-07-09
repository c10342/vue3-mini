import {
  isArray,
  isFunction,
  isObject,
  isString,
  normalizeClass,
  ShapeFlags
} from '@vue/shared';

// 碎片类型
export const Fragment = Symbol('Fragment');
// 文本类型
export const Text = Symbol('Text');
// 注释类型
export const Comment = Symbol('Comment');

export interface VNode {
  // 判断是否为vnode的标识
  __v_isVnode: true;
  //   节点类型
  type: any;
  props: any;
  children: any;
  shapeFlag: number;
}

// 判断是否为vnode
export function isVNode(value: any) {
  return value ? value.__v_isVnode : false;
}

// 创建vnode
export function createVNode(
  type: any,
  props: null | Record<string, any>,
  children: any
): VNode {
  if (props) {
    let { class: klass } = props;
    // 对class进行格式化，统一成字符串类型
    if (klass && !isString(klass)) {
      props.class = normalizeClass(klass);
    }
  }
  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT // 文本
    : isObject(type)
    ? ShapeFlags.STATEFUL_COMPONENT // 有状态的组件
    : 0;

  return createBaseVNode(type, props, children, shapeFlag);
}

function createBaseVNode(type, props, children, shapeFlag) {
  const vnode: VNode = {
    __v_isVnode: true,
    type,
    props,
    shapeFlag,
    children: null
  };
  normalizeChildren(vnode, children);
  return vnode;
}

export function normalizeChildren(vnode: VNode, children: unknown) {
  let type = 0;

  const { shapeFlag } = vnode;
  // null==null => true
  // null==undefined => true
  // null===undefined => false
  if (children == null) {
    children = null;
  } else if (isArray(children)) {
    type = ShapeFlags.ARRAY_CHILDREN;
  } else if (isObject(children)) {
  } else if (isFunction(children)) {
  } else {
    // 以上都不是，默认是字符文本
    children = String(children);
    type = ShapeFlags.TEXT_CHILDREN;
  }
  vnode.children = children;
  // 以下的等价 vnode.shapeFlag = vnode.shapeFlag | type;
  vnode.shapeFlag |= type;
}
