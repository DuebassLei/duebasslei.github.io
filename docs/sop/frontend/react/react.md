---
title: React基础
description: React 常用操作笔记
tag:
  - React
sidebar: true
outline: [2,3,4]
lastUpdated: true
---

# React 常用操作笔记

## 一、React 概述

### 1.1 React 简介
React 是一个用于构建用户界面的 JavaScript 库，由 Facebook 开发和维护。

**核心特点**：
- **组件化**：将 UI 拆分为独立、可复用的组件
- **声明式**：描述 UI 应该是什么样子，而不是如何操作 DOM
- **虚拟 DOM**：高效的 DOM 更新机制
- **单向数据流**：数据从父组件流向子组件
- **JSX 语法**：在 JavaScript 中写类似 HTML 的代码

### 1.2 React 生态系统
- **React DOM**：渲染到浏览器
- **React Native**：构建移动应用
- **React Router**：路由管理
- **Redux/ Zustand**：状态管理
- **Next.js**：服务端渲染框架

## 二、JSX 语法

### 2.1 JSX 基础

```jsx
// JSX 表达式
const element = <h1>Hello, World!</h1>;

// 嵌入表达式
const name = 'React';
const element = <h1>Hello, {name}!</h1>;

// 多行 JSX（使用括号）
const element = (
  <div>
    <h1>Title</h1>
    <p>Content</p>
  </div>
);
```

### 2.2 JSX 属性

```jsx
// 字符串属性
const element = <div className="container">Content</div>;

// 表达式属性
const element = <img src={user.avatarUrl} alt={user.name} />;

// 布尔属性
const element = <input disabled={true} />;
// 简写
const element = <input disabled />;

// 展开属性
const props = { name: 'React', version: '18' };
const element = <div {...props} />;
```

### 2.3 JSX 注意事项
- JSX 必须有一个根元素（React 18+ 支持 Fragment）
- 属性名使用驼峰命名（如 `className`、`onClick`）
- 所有标签必须闭合
- 使用 `{}` 包裹 JavaScript 表达式

## 三、组件

### 3.1 函数组件

```jsx
// 简单函数组件
function Welcome(props) {
  return <h1>Hello, {props.name}!</h1>;
}

// 箭头函数组件
const Welcome = (props) => {
  return <h1>Hello, {props.name}!</h1>;
};

// 使用组件
function App() {
  return (
    <div>
      <Welcome name="React" />
      <Welcome name="World" />
    </div>
  );
}
```

### 3.2 Props（属性）

```jsx
// 传递 Props
function Avatar({ person, size }) {
  return (
    <img
      src={person.imageUrl}
      alt={person.name}
      width={size}
      height={size}
    />
  );
}

// 使用 children prop
function Card({ children, title }) {
  return (
    <div className="card">
      <h1>{title}</h1>
      {children}
    </div>
  );
}

// 使用
<Card title="Photo">
  <Avatar person={person} size={100} />
</Card>

// 展开属性传递
function Profile(props) {
  return (
    <div className="card">
      <Avatar {...props} />
    </div>
  );
}
```

### 3.3 条件渲染

```jsx
// if 语句
function Greeting({ isLoggedIn }) {
  if (isLoggedIn) {
    return <h1>Welcome back!</h1>;
  }
  return <h1>Please sign up.</h1>;
}

// 三元运算符
function Welcome({ user }) {
  return (
    <div>
      {user ? <h1>Hello, {user.name}!</h1> : <h1>Please log in.</h1>}
    </div>
  );
}

// 逻辑与运算符
function Mailbox({ unreadMessages }) {
  return (
    <div>
      <h1>Hello!</h1>
      {unreadMessages.length > 0 && (
        <h2>You have {unreadMessages.length} unread messages.</h2>
      )}
    </div>
  );
}
```

### 3.4 列表渲染

```jsx
// map 方法
function NumberList({ numbers }) {
  const listItems = numbers.map((number) => (
    <li key={number.toString()}>{number}</li>
  ));
  return <ul>{listItems}</ul>;
}

// 直接使用
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}
```

**注意事项**：
- 每个列表项必须有唯一的 `key` 属性
- `key` 应该是稳定的、可预测的、唯一的
- 不要使用数组索引作为 `key`（除非列表不会改变）

## 四、State（状态）

### 4.1 useState Hook

```jsx
import { useState } from 'react';

function Counter() {
  // 声明 state 变量
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
}
```

