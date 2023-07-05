// 调度器
// 适用场景：如一个数据发生了多次变化，但是只需要使用最后一次的变化
// 变化是同步的，所以可以使用微任务等所有同步的执行完了在执行调度器

// 是否正在执行队列函数
let isFlushPending = false;
// 队列函数
const pendingPreFlushCbs: Function[] = [];
// 构建一个异步任务，微任务
const resolvePromise = Promise.resolve() as Promise<any>;

let currentFlushPromise: Promise<void> | null = null;

// 添加队列函数
export function queuePreFlushCb(cb: Function) {
  queueCb(cb, pendingPreFlushCbs);
}

// 添加队列函数，并开始执行
function queueCb(cb: Function, pendingQueue: Function[]) {
  pendingQueue.push(cb);
  //  执行队列函数
  queueFlush();
}

// 执行队列函数
function queueFlush() {
  if (!isFlushPending) {
    // 上锁，防止重复执行
    // why:如果连续调用了多次queuePreFlushCb，会执行多次
    // 因为是异步队列，所以执行一次后上锁，后面的只需要存放在队列中即可
    // 等待异步函数执行，就会把队列中的函数拿出来执行
    isFlushPending = true;
    currentFlushPromise = resolvePromise.then(flushJobs);
  }
}

// 执行队列函数
function flushJobs() {
  // 开始执行后解锁
  isFlushPending = false;
  flushPreFlushCbs();
}

// 依次执行队列中的函数
export function flushPreFlushCbs() {
  if (pendingPreFlushCbs.length) {
    // 去重
    let activePreFlushCbs = [...new Set(pendingPreFlushCbs)];
    // 清空数据
    pendingPreFlushCbs.length = 0;
    for (let i = 0; i < activePreFlushCbs.length; i++) {
      activePreFlushCbs[i]();
    }
  }
}
