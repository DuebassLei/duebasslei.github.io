---
title: Vue实用操作笔记
description: Vue 2和Vue 3核心知识及常用插件整理
tag:
  - Vue
  - Vue2
  - Vue3
sidebar: true
outline: [2,3,4]
lastUpdated: true
---

# Vue基础常用笔记

## 📖 目录

- [Vue 2 核心知识](#vue-2-核心知识)
- [Vue 3 核心知识](#vue-3-核心知识)
- [Vue 2 vs Vue 3 主要区别](#vue-2-vs-vue-3-主要区别)
- [常用插件整理](#常用插件整理)

---

## Vue 2 核心知识

### 1. 响应式系统

#### 声明响应式数据

```javascript
// 在组件中声明响应式数据
var vm = new Vue({
  data: {
    message: 'Hello Vue!',
    count: 0
  }
})

// 组件中必须使用函数返回
var Component = Vue.extend({
  data: function () {
    return {
      message: 'Hello'
    }
  }
})
```

#### 响应式限制

- **必须预先声明所有根级属性**，即使值为空
- 使用 `Vue.set()` 或 `this.$set()` 添加新属性
- 使用 `Vue.delete()` 或 `this.$delete()` 删除属性

```javascript
// 添加响应式属性
this.$set(this.someObject, 'newProperty', 'value')

// 更新对象（推荐方式）
this.someObject = Object.assign({}, this.someObject, {
  newProperty: 'value'
})
```

#### Vue.observable

```javascript
// 创建响应式对象
const state = Vue.observable({ count: 0 })

const Demo = {
  render(h) {
    return h('button', {
      on: { click: () => { state.count++ }}
    }, `count is: ${state.count}`)
  }
}
```

### 2. 模板语法

#### 插值

```vue
<!-- 文本插值 -->
<span>Message: {{ msg }}</span>

<!-- 一次性插值 -->
<span v-once>This will never change: {{ msg }}</span>

<!-- 原始HTML -->
<div v-html="rawHtml"></div>

<!-- 属性绑定 -->
<div v-bind:id="dynamicId"></div>
<div :id="dynamicId"></div>

<!-- 事件绑定 -->
<button v-on:click="doSomething"></button>
<button @click="doSomething"></button>
```

#### 指令

```vue
<!-- 条件渲染 -->
<p v-if="seen">Now you see me</p>
<p v-else-if="type === 'B'">B</p>
<p v-else>Not A/B</p>

<!-- 列表渲染 -->
<ul>
  <li v-for="(item, index) in items" :key="item.id">
    {{ item.message }}
  </li>
</ul>

<!-- 动态参数 -->
<a v-on:[eventName]="doSomething"> ... </a>
<a @[eventName]="doSomething"> ... </a>
```

### 3. 组件系统

#### 组件注册

```javascript
// 全局注册
Vue.component('my-component', {
  template: '<div>A custom component!</div>'
})

// 局部注册
var ComponentA = { /* ... */ }
var ComponentB = { /* ... */ }

new Vue({
  el: '#app',
  components: {
    'component-a': ComponentA,
    'component-b': ComponentB
  }
})
```

#### Props

```javascript
Vue.component('blog-post', {
  props: ['post'],
  // 或者带类型检查
  props: {
    title: String,
    likes: Number,
    isPublished: Boolean,
    commentIds: Array,
    author: Object,
    callback: Function,
    contactsPromise: Promise
  },
  template: `
    <div class="blog-post">
      <h3>{{ post.title }}</h3>
      <div v-html="post.content"></div>
    </div>
  `
})
```

#### 插槽

```vue
<!-- 默认插槽 -->
<current-user>
  <template v-slot:default="slotProps">
    {{ slotProps.user.firstName }}
  </template>
</current-user>

<!-- 具名插槽 -->
<base-layout>
  <template v-slot:header>
    <h1>Here might be a page title</h1>
  </template>
  <template v-slot:default>
    <p>A paragraph for the main content.</p>
  </template>
  <template v-slot:footer>
    <p>Here's some contact info</p>
  </template>
</base-layout>
```

### 4. 生命周期钩子

```javascript
new Vue({
  data: {
    message: 'Hello'
  },
  beforeCreate() {
    // 实例初始化之后，数据观测和事件配置之前
  },
  created() {
    // 实例创建完成后立即调用
    // 可以访问 data、computed、methods
  },
  beforeMount() {
    // 挂载开始之前
  },
  mounted() {
    // 实例挂载完成后调用
    // 可以访问 DOM 元素
  },
  beforeUpdate() {
    // 数据更新时，虚拟 DOM 重新渲染之前
  },
  updated() {
    // 数据更改导致虚拟 DOM 重新渲染之后
  },
  beforeDestroy() {
    // 实例销毁之前
  },
  destroyed() {
    // 实例销毁之后
  }
})
```

### 5. 计算属性和侦听器

#### 计算属性

```javascript
var vm = new Vue({
  data: {
    firstName: 'Foo',
    lastName: 'Bar'
  },
  computed: {
    fullName: function () {
      return this.firstName + ' ' + this.lastName
    },
    // 带 getter 和 setter
    fullNameWithSetter: {
      get: function () {
        return this.firstName + ' ' + this.lastName
      },
      set: function (newValue) {
        var names = newValue.split(' ')
        this.firstName = names[0]
        this.lastName = names[names.length - 1]
      }
    }
  }
})
```

#### 侦听器

```javascript
var vm = new Vue({
  data: {
    question: '',
    answer: 'I cannot give you an answer until you ask a question!'
  },
  watch: {
    question: function (newQuestion, oldQuestion) {
      this.answer = 'Waiting for you to stop typing...'
      this.debouncedGetAnswer()
    }
  }
})
```

### 6. Provide/Inject

```javascript
// 父组件提供
var Provider = {
  provide: {
    foo: 'bar'
  }
}

// 子组件注入
var Child = {
  inject: ['foo'],
  created() {
    console.log(this.foo) // => "bar"
  }
}

// 带默认值
var Child = {
  inject: {
    foo: { default: 'foo' }
  }
}
```

---

## Vue 3 核心知识

### 1. 响应式系统（Composition API）

#### ref

```javascript
import { ref } from 'vue'

const count = ref(0)
console.log(count.value) // 0

count.value = 1
console.log(count.value) // 1

// 对象类型会自动深度响应式
const obj = ref({
  nested: { count: 0 },
  arr: ['foo', 'bar']
})

function mutateDeeply() {
  obj.value.nested.count++
  obj.value.arr.push('baz')
}
```

#### reactive

```javascript
import { reactive } from 'vue'

const state = reactive({
  count: 0
})

console.log(state.count) // 0
state.count++
```

#### toRefs 和 toRef

```javascript
import { toRefs, toRef } from 'vue'

export default {
  setup(props) {
    // 将 props 转换为 ref 对象，然后解构
    const { title } = toRefs(props)
    console.log(title.value)

    // 或者，将单个属性转换为 ref
    const title = toRef(props, 'title')
  }
}
```

### 2. Composition API

#### setup 函数

```vue
<script>
import { ref, onMounted } from 'vue'

export default {
  setup() {
    const count = ref(0)
    
    function increment() {
      count.value++
    }
    
    onMounted(() => {
      console.log('Component mounted')
    })
    
    return {
      count,
      increment
    }
  }
}
</script>
```

#### `<script setup>` 语法糖

```vue
<script setup>
import { ref, onMounted } from 'vue'

const count = ref(0)

function increment() {
  count.value++
}

onMounted(() => {
  console.log('Component mounted')
})
</script>

<template>
  <button @click="increment">Count is: {{ count }}</button>
</template>
```

### 3. 生命周期钩子（Composition API）

```javascript
import { 
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted
} from 'vue'

export default {
  setup() {
    onBeforeMount(() => {
      console.log('beforeMount')
    })
    
    onMounted(() => {
      console.log('mounted')
    })
    
    onBeforeUpdate(() => {
      console.log('beforeUpdate')
    })
    
    onUpdated(() => {
      console.log('updated')
    })
    
    onBeforeUnmount(() => {
      console.log('beforeUnmount')
    })
    
    onUnmounted(() => {
      console.log('unmounted')
    })
  }
}
```

### 4. 计算属性和侦听器

#### computed

```javascript
import { ref, computed } from 'vue'

const firstName = ref('John')
const lastName = ref('Doe')

const fullName = computed({
  get() {
    return firstName.value + ' ' + lastName.value
  },
  set(newValue) {
    [firstName.value, lastName.value] = newValue.split(' ')
  }
})
```

#### watch

```javascript
import { ref, watch } from 'vue'

const count = ref(0)

// 监听单个 ref
watch(count, (newValue, oldValue) => {
  console.log(`count changed from ${oldValue} to ${newValue}`)
})

// 监听 reactive 对象（自动深度监听）
const obj = reactive({ count: 0 })
watch(obj, (newValue, oldValue) => {
  // 注意：newValue 和 oldValue 是同一个对象
  console.log('obj changed')
})

// 深度监听 ref 对象
watch(() => obj.count, (newValue, oldValue) => {
  console.log(`count: ${oldValue} -> ${newValue}`)
}, { deep: true })

// watchEffect - 自动追踪依赖
import { watchEffect } from 'vue'
watchEffect(() => {
  console.log(`count is: ${count.value}`)
})
```

### 5. Provide/Inject

```javascript
import { provide, ref } from 'vue'

// 提供者
export default {
  setup() {
    const location = ref('North Pole')
    
    function updateLocation() {
      location.value = 'South Pole'
    }
    
    provide('location', {
      location,
      updateLocation
    })
  }
}

// 注入者
import { inject } from 'vue'

export default {
  setup() {
    const { location, updateLocation } = inject('location')
    
    return {
      location,
      updateLocation
    }
  }
}
```

### 6. 模板语法（与 Vue 2 基本相同）

```vue
<template>
  <!-- 文本插值 -->
  <span>Message: {{ msg }}</span>
  
  <!-- 条件渲染 -->
  <p v-if="seen">Now you see me</p>
  
  <!-- 列表渲染 -->
  <ul>
    <li v-for="item in items" :key="item.id">
      {{ item.text }}
    </li>
  </ul>
  
  <!-- 事件处理 -->
  <button @click="increment">Count: {{ count }}</button>
</template>
```

---

## Vue 2 vs Vue 3 主要区别

### 1. 响应式系统

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| 响应式原理 | Object.defineProperty | Proxy |
| 数组监听 | 需要特殊处理 | 原生支持 |
| 性能 | 相对较慢 | 更快 |
| 新增属性 | 需要 `$set` | 直接添加即可 |

### 2. API 风格

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| 主要 API | Options API | Composition API + Options API |
| 代码组织 | 按选项分组 | 按功能分组 |
| TypeScript 支持 | 一般 | 优秀 |
| 逻辑复用 | Mixins | Composables |

### 3. 生命周期

| Vue 2 | Vue 3 (Options API) | Vue 3 (Composition API) |
|-------|---------------------|-------------------------|
| beforeCreate | beforeCreate | setup() |
| created | created | setup() |
| beforeMount | beforeMount | onBeforeMount |
| mounted | mounted | onMounted |
| beforeUpdate | beforeUpdate | onBeforeUpdate |
| updated | updated | onUpdated |
| beforeDestroy | beforeUnmount | onBeforeUnmount |
| destroyed | unmounted | onUnmounted |

### 4. 性能优化

- **Vue 3 改进**：
  - 更小的包体积（Tree-shaking）
  - 更快的渲染速度
  - 更好的 TypeScript 支持
  - Fragment 支持（多个根节点）
  - Teleport 组件（传送门）
  - Suspense 组件（异步组件）

---

## 常用插件整理

### 1. 状态管理

#### Vuex (Vue 2/3)

```bash
# Vue 2
pnpm add vuex@3

# Vue 3
pnpm add vuex@4
```

```javascript
// Vue 3 使用示例
import { createStore } from 'vuex'

const store = createStore({
  state: {
    count: 0
  },
  mutations: {
    increment(state) {
      state.count++
    }
  },
  actions: {
    increment({ commit }) {
      commit('increment')
    }
  }
})
```

#### Pinia (Vue 3 推荐)

```bash
pnpm add pinia
```

```javascript
// main.js
import { createPinia } from 'pinia'
app.use(createPinia())

// stores/counter.js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0
  }),
  actions: {
    increment() {
      this.count++
    }
  }
})
```

### 2. 路由

#### Vue Router

```bash
# Vue 2
pnpm add vue-router@3

# Vue 3
pnpm add vue-router@4
```

```javascript
// Vue 3 使用示例
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About }
  ]
})
```

### 3. UI 组件库

#### Element Plus (Vue 3)

```bash
pnpm add element-plus
```

```javascript
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)
app.use(ElementPlus)
```

#### Element UI (Vue 2)

```bash
pnpm add element-ui
```

#### Vuetify (Vue 2/3)

```bash
# Vue 3
pnpm add vuetify@^3

# Vue 2
pnpm add vuetify@^2
```

#### Ant Design Vue (Vue 2/3)

```bash
# Vue 3
pnpm add ant-design-vue@4

# Vue 2
pnpm add ant-design-vue@2
```

### 4. 工具库

#### VueUse (Vue 3)

```bash
pnpm add @vueuse/core
```

常用 composables：

```javascript
import { 
  useMouse, 
  useLocalStorage, 
  useDark,
  useClipboard,
  useDebounceFn,
  useEventListener,
  useToggle
} from '@vueuse/core'

// 鼠标位置
const { x, y } = useMouse()

// 本地存储
const store = useLocalStorage('my-key', { count: 0 })

// 暗色模式
const isDark = useDark()

// 剪贴板
const { copy, copied } = useClipboard()

// 防抖
const debouncedFn = useDebounceFn(() => {
  console.log('debounced')
}, 500)

// 事件监听
useEventListener(window, 'resize', () => {
  console.log('resized')
})

// 切换布尔值
const [isOpen, toggle] = useToggle()
```

### 5. HTTP 请求

#### Axios

```bash
pnpm add axios
```

```javascript
import axios from 'axios'

// 创建实例
const api = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 1000
})

// 请求拦截器
api.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${token}`
  return config
})

// 响应拦截器
api.interceptors.response.use(
  response => response.data,
  error => Promise.reject(error)
)
```

#### Vue Request (Vue 3)

```bash
pnpm add @vueuse/core
```

### 6. 表单验证

#### VeeValidate (Vue 2/3)

```bash
# Vue 3
pnpm add vee-validate@4 yup

# Vue 2
pnpm add vee-validate@3 yup
```

```vue
<script setup>
import { useForm } from 'vee-validate'
import * as yup from 'yup'

const schema = yup.object({
  email: yup.string().required().email(),
  password: yup.string().required().min(6)
})

const { handleSubmit } = useForm({
  validationSchema: schema
})

const onSubmit = handleSubmit(values => {
  console.log(values)
})
</script>
```

### 7. 动画

#### Vue Transition

Vue 内置，无需安装：

```vue
<template>
  <transition name="fade">
    <div v-if="show">Hello</div>
  </transition>
</template>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
```

#### Animate.css

```bash
pnpm add animate.css
```

```vue
<template>
  <transition
    enter-active-class="animate__animated animate__fadeIn"
    leave-active-class="animate__animated animate__fadeOut"
  >
    <div v-if="show">Hello</div>
  </transition>
</template>
```

### 8. 日期处理

#### Day.js

```bash
pnpm add dayjs
```

```javascript
import dayjs from 'dayjs'

dayjs().format('YYYY-MM-DD HH:mm:ss')
dayjs().add(1, 'day')
dayjs().subtract(1, 'month')
```

### 9. 工具函数

#### Lodash

```bash
pnpm add lodash
pnpm add -D @types/lodash
```

```javascript
import { debounce, throttle, cloneDeep } from 'lodash-es'
```

### 10. 开发工具

#### Vue DevTools

浏览器扩展，支持 Vue 2 和 Vue 3

- Chrome: [Vue.js devtools](https://chrome.google.com/webstore/detail/vuejs-devtools)
- Firefox: [Vue.js devtools](https://addons.mozilla.org/firefox/addon/vue-js-devtools/)

### 11. 构建工具

#### Vite (Vue 3 推荐)

```bash
pnpm create vite my-vue-app --template vue
```

#### Vue CLI (Vue 2/3)

```bash
# 全局安装
pnpm add -g @vue/cli

# 创建项目
vue create my-project
```

### 12. 测试

#### Vitest (Vue 3)

```bash
pnpm add -D vitest @vue/test-utils
```

#### Jest (Vue 2)

```bash
pnpm add -D jest @vue/test-utils
```

### 13. 代码规范

#### ESLint

```bash
pnpm add -D eslint eslint-plugin-vue
```

#### Prettier

```bash
pnpm add -D prettier eslint-config-prettier
```

### 14. 其他实用插件

#### vue-i18n (国际化)

```bash
# Vue 3
pnpm add vue-i18n@9

# Vue 2
pnpm add vue-i18n@8
```

#### vue-meta (SEO)

```bash
# Vue 2
pnpm add vue-meta

# Vue 3
pnpm add @vueuse/head
```

#### vue-toastification (消息提示)

```bash
pnpm add vue-toastification
```

#### vue-draggable (拖拽)

```bash
pnpm add vuedraggable
```

---

##  学习资源

- [Vue 3 官方文档](https://vuejs.org/)
- [Vue 2 官方文档](https://v2.vuejs.org/)
- [VueUse 文档](https://vueuse.org/)
- [Vue Router 文档](https://router.vuejs.org/)
- [Pinia 文档](https://pinia.vuejs.org/)

---

## 💡 最佳实践

1. **Vue 3 项目优先使用 Composition API**，代码更清晰、易维护
2. **使用 `<script setup>` 语法**，减少样板代码
3. **合理使用 computed 和 watch**，避免不必要的计算
4. **组件命名使用 PascalCase**
5. **Props 定义类型和默认值**
6. **使用 key 优化列表渲染**
7. **合理使用 v-if 和 v-show**
8. **大型项目使用状态管理库**（Pinia/Vuex）
9. **使用 TypeScript 提升代码质量**
10. **遵循单一职责原则**，组件保持小而专注