### 4.2 State 更新

```jsx
// 直接更新
function Counter() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setCount(count + 1);
  };
  
  return <button onClick={handleClick}>{count}</button>;
}

// 函数式更新（推荐用于依赖前一个 state）
function Counter() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setCount(prevCount => prevCount + 1);
  };
  
  return <button onClick={handleClick}>{count}</button>;
}

// 批量更新
function Counter() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setCount(count + 1);
    setCount(count + 1);  // 只会执行一次更新
    setCount(prevCount => prevCount + 1);  // 正确的方式
    setCount(prevCount => prevCount + 1);
  };
  
  return <button onClick={handleClick}>{count}</button>;
}
```

### 4.3 对象 State

```jsx
// 更新对象 state（不要直接修改）
function Form() {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  
  // ❌ 错误：直接修改
  const handleChange = (e) => {
    formData[e.target.name] = e.target.value;
    setFormData(formData);
  };
  
  // ✅ 正确：创建新对象
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  return (
    <form>
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
      />
      <input
        name="email"
        value={formData.email}
        onChange={handleChange}
      />
    </form>
  );
}
```

### 4.4 数组 State

```jsx
function TodoList() {
  const [todos, setTodos] = useState([]);
  
  // 添加
  const addTodo = (text) => {
    setTodos([...todos, { id: Date.now(), text }]);
  };
  
  // 删除
  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };
  
  // 更新
  const updateTodo = (id, newText) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, text: newText } : todo
    ));
  };
  
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}
```

## 五、事件处理

### 5.1 事件处理基础

```jsx
function Button() {
  // 函数声明
  function handleClick() {
    console.log('Button clicked');
  }
  
  return <button onClick={handleClick}>Click me</button>;
  
  // 箭头函数
  const handleClick = () => {
    console.log('Button clicked');
  };
  
  return <button onClick={handleClick}>Click me</button>;
  
  // 内联箭头函数
  return <button onClick={() => console.log('Clicked')}>Click me</button>;
}
```

### 5.2 传递参数

```jsx
function TodoList({ todos, onDelete }) {
  // 方式1：箭头函数
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>
          {todo.text}
          <button onClick={() => onDelete(todo.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
  
  // 方式2：bind
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>
          {todo.text}
          <button onClick={onDelete.bind(null, todo.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}
```

### 5.3 事件对象

```jsx
function Form() {
  const handleSubmit = (e) => {
    e.preventDefault();  // 阻止默认行为
    console.log('Form submitted');
  };
  
  const handleChange = (e) => {
    console.log('Value:', e.target.value);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## 六、Effect Hook

### 6.1 useEffect 基础

```jsx
import { useEffect } from 'react';

function MyComponent() {
  // 每次渲染后执行
  useEffect(() => {
    // 副作用代码
    console.log('Component rendered');
  });
  
  // 仅在挂载时执行一次
  useEffect(() => {
    console.log('Component mounted');
  }, []);
  
  // 依赖项改变时执行
  const [count, setCount] = useState(0);
  useEffect(() => {
    console.log('Count changed:', count);
  }, [count]);
  
  return <div>Component</div>;
}
```

### 6.2 清理函数

```jsx
function ChatRoom({ roomId }) {
  useEffect(() => {
    const connection = createConnection(roomId);
    connection.connect();
    
    // 清理函数
    return () => {
      connection.disconnect();
    };
  }, [roomId]);
  
  return <h1>Welcome to room {roomId}!</h1>;
}
```

### 6.3 常见使用场景

```jsx
// 订阅事件
function App() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    function handleMove(e) {
      setPosition({ x: e.clientX, y: e.clientY });
    }
    
    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);
  
  return <div>Position: {position.x}, {position.y}</div>;
}

// 数据获取
function Profile({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    let ignore = false;
    
    async function fetchUser() {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      if (!ignore) {
        setUser(data);
      }
    }
    
    fetchUser();
    
    return () => {
      ignore = true;
    };
  }, [userId]);
  
  if (!user) return <div>Loading...</div>;
  return <div>{user.name}</div>;
}
```

## 七、其他常用 Hooks

### 7.1 useContext

```jsx
import { createContext, useContext } from 'react';

// 创建 Context
const ThemeContext = createContext('light');

// 提供 Context
function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  );
}

