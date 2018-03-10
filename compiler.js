class Compiler {
  constructor(el, vm) {
    vm.$el = this.isElementNode(el)
      ? el
      : document.querySelector(el);
    let fragment = document.createDocumentFragment();
    let child;
    while (child = vm.$el.firstChild) {
      fragment.appendChild(child);
    }
    this.compiler(fragment, vm);
    vm.$el.appendChild(fragment);
  }
  isElementNode(el) {
    return el.nodeType === 1
  }
  compiler(fragment, vm) {
    let reg = /\{\{(.*?)\}\}/;
    Array.from(fragment.childNodes).forEach((node) => { // 获取每一层节点中双括号内表达式
      if (!node.template) {
        node.template = node.textContent; // 保存对应节点上的模板 因为后期替换要根据模板替换
      }
      var template = node.template;
      if (node.nodeType === 3 && reg.test(node.template)) { // 文本节点 并是{{}} 表达式
        node.texts = node.template.match(/\{\{(.*?)\}\}/g);
        node.texts.forEach(text => {
          let exp = reg.exec(text)[1]; // 表达式
          let arr = exp.split('.') // a.id => ['a', 'b'] 双括号内表达式
          let val = vm;
          arr.forEach(key => {
            val = val[key];
          });
          
          new Watcher(vm, exp, function() { // 订阅者
            template = node.template;
            node.texts.forEach(text => {
              let exp = reg.exec(text)[1]; // 表达式
              let arr = exp.split('.') // a.id => ['a', 'b'] 双括号内表达式
              let val = vm;
              arr.forEach(key => {
                val = val[key];
              });
              template = template.replace(/\{\{(.*?)\}\}/, val);
              node.textContent = template;
            });
          });

          template = template.replace(/\{\{(.*?)\}\}/, val);
          node.textContent = template;
        });
      }
      if (node.nodeType === 1) {
        Array.from(node.attributes).forEach(attr => {
          let name = attr.name;
          let exp = attr.value;
          let isDirective = name.startsWith('v-');
          if (isDirective) { // 这里只实现了v-model双向数据绑定
            let val = vm;
            let arr = exp.split('.');
            arr.forEach(k => {
              val = val[k];
            });
            node.value = val;
            new Watcher(vm, exp, newVal => {
              node.value = newVal;
            });
            node.addEventListener('input', e => {
              let newVal = e.target.value;
              let val = vm;
              for(let i = 0; i < arr.length-1; i++) {
                  val = val[arr[i]];
              }
              val[arr[arr.length - 1]] = newVal;
            })
          }
        })
      }
      if (node.childNodes) {
        this.compiler(node, vm)
      }
    });
  }
}
