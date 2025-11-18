---
title: Java 基础
description: Java 基础
tag:
  - Java
sidebar: true
outline: [2,3,4]
lastUpdated: true
---

# Java 基础

## 一、Java 语言概述

### 1.1 Java 特点
- **跨平台性**：一次编写，到处运行（Write Once, Run Anywhere）
- **面向对象**：封装、继承、多态
- **简单易学**：语法简洁，自动内存管理
- **安全性**：沙箱机制，防止恶意代码
- **多线程**：内置多线程支持
- **分布式**：支持网络编程

### 1.2 JVM、JRE、JDK 关系
- **JDK (Java Development Kit)**：Java 开发工具包，包含 JRE + 开发工具
- **JRE (Java Runtime Environment)**：Java 运行环境，包含 JVM + 核心类库
- **JVM (Java Virtual Machine)**：Java 虚拟机，执行字节码文件

```
JDK = JRE + 开发工具（javac、java、javadoc等）
JRE = JVM + 核心类库
```

## 二、基础语法

### 2.1 数据类型

#### 基本数据类型（8种）
| 类型 | 字节数 | 取值范围 | 默认值 |
|------|--------|----------|--------|
| byte | 1 | -128 ~ 127 | 0 |
| short | 2 | -32768 ~ 32767 | 0 |
| int | 4 | -2³¹ ~ 2³¹-1 | 0 |
| long | 8 | -2⁶³ ~ 2⁶³-1 | 0L |
| float | 4 | 单精度浮点数 | 0.0f |
| double | 8 | 双精度浮点数 | 0.0d |
| char | 2 | Unicode字符 | '\u0000' |
| boolean | 1 | true/false | false |

#### 引用数据类型
- 类（Class）
- 接口（Interface）
- 数组（Array）
- 字符串（String）

### 2.2 变量与常量

```java
// 变量声明
int age = 25;
String name = "Java";

// 常量（final 关键字）
final int MAX_SIZE = 100;
final String COMPANY = "Oracle";
```

### 2.3 运算符

#### 算术运算符
```java
+  -  *  /  %  ++  --
```

#### 关系运算符
```java
==  !=  >  <  >=  <=
```

#### 逻辑运算符
```java
&&  ||  !  ^
```

#### 位运算符
```java
&  |  ^  ~  <<  >>  >>>
```

#### 赋值运算符
```java
=  +=  -=  *=  /=  %=
```

### 2.4 控制语句

#### 条件语句
```java
// if-else
if (condition) {
    // 代码块
} else if (condition2) {
    // 代码块
} else {
    // 代码块
}

// switch-case
switch (variable) {
    case value1:
        // 代码块
        break;
    case value2:
        // 代码块
        break;
    default:
        // 代码块
}
```

#### 循环语句
```java
// for 循环
for (int i = 0; i < 10; i++) {
    // 代码块
}

// while 循环
while (condition) {
    // 代码块
}

// do-while 循环
do {
    // 代码块
} while (condition);

// 增强 for 循环（foreach）
for (String item : array) {
    // 代码块
}
```

## 三、面向对象编程

### 3.1 类与对象

```java
// 类的定义
public class Person {
    // 成员变量（属性）
    private String name;
    private int age;
    
    // 构造方法
    public Person() {
        // 无参构造
    }
    
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    // 成员方法
    public void setName(String name) {
        this.name = name;
    }
    
    public String getName() {
        return name;
    }
    
    // 方法重载
    public void sayHello() {
        System.out.println("Hello");
    }
    
    public void sayHello(String name) {
        System.out.println("Hello, " + name);
    }
}
```

### 3.2 封装

- **private**：私有，只能在本类中访问
- **default**：默认，同包内可访问
- **protected**：受保护，同包或子类可访问
- **public**：公共，任何地方都可访问

```java
public class Student {
    private String name;  // 私有属性
    
    // 通过 getter/setter 方法访问
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
}
```

### 3.3 继承

