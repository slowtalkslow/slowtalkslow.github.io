---
title: "canvas动画模拟粒子运动"
description: "Simulate particle motion with canvas animation"
date: Created
tags: 
  - Tutorial
  - JavaScript
  - CSS
---



## Initialize canvas

在HTML中添加 \<canvas> 元素并通过其id获取到canvas元素

canvas.getContext('2d') 创建一个二维渲染上下文对象，此对象用于绘制图形

```javascript
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

```



## Start with line

为了在canvas上模拟出下雨的动画，可以将三维世界中雨滴的下落抽象化为二维平面中直线的下落

那么我们就从在canvas上绘制直线开始

建立Vector类，表示二维坐标

```javascript
class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  copy () {
    return new Vector(this.x, this.y);
  }
}
```

🎨 stroke 就是一笔一画的意思

```javascript
draw(ctx) {
  // 清空路径
  ctx.beginPath();
  // 移动画笔
  ctx.moveTo(this.pre.x, this.pre.y);
  // 保存两点之间的直线路径
  ctx.lineTo(this.pos.x, this.pos.y);
  // 绘制路径
  ctx.stroke();
}
```



## Class Rain&#x20;

创建Rain类，每滴雨由它的pos和pre作为路径的两头，为了模拟出自由落体运动，设置增量increament

```javascript
class Rain {
  constructor() {
    this.pos = new Vector(Math.random() * canvas.width, -50);
    this.pre = this.pos;
    this.increament = new Vector(0,1);
  }
  
  update() {
    this.pre = this.pos.copy();
    this.increament.y += gravity;
    this.increament.x += wind;
    this.pos.y += this.increament.y;
    this.pos.x += this.increament.x;
  }
  
  draw(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.pos.x, this.pos.y);
    ctx.lineTo(this.pre.x, this.pre.y);
    ctx.stroke();
  }
}
```



## Move raindrop&#x20;

draw() 依次绘制rain数组中的雨滴，神奇的requestAnimationFrame() 一般会按照每秒60次的频率执行回调函数，这样我们就能在画布上看见雨滴从天而降的动画啦

```javascript
let draw = () => {
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#a0b2c9';
  ctx.fillStyle = '#a0b2c9';
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let i = rain.length;
  while(i--) {
    const r = rain[i];
    r.update();
    if (r.pos.y >= canvas.height) {
      rain.splice(i, 1);
    }
    r.draw(ctx);
  }
  rain.push(new Rain());
  // 回调函数自身必须再次调用 window.requestAnimationFrame()
  window.requestAnimationFrame(draw); 
}
```



## Rain splash

落在地上的雨水会四处飞溅，创建Drop类来描述溅起来的雨滴，我们将这些雨滴抽象为小圆点

```javascript
class Drop {
  constructor(x, y) {
    const dist = Math.random() * 5;
    const angle = Math.PI + Math.random() * Math.PI;
    const ny = Math.sin(angle) * dist;
    const nx = Math.cos(angle) * dist;
    this.increament = new Vector(nx, ny);
    this.pos = new Vector(x, y);
  }
  
  update() {
    this.increament.y += gravity;
    this.pos.y += this.increament.y;
    this.pos.x += this.increament.x;
  }
  
  draw (ctx) {
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, 1, 0, Math.PI * 2);
    ctx.fill();
  }
}
```

draw() 中添加两项内容，一是雨滴落地时随机新建一些小圆点并添加进drops数组，二是绘制小圆点落地消失的动画

```javascript
let draw = () => {
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(60,135,235,1)';
  ctx.fillStyle = 'rgba(60,135,235,1)';
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  let i = rain.length;
  while(i--) {
    const r = rain[i];
    r.update();
    if (r.pos.y >= canvas.height) {
      let n = Math.round(4 + Math.random() * 4);
      while(n--) {
        drops.push(new Drop(r.pos.x, canvas.height));
      }
      rain.splice(i, 1);
    }
    r.draw(ctx);
  }
  
  let j = drops.length;
  while (j--) {
    const d = drops[j];
    d.update();
    d.draw(ctx);
    if (d.pos.y >= canvas.height){
      drops.splice(j, 1);
    }
  }
  
  if(Math.random() < 0.5) {
    rain.push(new Rain());
  }
  
  window.requestAnimationFrame(draw);
}
```



## Take a look  👀

在雨滴的基础上还尝试了一下雪花 ☃️ 和烟火 🎆 

{% codepen "https://codepen.io/soonoosoon/pen/eYVpOPP" %}

{% codepen "https://codepen.io/soonoosoon/pen/JjpGEpo" %}

{% codepen "https://codepen.io/soonoosoon/pen/eYVJvJm" %}

