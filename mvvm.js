class Lwl {
  constructor(options = {}) {
    this.$options = options;
    const data = this._data = this.$options.data;
    this.observer(data);
    // this实例 代理 data
    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        enumerable: true,
        get() {
          return this._data[key];
        },
        set(newVal) {
          this._data[key] = newVal;
        }
      })
    });
    this.initComputed();
    new Compiler(options.el, this); //  编译
  }

  observer(data) { // 对数据属性进行 观察和数据劫持
    if (!data || typeof data !== 'object') {
      return;
    }
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key]);
    });
  }

  defineReactive(data, key, val) {
    const that = this;
    const dep = new Dep();
    that.observer(val); // 子属性如果是对象 也需要数据劫持
    Object.defineProperty(data, key, {
      enumerable: true,
      get() {
        Dep.target && dep.addSub(Dep.target); // 添加关于这个数据的watcher订阅者
        console.log(dep.subs);
        return val;
      },
      set(newVal) { // set执行说明 数据发生了改变
        if(val === newVal) return;
        val = newVal;
        that.observer(val); // 如果直接赋的新值有可能是对象 也需要数据劫持
        dep.notify(); // 通知所有的watcher 执行update方法
      }
    });
  }
  initComputed() { // 计算属性实现
    let vm = this;
    let computed = vm.$options.computed;
    Object.keys(computed).forEach(key => {
      Object.defineProperty(vm, key, {
        get: typeof computed[key] === 'function' ? computed[key] : computed[key].get,
        set(){}
      });
    });
  }
}
