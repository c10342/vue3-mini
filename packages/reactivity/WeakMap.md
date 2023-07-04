# WeakMap 和 Map

## Map

强引用，会影响垃圾回收机制。

`key-value`键值对，键和值可以是任意值

```javascript
let obj = { name: '张三' };

const map = new Map();

map.set(obj, 'value');

obj = null; // map中的obj`不会`被回收
```

## WeakMap

弱引用，不影响垃圾回收机制

`key-value`键值对，键必须是对象，值可以是任意值

```javascript
let obj = { name: '张三' };

const map = new WeakMap();

map.set(obj, 'value');

obj = null; // map中的obj`会`被回收
```
