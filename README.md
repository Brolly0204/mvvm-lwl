# vue 简单实现

## 实现数据绑定的做法有大致如下几种：

- 发布者-订阅者模式（backbone.js）

- 脏值检查（angular.js）

- 数据劫持（vue.js）

发布者-订阅者模式: 一般通过sub, pub的方式实现数据和视图的绑定监听，更新数据方式通常做法是 vm.set('property', value)，这里有篇文章讲的比较详细，有兴趣可点这里

这种方式现在毕竟太low了，我们更希望通过 vm.property = value这种方式更新数据，同时自动更新视图，于是有了下面两种方式

脏值检查: angular.js 是通过脏值检测的方式比对数据是否有变更，来决定是否更新视图，最简单的方式就是通过 setInterval() 定时轮询检测数据变动，当然Google不会这么low，angular只有在指定的事件触发时进入脏值检测，大致如下：

 - DOM事件，譬如用户输入文本，点击按钮等。( ng-click )
 - XHR响应事件 ( $http )
 - 浏览器Location变更事件 ( $location )
 - Timer事件( $timeout , $interval )
 - 执行 $digest() 或 $apply()




## 响应式
在 init 的时候 通过 Object.defineProperty 对数据属性进行了绑定，它使得当被设置的对象被读取的时候会执行 getter 函数，而在当被赋值的时候会执行 setter 函数。

## 数据劫持
vue.js 则是采用数据劫持结合发布者-订阅者模式的方式，通过Object.defineProperty()来劫持各个属性的setter，getter，在数据变动时发布消息给订阅者，触发相应的监听回调。

### Object.defineProperty
```
/*
    obj: 目标对象
    prop: 需要操作的目标对象的属性名
    descriptor: 描述符
    return value 传入对象
*/
Object.defineProperty(obj, prop, descriptor)
```

descriptor的一些属性，简单介绍几个属性，具体可以参考 MDN 文档。

- enumerable，属性是否可枚举，默认 false。
- configurable，属性是否可以被修改或者删除，默认 false。
- get，获取属性的方法。
- set，设置属性的方法。

## observer（可观察的）

```

function cb (val) {
    /* 渲染视图 */
    console.log("视图更新啦～");
}

function defineReactive (obj, key, val) {
    Object.defineProperty(obj, key, {
        enumerable: true,       /* 属性可枚举 */
        configurable: true,     /* 属性可被修改或删除 */
        get: function reactiveGetter () {
            return val;         /* 实际上会依赖收集，下一小节会讲 */
        },
        set: function reactiveSetter (newVal) {
            if (newVal === val) return;
            cb(newVal);
        }
    });
}
```

## 订阅者 Dep
订阅者 Dep ，它的主要作用是用来存放 Watcher 观察者对象。

## 观察者 Watcher

```
class Watcher {
    constructor () {
        /* 在new一个Watcher对象时将该对象赋值给Dep.target，在get中会用到 */
        Dep.target = this;
    }

    /* 更新视图的方法 */
    update () {
        console.log("视图更新啦～");
    }
}

Dep.target = null;
```

## 依赖收集
当被渲染的时候，因为会读取所需对象的值，所以会触发 getter 函数进行「依赖收集」，「依赖收集」的目的是将观察者 Watcher 对象存放到当前闭包中的订阅者 Dep 的 subs 中。

在修改对象的值的时候，会触发对应的 setter， setter 通知之前「依赖收集」得到的 Dep 中的每一个 Watcher，告诉它们自己的值改变了，需要重新渲染视图。这时候这些 Watcher 就会开始调用 update 来更新视图，当然这中间还有一个 patch 的过程以及使用队列来异步更新的策略。


- 用 addSub 方法可以在目前的 Dep 对象中增加一个 Watcher 的订阅操作；
- 用 notify 方法通知目前 Dep 对象的 subs 中的所有 Watcher 对象触发更新操作。

## 更新视图

在修改一个对象值的时候，会通过 setter -> Watcher -> update 的流程来修改对应的视图。

## MVVM
MVVM作为数据绑定的入口，整合Observer、Compile和Watcher三者，通过Observer来监听自己的model数据变化，通过Compile来解析编译模板指令，最终利用Watcher搭起Observer和Compile之间的通信桥梁，达到数据变化 -> 视图更新；视图交互变化(input) -> 数据model变更的双向绑定效果。