```java
// 父类
public class Animal {
    protected String name;
    
    public void eat() {
        System.out.println("动物在吃东西");
    }
}

// 子类继承父类
public class Dog extends Animal {
    public void bark() {
        System.out.println("狗在叫");
    }
    
    // 方法重写
    @Override
    public void eat() {
        System.out.println("狗在吃骨头");
    }
}
```

**继承特点**：
- Java 只支持单继承
- 子类继承父类的非私有成员
- 子类可以重写父类方法
- 使用 `super` 关键字调用父类成员

### 3.4 多态

```java
// 父类引用指向子类对象
Animal animal = new Dog();
animal.eat();  // 运行时多态，调用 Dog 的 eat 方法

// 方法重载（编译时多态）
public void method(int a) {}
public void method(String s) {}
```

**多态实现条件**：
- 继承关系
- 方法重写
- 父类引用指向子类对象

### 3.5 抽象类与接口

#### 抽象类
```java
// 抽象类不能实例化
public abstract class Shape {
    // 抽象方法，子类必须实现
    public abstract double getArea();
    
    // 普通方法
    public void print() {
        System.out.println("这是一个形状");
    }
}

public class Circle extends Shape {
    private double radius;
    
    @Override
    public double getArea() {
        return Math.PI * radius * radius;
    }
}
```

#### 接口
```java
// 接口定义
public interface Flyable {
    // 常量（默认 public static final）
    int MAX_SPEED = 100;
    
    // 抽象方法（默认 public abstract）
    void fly();
    
    // Java 8+ 默认方法
    default void land() {
        System.out.println("着陆");
    }
    
    // Java 8+ 静态方法
    static void info() {
        System.out.println("这是一个飞行接口");
    }
}

// 实现接口
public class Bird implements Flyable {
    @Override
    public void fly() {
        System.out.println("鸟在飞");
    }
}
```

**抽象类 vs 接口**：
- 抽象类可以有构造方法，接口不能
- 抽象类可以有普通成员变量，接口只能有常量
- 抽象类可以有普通方法，接口在 Java 8 前只能有抽象方法
- 一个类只能继承一个抽象类，可以实现多个接口

### 3.6 内部类

```java
public class Outer {
    private int outerVar = 10;
    
    // 成员内部类
    class Inner {
        public void show() {
            System.out.println(outerVar);
        }
    }
    
    // 静态内部类
    static class StaticInner {
        public void show() {
            System.out.println("静态内部类");
        }
    }
    
    // 局部内部类
    public void method() {
        class LocalInner {
            public void show() {
                System.out.println("局部内部类");
            }
        }
    }
    
    // 匿名内部类
    public void anonymous() {
        Runnable r = new Runnable() {
            @Override
            public void run() {
                System.out.println("匿名内部类");
            }
        };
    }
}
```

## 四、常用类

### 4.1 String 类

```java
// String 不可变性
String str1 = "Hello";
String str2 = "Hello";
System.out.println(str1 == str2);  // true，字符串常量池

String str3 = new String("Hello");
System.out.println(str1 == str3);  // false，不同对象

// 常用方法
String str = "Hello World";
str.length();              // 长度
str.charAt(0);             // 获取字符
str.substring(0, 5);       // 截取子串
str.indexOf("World");      // 查找索引
str.replace("World", "Java"); // 替换
str.toUpperCase();         // 转大写
str.toLowerCase();         // 转小写
str.trim();                // 去除首尾空格
str.split(" ");            // 分割字符串
```

**StringBuilder 和 StringBuffer**：
- `StringBuilder`：线程不安全，性能高
- `StringBuffer`：线程安全，性能较低
- 用于频繁字符串拼接操作

```java
StringBuilder sb = new StringBuilder();
sb.append("Hello");
sb.append(" ");
sb.append("World");
String result = sb.toString();
```

### 4.2 包装类