// 使用 Context
function Toolbar() {
  const theme = useContext(ThemeContext);
  return <div className={theme}>Toolbar</div>;
}
```

### 7.2 useRef

```jsx
import { useRef } from 'react';

function TextInput() {
  const inputRef = useRef(null);
  
  const focusInput = () => {
    inputRef.current.focus();
  };
  
  return (
    <>
      <input ref={inputRef} type="text" />
      <button onClick={focusInput}>Focus Input</button>
    </>
  );
}

// 存储可变值（不触发重新渲染）
function Timer() {
  const countRef = useRef(0);
  
  const increment = () => {
    countRef.current += 1;
    console.log('Count:', countRef.current);
  };
  
  return <button onClick={increment}>Increment</button>;
}
```

### 7.3 useMemo

```jsx
import { useMemo } from 'react';

function ExpensiveComponent({ todos, filter }) {
  // 缓存计算结果
  const visibleTodos = useMemo(() => {
    return todos.filter(todo => todo.status === filter);
  }, [todos, filter]);
  
  return (
    <ul>
      {visibleTodos.map(todo => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}
```

### 7.4 useCallback

```jsx
import { useCallback } from 'react';

function Parent() {
  const [count, setCount] = useState(0);
  
  // 缓存函数引用
  const handleClick = useCallback(() => {
    console.log('Clicked', count);
  }, [count]);
  
  return <Child onClick={handleClick} />;
}

function Child({ onClick }) {
  return <button onClick={onClick}>Click me</button>;
}
```

### 7.5 自定义 Hooks

```jsx
// 自定义 Hook：数据获取
function useData(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    let ignore = false;
    
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(url);
        const json = await response.json();
        if (!ignore) {
          setData(json);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    
    fetchData();
    
    return () => {
      ignore = true;
    };
  }, [url]);
  
  return { data, loading, error };
}

// 使用自定义 Hook
function Profile({ userId }) {
  const { data, loading, error } = useData(`/api/users/${userId}`);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <div>{data.name}</div>;
}

// 自定义 Hook：聊天室
function useChatRoom({ serverUrl, roomId, onReceiveMessage }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    connection.on('message', onReceiveMessage);
    
    return () => {
      connection.disconnect();
    };
  }, [serverUrl, roomId, onReceiveMessage]);
}

// 使用
function ChatRoom({ roomId }) {
  const [serverUrl, setServerUrl] = useState('https://localhost:1234');
  
  useChatRoom({
    serverUrl,
    roomId,
    onReceiveMessage(msg) {
      showNotification('New message: ' + msg);
    }
  });
  
  return <h1>Welcome to room {roomId}!</h1>;
}
```

## 八、表单处理

### 8.1 受控组件

```jsx
function Form() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Name:', name, 'Email:', email);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### 8.2 表单状态管理

```jsx
function Form() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
      />
      <input
        name="email"
        value={formData.email}
        onChange={handleChange}
      />
      <textarea
        name="message"
        value={formData.message}
        onChange={handleChange}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### 8.3 表单验证

```jsx
function Form() {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('typing');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setError(null);
    
    try {
      await submitForm(answer);
      setStatus('success');
    } catch (err) {
      setStatus('typing');
      setError(err);
    }
  };
  
  if (status === 'success') {
    return <h1>That's right!</h1>;
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={status === 'submitting'}
      />
      <button disabled={answer.length === 0 || status === 'submitting'}>
        Submit
      </button>
      {error && <p className="error">{error.message}</p>}
    </form>
  );
}
```

## 九、Context API

### 9.1 创建和使用 Context

```jsx
import { createContext, useContext, useState } from 'react';

// 创建 Context
const ThemeContext = createContext();

// Provider 组件
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 自定义 Hook
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// 使用
function App() {
  return (
    <ThemeProvider>
      <Header />
      <Content />
    </ThemeProvider>
  );
}

function Header() {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className={theme}>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </header>
  );
}
```

## 十、性能优化

### 10.1 React.memo

```jsx
import { memo } from 'react';

// 使用 memo 包装组件（浅比较 props）
const Child = memo(function Child({ name }) {
  return <div>{name}</div>;
});

