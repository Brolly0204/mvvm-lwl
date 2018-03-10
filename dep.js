class Dep {
  constructor() {
    this.subs = [];
  }

  addSub(sub) {
    this.subs.push(sub);
  }

  notify() {
    console.log(this.subs);
    this.subs.forEach(sub => sub.update());
  }
}

class Watcher {
  constructor(vm, exp, fn) { // exp 双括号中的表达式
    this.fn = fn;
    this.exp = exp;
    this.vm = vm;
    Dep.target = this; // 在getter中 需要添加watcher实例（dep.addDep(Dep.target)），所以需要缓存起来
    let val = vm;
    let arr = exp.split('.');

    arr.forEach(k => {
      val = val[k]; // 触发属性的getter 将当前实例Dep.target添加到订阅器中
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