```java
// 基本类型与包装类对应
int -> Integer
long -> Long
double -> Double
boolean -> Boolean
char -> Character

// 自动装箱和拆箱
Integer i = 100;        // 自动装箱
int j = i;              // 自动拆箱

// 常用方法
Integer.parseInt("123");      // 字符串转 int
Integer.valueOf("123");       // 字符串转 Integer
String.valueOf(123);          // int 转字符串
```

### 4.3 Math 类

```java
Math.abs(-10);          // 绝对值
Math.max(10, 20);       // 最大值
Math.min(10, 20);       // 最小值
Math.pow(2, 3);         // 幂运算
Math.sqrt(16);          // 平方根
Math.round(3.6);        // 四舍五入
Math.ceil(3.2);         // 向上取整
Math.floor(3.8);        // 向下取整
Math.random();          // 随机数 [0.0, 1.0)
```

### 4.4 Date 和 Calendar

```java
// Date（已过时，推荐使用新的时间 API）
Date date = new Date();
long time = date.getTime();

// Calendar
Calendar cal = Calendar.getInstance();
cal.set(2024, 0, 1);  // 2024年1月1日
int year = cal.get(Calendar.YEAR);
int month = cal.get(Calendar.MONTH) + 1;

// Java 8+ 新的时间 API
LocalDate date = LocalDate.now();
LocalTime time = LocalTime.now();
LocalDateTime dateTime = LocalDateTime.now();
```

## 五、集合框架

### 5.1 Collection 接口

#### List（有序、可重复）
```java
// ArrayList（数组实现，查询快，增删慢）
List<String> list = new ArrayList<>();
list.add("Java");
list.add("Python");
list.get(0);           // 获取元素
list.remove(0);        // 删除元素
list.size();           // 大小
list.contains("Java"); // 是否包含

// LinkedList（链表实现，增删快，查询慢）
List<String> linkedList = new LinkedList<>();

// Vector（线程安全，已过时）
Vector<String> vector = new Vector<>();
```

#### Set（无序、不可重复）
```java
// HashSet（哈希表实现）
Set<String> set = new HashSet<>();
set.add("Java");
set.add("Java");  // 重复元素不会添加
set.contains("Java");

// LinkedHashSet（有序的 HashSet）
Set<String> linkedSet = new LinkedHashSet<>();

// TreeSet（有序，红黑树实现）
Set<String> treeSet = new TreeSet<>();
```

### 5.2 Map 接口

```java
// HashMap（哈希表实现，无序）
Map<String, Integer> map = new HashMap<>();
map.put("Java", 1);
map.put("Python", 2);
map.get("Java");       // 获取值
map.containsKey("Java"); // 是否包含键
map.containsValue(1);  // 是否包含值
map.remove("Java");    // 删除
map.size();            // 大小

// LinkedHashMap（有序的 HashMap）
Map<String, Integer> linkedMap = new LinkedHashMap<>();

// TreeMap（有序，红黑树实现）
Map<String, Integer> treeMap = new TreeMap<>();

// Hashtable（线程安全，已过时）
Hashtable<String, Integer> table = new Hashtable<>();
```

### 5.3 集合遍历

```java
// List 遍历
List<String> list = new ArrayList<>();
// 方式1：普通 for 循环
for (int i = 0; i < list.size(); i++) {
    System.out.println(list.get(i));
}
// 方式2：增强 for 循环
for (String item : list) {
    System.out.println(item);
}
// 方式3：迭代器
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    System.out.println(it.next());
}

// Map 遍历
Map<String, Integer> map = new HashMap<>();
// 方式1：遍历键
for (String key : map.keySet()) {
    System.out.println(key + "=" + map.get(key));
}
// 方式2：遍历键值对
for (Map.Entry<String, Integer> entry : map.entrySet()) {
    System.out.println(entry.getKey() + "=" + entry.getValue());
}
```

### 5.4 Collections 工具类

```java
List<Integer> list = new ArrayList<>();
Collections.sort(list);           // 排序
Collections.reverse(list);        // 反转
Collections.shuffle(list);        // 随机打乱
Collections.max(list);            // 最大值
Collections.min(list);            // 最小值
Collections.binarySearch(list, 5); // 二分查找
Collections.fill(list, 0);        // 填充
```

