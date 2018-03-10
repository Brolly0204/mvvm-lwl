// 订阅者 Dep ，它的主要作用是用来存放 Watcher 观察者对象。
class Dep {
  constructor() {
    this.subs = [];
  }

  addSub(sub) {
    this.subs.push(sub);
  }

  getSub() {
    return this.subs;
  }

  notify() {
    this.subs.forEach(sub => sub.update());
  }
}

class Watcher {
  constructor(vm, exp, fn) { // exp 双括号中的表达式
    this.fn = fn;
    this.exp = exp;
    this.vm = vm;
    Dep.target = this; // 缓存观察者 在getter时 需要将缓存的watcher对象添加到订阅器（dep.addDep(Dep.target)）
    let val = vm;
    let arr = exp.split('.');

    arr.forEach(k => {
      val = val[k]; // 触发属性的getter 将当前实例watcher对象自身 添加到订阅器(dep)里面中
    });
    Dep.target = null;
  }
  update() {
    let val = this.vm;
    let arr = this.exp.split('.');
    arr.forEach(k => {
      val = val[k]; // 触发属性的getter 将当前实例Dep.target添加到订阅器中
    });
    this.fn(val);
  }
}

// let watcher = new Watcher(() => {
//   console.log(1);
// });

// let dep = new Dep();
// dep.addSub(watcher);
// dep.addSub(watcher);
//
// setTimeout(() => {
//   dep.notify();
// }, 1000);
