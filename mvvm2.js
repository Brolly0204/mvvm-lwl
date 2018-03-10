function Lwl(options = {}) {
  this.$options = options;
  let data = this._data = this.$options.data;
  observer(data); // {a:{id: 24}} 对data里数据进行解析观察

  // this 代理 data
  Object.keys(data).forEach(key => {
    Object.defineProperty(this, key, {
      enumerable: true,
      get() {
        return this._data[key];
      },
      set(newVal) {
        this._data[key] = newVal; // 赋值后 自动调用该属性setter 下面已经对data做了劫持
      }
    });
  });
}

function observer(data) { // 处理对象观察
  if (!data || typeof data !== 'object') {
    return;
  }

  Object.keys(data).forEach((key) => {
    defineReactive(data, key, data[key]); // {a:{id: 24}}  data, a, {id: 24}
  });
}

function defineReactive(data, key, val) { // 通过将数据加上getter setter，在setter中监听变化
  observer(val); // 监听子属性 {id: 24} 如果a的子属性也是对象 就继续对子属性 Observer劫持
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: false,
    get() {
      return val;
    },
    set(newVal) { // 监听变化
      if (newVal === val)
        return;
      val = newVal; // 更新值  {a:{id: 24}} => {a:{c: 20}}
      observer(val); // {c: 20} 如果新值是一个对象 也需要对它的observer劫持
    }
  })
}
