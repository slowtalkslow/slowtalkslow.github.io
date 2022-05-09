---
title: "Ready for GSAP"
description: "Scrolling Sakura Card from Cardcaptor Sakura"
date: Created
tags: 
  - Tutorial
  - JavaScript
  - GSAP
---

在做了几个使用canvas模拟不同粒子运动的 ✏️ 后，我感觉canvas的动画流畅性并不太让我满意，最近看过一些GSAP ✏️ 实现的粒子运动动画，肉眼看上去动画效果十分顺滑，因此记录一下入门GSAP的过程。

## What is GSAP

GSAP ( The GreenSock Animation Platform ) 是一套用于脚本动画的工具，简单来说就是可以让CSS属性、SVG、canvas这些JavaScript能操作的东西动起来，并且更好地控制动画。

## Let's start

从GSAP官方的 [✏️](https://codepen.io/GreenSock/ "✏️") fork一个Infinite Scrolling Cards with GSAP and ScrollTrigger

我把card的样式替换成了小樱牌，图片来自[https://ccsakura.fandom.com/wiki/Clow\_Cards](https://ccsakura.fandom.com/wiki/Clow_Cards "https://ccsakura.fandom.com/wiki/Clow_Cards")

## GSAP

注册ScrollTrigger插件

```javascript
gsap.registerPlugin(ScrollTrigger);

```

定义全局变量

```javascript
let iteration = 0; // 从顶部滚动到底部的次数

const spacing = 0.1, // 卡牌之间的间隔

  snap = gsap.utils.snap(spacing), // 调用snap(n)捕捉离spacing最近的增量
  
  cards = gsap.utils.toArray('.cards li'), // 将类数组对象转换为Array
  
  seamlessLoop = buildSeamlessLoop(cards, spacing), // cards动画timeline
  
  scrub = gsap.to(seamlessLoop, {
    totalTime: 0,
    duration: 0.5,
    ease: "power3",
    paused: true
  }),
  
  trigger = ScrollTrigger.create({ // ScrollTrigger实例
    start: 0,
    onUpdate(self) {
      if (self.progress === 1 && self.direction > 0 && !self.wrapping) {
        wrapForward(self);
      } else if (self.progress < 1e-5 && self.direction < 0 && !self.wrapping) {
        wrapBackward(self);
      } else {
        scrub.vars.totalTime = snap(
          (iteration + self.progress) * seamlessLoop.duration()
        );
        scrub.invalidate().restart(); 
        self.wrapping = false;
      }
    },
    end: "+=3000",
    pin: ".gallery"
  });

```

给cards每一项加动画

解释一下overlap的作用：

我们可以看到界面上无缝循环的效果是中心卡牌左右都是有卡牌的

如果for中仅仅到cards数组长度就结束的话，那index为0的卡牌左边就没有卡牌了

所以设置了overlap，这里overlap的值是10，相当于多放了20张卡牌

rawSequence.time(startTime) 中startTime为5.7，即界面上有7张卡牌时，time分别为

5.0  |  5.1  |  5.2  |  5.3  |  5.4  |  5.5  |  5.6

```javascript
const seamlessLoop = buildSeamlessLoop(cards, spacing);

function buildSeamlessLoop(items, spacing) {

  let overlap = Math.ceil(1 / spacing), // start或end的额外动画数量，用来适应无缝循环
    
    startTime = items.length * spacing + 0.5,
    
    loopTime = (items.length + overlap) * spacing + 1, 
    
    rawSequence = gsap.timeline({paused: true}),
    
    seamlessLoop = gsap.timeline({
      paused: true,
      repeat: -1,
    }),
    
    l = items.length + overlap * 2, 
    
    time = 0, 
    
    i, index, item;

  // 数组设置初始值
  gsap.set(items, {xPercent: 400, opacity: 0, scale: 0});

  // 记住必须创建多余的items，以适应无缝循环
  for (let i = 0; i < l; i++) {
    index = i % items.length;
    item = items[index];
    time = i * spacing;
    rawSequence.fromTo(item, {
      scale: 0, 
      opacity: 0
    }, {
      scale: 1, 
      opacity: 1, 
      zIndex: 100, 
      duration: 0.5, 
      yoyo: true, 
      repeat: 1,
      ease: "power1.in", 
      immediateRender: false
    }, time)
    .fromTo(item, {xPercent: 400}, {
      xPercent: -400, 
      duration: 1, 
      ease: "none", 
      immediateRender: false
    }, time);
  }
  
  // 设置播放头位置为startTime
  rawSequence.time(startTime);
  
  // seamlessLoop中每个tween都加上动画
  seamlessLoop.to(rawSequence, {
    time: loopTime,
    duration: loopTime - startTime,
    ease: "none"
  }).fromTo(rawSequence, { time: overlap * spacing + 1 }, {
    time: startTime,
    duration: startTime - (overlap * spacing + 1),
    immediateRender: false,
    ease: "none"
  });
  
  return seamlessLoop;
}

```

seamlessLoop加动画

```javascript
const scrub = gsap.to(seamlessLoop, {
  totalTime: 0,   // 总时间
  duration: 0.5,  // 动画持续时间
  ease: "power3", // 控制动画变化率
  paused: true    // 动画在创建后立即暂停
})
```

创建ScrollTrigger 实例，根据trigger的progress属性判断下一步动作

如果滚动条滚动到最底部还要向下滚动，那么就wrapForward

如果滚动条滚动到最顶部还要向上滚动，那么就wrapBackward

其他时候更新totalTime并且启动scrub动画，即滚动seamlessLoop timeline

```javascript
trigger = ScrollTrigger.create({
  // 确定ScrollTrigger的起始位置
  start: 0,
  // 传入ScrollTrigger实例，当实例的progress发生改变时调用onUpdate
  onUpdate(self) {
    // progress为1代表到了最底部，direction为1代表前进，最底部还前进，则回到顶部
    if (self.progress === 1 && self.direction > 0 && !self.wrapping) {
      wrapForward(self);
    }
    // 1e-5为0.000001，direction为-1代表后退，最顶部还后退，则回到底部
    else if (self.progress < 1e-5 && self.direction < 0 && !self.wrapping) {
      wrapBackward(self);
    } 
    else {
      // seamlessLoop.duration() 返回timeline持续时间，即滚动完一次数组的时间
      scrub.vars.totalTime = snap(
        (iteration + self.progress) * seamlessLoop.duration());
        
      // 重新启动动画且不清除vars里的动画时间
      scrub.invalidate().restart();
      self.wrapping = false;
    }
  },
  // 确定ScrollTrigger的结束位置，"+=3000"表示起始位置后3000px
  end: "+=3000",
  pin: ".gallery"
});

// 滚动到底部时，无缝循环到顶部
function wrapForward(trigger) {
  trigger.wrapping = true;
  trigger.scroll(trigger.start + 1);
}

// 滚动到顶部时，无缝循环到底部
function wrapBackward(trigger) {
  iteration--;
  if (iteration < 0) { 
    iteration = 9;
    seamlessLoop.totalTime(seamlessLoop.totalTime() + seamlessLoop.duration() * 10);
    scrub.pause();
  }
  trigger.wrapping = true;
  trigger.scroll(trigger.end - 1);
}

```

## Take a look 👀

{% codepen "https://codepen.io/slowtalkslow/pen/wvyMjvX?editors=0010" %}
