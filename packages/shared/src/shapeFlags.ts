export const enum ShapeFlags {
  /**
   * type = Element
   */
  ELEMENT = 1,
  /**
   * 函数组件
   */
  FUNCTIONAL_COMPONENT = 1 << 1,
  /**
   * 有状态（响应数据）组件
   */
  STATEFUL_COMPONENT = 1 << 2,
  /**
   * children = Text
   */
  TEXT_CHILDREN = 1 << 3,
  /**
   * children = Array
   */
  ARRAY_CHILDREN = 1 << 4,
  /**
   * children = slot
   */
  SLOTS_CHILDREN = 1 << 5,
  /**
   * 组件：有状态（响应数据）组件 | 函数组件
   */
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT
}

// 1、<< 运算符执行左移位运算
// 2、移位运算过程中，符号位始终保持不变
// 3、如果右侧空出位置，则自动填充为 0；超出 32 位的值，则自动丢弃
// eg：// 1 << 4 ==> 16
// 1二进制：00000000 00000000 00000000 00000001
// 1向左移动四位变成：00000000 00000000 00000000 00010000