## 六、异常处理

### 6.1 异常体系

```
Throwable
├── Error（错误，不可处理）
│   ├── OutOfMemoryError
│   └── StackOverflowError
└── Exception（异常，可处理）
    ├── RuntimeException（运行时异常，非检查异常）
    │   ├── NullPointerException
    │   ├── ArrayIndexOutOfBoundsException
    │   ├── ClassCastException
    │   └── IllegalArgumentException
    └── 其他异常（检查异常）
        ├── IOException
        ├── SQLException
        └── ClassNotFoundException
```

### 6.2 异常处理

```java
// try-catch-finally
try {
    // 可能抛出异常的代码
    int result = 10 / 0;
} catch (ArithmeticException e) {
    // 捕获特定异常
    System.out.println("除零异常：" + e.getMessage());
} catch (Exception e) {
    // 捕获其他异常
    System.out.println("其他异常：" + e.getMessage());
} finally {
    // 无论是否异常都会执行
    System.out.println("清理资源");
}

// try-with-resources（Java 7+）
try (FileInputStream fis = new FileInputStream("file.txt")) {
    // 自动关闭资源
} catch (IOException e) {
    e.printStackTrace();
}

// throws 声明异常
public void method() throws IOException {
    // 方法可能抛出异常
}

// throw 抛出异常
if (age < 0) {
    throw new IllegalArgumentException("年龄不能为负数");
}
```

### 6.3 自定义异常

```java
// 自定义异常类
public class MyException extends Exception {
    public MyException(String message) {
        super(message);
    }
}

// 使用
public void test() throws MyException {
    throw new MyException("自定义异常");
}
```

## 七、IO 流

### 7.1 流的分类

- **按方向**：输入流（InputStream/Reader）、输出流（OutputStream/Writer）
- **按数据类型**：字节流（InputStream/OutputStream）、字符流（Reader/Writer）

### 7.2 字节流

```java
// 文件输入流
FileInputStream fis = new FileInputStream("input.txt");
int data;
while ((data = fis.read()) != -1) {
    System.out.print((char) data);
}
fis.close();

// 文件输出流
FileOutputStream fos = new FileOutputStream("output.txt");
fos.write("Hello World".getBytes());
fos.close();

// 缓冲流（提高效率）
BufferedInputStream bis = new BufferedInputStream(
    new FileInputStream("input.txt"));
BufferedOutputStream bos = new BufferedOutputStream(
    new FileOutputStream("output.txt"));
```

### 7.3 字符流

```java
// 文件读取器
FileReader fr = new FileReader("input.txt");
int data;
while ((data = fr.read()) != -1) {
    System.out.print((char) data);
}
fr.close();

// 文件写入器
FileWriter fw = new FileWriter("output.txt");
fw.write("Hello World");
fw.close();

// 缓冲流
BufferedReader br = new BufferedReader(
    new FileReader("input.txt"));
String line;
while ((line = br.readLine()) != null) {
    System.out.println(line);
}
br.close();
```

### 7.4 对象流（序列化）

```java
// 序列化对象
public class Person implements Serializable {
    private String name;
    private int age;
    // getter/setter...
}

// 写入对象
ObjectOutputStream oos = new ObjectOutputStream(
    new FileOutputStream("person.dat"));
oos.writeObject(new Person("Java", 25));
oos.close();

// 读取对象
ObjectInputStream ois = new ObjectInputStream(
    new FileInputStream("person.dat"));
Person p = (Person) ois.readObject();
ois.close();
```

## 八、多线程

### 8.1 创建线程

```java
// 方式1：继承 Thread 类
class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println("线程运行");
    }
}
MyThread t = new MyThread();
t.start();

// 方式2：实现 Runnable 接口
class MyRunnable implements Runnable {
    @Override
    public void run() {
        System.out.println("线程运行");
    }
}
Thread t = new Thread(new MyRunnable());
t.start();

// 方式3：实现 Callable 接口（有返回值）
class MyCallable implements Callable<String> {
    @Override
    public String call() throws Exception {
        return "线程执行结果";
    }
}
FutureTask<String> task = new FutureTask<>(new MyCallable());
Thread t = new Thread(task);
t.start();
String result = task.get();
```