// 自定义比较函数
const Child = memo(
  function Child({ user }) {
    return <div>{user.name}</div>;
  },
  (prevProps, nextProps) => {
    return prevProps.user.id === nextProps.user.id;
  }
);
```

### 10.2 useMemo 优化计算

```jsx
function ExpensiveComponent({ todos, filter }) {
  // 只有 todos 或 filter 改变时才重新计算
  const filteredTodos = useMemo(() => {
    return todos.filter(todo => todo.status === filter);
  }, [todos, filter]);
  
  return (
    <ul>
      {filteredTodos.map(todo => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}
```

### 10.3 useCallback 优化函数

```jsx
function Parent() {
  const [count, setCount] = useState(0);
  
  // 缓存函数引用，避免子组件不必要的重新渲染
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []);
  
  return <Child onClick={handleClick} />;
}

const Child = memo(function Child({ onClick }) {
  return <button onClick={onClick}>Click me</button>;
});
```

### 10.4 代码分割

```jsx
import { lazy, Suspense } from 'react';

// 懒加载组件
const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

## 十一、React 常用插件整理

### 11.1 路由管理

#### React Router
```bash
npm install react-router-dom
```

```jsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
```

**功能**：
- 声明式路由
- 嵌套路由
- 路由守卫
- 代码分割
- 服务端渲染支持

### 11.2 状态管理

#### Redux Toolkit
```bash
npm install @reduxjs/toolkit react-redux
```

**功能**：
- 全局状态管理
- 中间件支持（如 Redux Thunk、Redux Saga）
- 时间旅行调试
- 适用于大型应用

#### Zustand
```bash
npm install zustand
```

```jsx
import create from 'zustand';

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

function Counter() {
  const { count, increment } = useStore();
  return <button onClick={increment}>{count}</button>;
}
```

**功能**：
- 轻量级状态管理
- 无需 Provider
- 简单的 API
- 适用于中小型应用

#### Jotai / Recoil
- **Jotai**：基于原子化状态管理
- **Recoil**：Facebook 官方状态管理库

### 11.3 UI 组件库

#### Ant Design
```bash
npm install antd
```

**功能**：
- 丰富的组件库
- 企业级 UI 设计
- TypeScript 支持
- 主题定制

#### Material-UI (MUI)
```bash
npm install @mui/material @emotion/react @emotion/styled
```

**功能**：
- Google Material Design
- 完整的组件库
- 主题系统
- 响应式设计

#### Chakra UI
```bash
npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion
```

**功能**：
- 简洁的 API
- 内置主题系统
- 可访问性支持
- 响应式设计

### 11.4 表单处理

#### React Hook Form
```bash
npm install react-hook-form
```

```jsx
import { useForm } from 'react-hook-form';

function Form() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const onSubmit = (data) => {
    console.log(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name', { required: true })} />
      {errors.name && <span>This field is required</span>}
      <button type="submit">Submit</button>
    </form>
  );
}
```

**功能**：
- 高性能表单处理
- 内置验证
- 减少重新渲染
- 易于使用

#### Formik
```bash
npm install formik
```

**功能**：
- 完整的表单解决方案
- 验证支持
- 错误处理

### 11.5 数据获取

#### React Query (TanStack Query)
```bash
npm install @tanstack/react-query
```

```jsx
import { useQuery } from '@tanstack/react-query';

function Profile({ userId }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetch(`/api/users/${userId}`).then(res => res.json())
  });
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <div>{data.name}</div>;
}
```

**功能**：
- 数据获取和缓存
- 自动后台更新
- 乐观更新
- 请求去重

#### SWR
```bash
npm install swr
```

**功能**：
- 数据获取库
- 自动重新验证
- 请求去重
- 本地缓存

### 11.6 样式方案

#### Styled-components
```bash
npm install styled-components
```

```jsx
import styled from 'styled-components';

const Button = styled.button`
  background: ${props => props.primary ? 'blue' : 'white'};
  color: ${props => props.primary ? 'white' : 'blue'};
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
`;

function App() {
  return (
    <>
      <Button>Normal</Button>
      <Button primary>Primary</Button>
    </>
  );
}
```

**功能**：
- CSS-in-JS
- 样式组件化
- 主题支持
- 动态样式

#### Tailwind CSS
```bash
npm install -D tailwindcss postcss autoprefixer
```

**功能**：
- 实用优先的 CSS 框架
- 响应式设计
- 自定义主题
- 快速开发

#### CSS Modules
```jsx
import styles from './Button.module.css';

function Button() {
  return <button className={styles.button}>Click me</button>;
}
```

### 11.7 动画库

#### Framer Motion
```bash
npm install framer-motion
```

```jsx
import { motion } from 'framer-motion';

function App() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      Animated content
    </motion.div>
  );
}
```

**功能**：
- 强大的动画库
- 手势支持
- 布局动画
- 易于使用

#### React Spring
```bash
npm install react-spring
```

**功能**：
- 基于物理的动画
- 性能优化
- 丰富的动画类型

### 11.8 工具库

#### React Helmet
```bash
npm install react-helmet
```

**功能**：
- 管理 document head
- SEO 优化
- 动态 meta 标签

#### React Icons
```bash
npm install react-icons
```

```jsx
import { FaReact, FaGithub } from 'react-icons/fa';

function App() {
  return (
    <div>
      <FaReact />
      <FaGithub />
    </div>
  );
}
```

**功能**：
- 图标库集合
- 支持多种图标库
- 易于使用

#### clsx / classnames
```bash
npm install clsx
```

```jsx
import clsx from 'clsx';

function Button({ primary, disabled }) {
  return (
    <button
      className={clsx('btn', {
        'btn-primary': primary,
        'btn-disabled': disabled
      })}
    >
      Click me
    </button>
  );
}
```

**功能**：
- 条件类名拼接
- 简化 className 逻辑

### 11.9 开发工具

#### React DevTools
- 浏览器扩展
- 组件树查看
- Props 和 State 检查
- 性能分析

#### React Hot Loader / Fast Refresh
```bash
npm install -D @pmmmwh/react-refresh-webpack-plugin react-refresh
```

**功能**：
- 热更新
- 保持组件状态
- 快速开发反馈

### 11.10 测试库

#### React Testing Library
```bash
npm install -D @testing-library/react @testing-library/jest-dom
```

**功能**：
- 组件测试
- 用户行为测试
- 可访问性测试

#### Jest
```bash
npm install -D jest @testing-library/jest-dom
```

**功能**：
- JavaScript 测试框架
- 快照测试
- Mock 功能

### 11.11 国际化

#### React i18next
```bash
npm install react-i18next i18next
```

**功能**：
- 国际化支持
- 多语言切换
- 翻译管理

### 11.12 其他实用库

#### React Markdown
```bash
npm install react-markdown
```

**功能**：
- 渲染 Markdown
- 支持自定义组件
- 插件系统

#### React Window
```bash
npm install react-window
```

**功能**：
- 虚拟滚动
- 大列表优化
- 性能提升

#### React DnD
```bash
npm install react-dnd react-dnd-html5-backend
```

**功能**：
- 拖拽功能
- 复杂交互
- 拖放 API

---

## 十二、最佳实践

### 12.1 组件设计原则
1. **单一职责**：每个组件只做一件事
2. **可复用性**：设计通用的组件
3. **组合优于继承**：使用组合构建复杂 UI
4. **受控组件**：表单元素应该受控
5. **key 属性**：列表渲染必须使用 key

### 12.2 性能优化建议
1. **避免不必要的重新渲染**：使用 `React.memo`、`useMemo`、`useCallback`
2. **代码分割**：使用 `lazy` 和 `Suspense`
3. **虚拟滚动**：处理大列表时使用 `react-window`
4. **图片优化**：使用懒加载和适当的格式

### 12.3 代码规范
1. **组件命名**：使用 PascalCase
2. **Hook 命名**：使用 `use` 前缀
3. **Props 类型**：使用 TypeScript 或 PropTypes
4. **代码组织**：按功能组织文件

### 12.4 常见错误
1. **直接修改 state**：应该创建新对象/数组
2. **忘记依赖项**：useEffect 依赖项要完整
3. **无限循环**：避免在 useEffect 中触发状态更新导致循环
4. **key 不稳定**：不要使用数组索引作为 key

---

**学习资源**：
- [React 官方文档](https://react.dev/)
- [React Beta 文档](https://beta.react.dev/)
- [React Router 文档](https://reactrouter.com/)
- [Redux Toolkit 文档](https://redux-toolkit.js.org/)
- [React Query 文档](https://tanstack.com/query/latest)

**推荐学习路径**：
1. 掌握 JSX 语法和组件基础
2. 理解 State 和 Props
3. 学习 Hooks（useState、useEffect 等）
4. 掌握事件处理和表单
5. 了解 Context API
6. 学习性能优化技巧
7. 熟悉常用插件和工具库
8. 实践项目开发
