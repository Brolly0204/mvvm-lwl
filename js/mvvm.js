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

  // 被渲染的时候，因为会读取所需对象的值，所以会触发 getter 函数进行「依赖收集」，
  //「依赖收集」的目的是将观察者 Watcher 对象存放到当前闭包中的订阅者 Dep 的 subs 中。
  defineReactive(data, key, val) {
    const that = this;
    const dep = new Dep(); // 当前闭包中的订阅者
    that.observer(val); // 子属性如果是对象 也需要数据劫持
    Object.defineProperty(data, key, {
      enumerable: true,
      get() { // 依赖收集
        Dep.target && (dep.addSub(Dep.target), dep.depName=key); // 将观察者 Watcher 对象存放到当前闭包中的订阅者 Dep 的 subs 中
        return val;
      },
      set(newVal) { // set执行说明 数据发生了改变
        if(val === newVal) return;
        val = newVal;
        that.observer(val); // 如果直接赋的新值有可能是对象 也需要数据劫持
        dep.notify(); // 触发对应Dep中的Watcher对象, Watcher 对象会调用对应的 update 来修改视图
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