### 8.2 线程同步

```java
// synchronized 关键字
public synchronized void method() {
    // 同步方法
}

public void method() {
    synchronized (this) {
        // 同步代码块
    }
}

// Lock 接口
Lock lock = new ReentrantLock();
lock.lock();
try {
    // 临界区代码
} finally {
    lock.unlock();
}
```

### 8.3 线程通信

```java
// wait() 和 notify()
public class ProducerConsumer {
    private Object lock = new Object();
    
    public void produce() {
        synchronized (lock) {
            // 生产
            lock.notify();  // 唤醒消费者
        }
    }
    
    public void consume() {
        synchronized (lock) {
            try {
                lock.wait();  // 等待生产者
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            // 消费
        }
    }
}
```

### 8.4 线程池

```java
// 创建线程池
ExecutorService executor = Executors.newFixedThreadPool(5);

// 提交任务
executor.submit(new Runnable() {
    @Override
    public void run() {
        System.out.println("任务执行");
    }
});

// 关闭线程池
executor.shutdown();
```

## 九、反射

```java
// 获取 Class 对象
Class<?> clazz = Class.forName("com.example.Person");
Class<?> clazz2 = Person.class;
Class<?> clazz3 = new Person().getClass();

// 创建对象
Object obj = clazz.newInstance();

// 获取构造方法
Constructor<?> constructor = clazz.getConstructor(String.class, int.class);
Object obj2 = constructor.newInstance("Java", 25);

// 获取方法
Method method = clazz.getMethod("getName");
Object result = method.invoke(obj);

// 获取字段
Field field = clazz.getDeclaredField("name");
field.setAccessible(true);  // 设置可访问
field.set(obj, "New Name");
Object value = field.get(obj);
```

## 十、Lambda 表达式（Java 8+）

```java
// Lambda 表达式语法
(parameters) -> expression
(parameters) -> { statements; }

// 示例
List<String> list = Arrays.asList("Java", "Python", "C++");

// 传统方式
Collections.sort(list, new Comparator<String>() {
    @Override
    public int compare(String s1, String s2) {
        return s1.compareTo(s2);
    }
});

// Lambda 方式
Collections.sort(list, (s1, s2) -> s1.compareTo(s2));

// 方法引用
list.forEach(System.out::println);
```

## 十一、重要概念总结

### 11.1 内存管理
- **堆（Heap）**：存储对象实例
- **栈（Stack）**：存储局部变量和方法调用
- **方法区（Method Area）**：存储类信息、常量、静态变量
- **垃圾回收（GC）**：自动回收不再使用的对象

### 11.2 关键字总结
- **static**：静态的，属于类而非实例
- **final**：最终的，不可修改
- **this**：当前对象引用
- **super**：父类引用
- **instanceof**：类型判断

### 11.3 设计模式（基础）
- **单例模式**：确保类只有一个实例
- **工厂模式**：创建对象而不指定具体类
- **观察者模式**：对象间一对多依赖关系

## 十二、最佳实践

1. **命名规范**：类名大驼峰，方法名小驼峰，常量全大写
2. **代码注释**：使用 JavaDoc 注释
3. **异常处理**：不要捕获异常后忽略，要记录日志
4. **资源管理**：使用 try-with-resources 自动关闭资源
5. **集合使用**：根据场景选择合适的集合类型
6. **线程安全**：多线程环境下注意同步问题
7. **性能优化**：避免不必要的对象创建，合理使用 StringBuilder

---

**学习建议**：
- 多写代码，实践出真知
- 理解面向对象思想
- 掌握集合框架的使用
- 熟悉异常处理机制
- 了解多线程编程
- 关注 Java 新特性（Java 8+）
