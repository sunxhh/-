// `<template>
//   <div class="scroll-wrapper" ref="scrollGroup" v-on:touchstart="_touchstart" v-on:touchmove="_touchmove" v-on:touchend="_touchend" v-on:touchcancel="_touchend">
//     <slot></slot>
//   </div>
// </template>`

import { getElementClientSize, addClass, removeClass } from "common/js/dom";

// 获取触摸的位置
function getTouchPos(e) {
  let touch = e.touches[0];
  return {
    x: touch.clientX,
    y: touch.clientY
  };
}

// 获取移动速度
function getMoveSpeed(touchMovePointList) {
  let computeByPointNumber = 3;
  if (touchMovePointList.length < computeByPointNumber) {
    return 0;
  }
  let start = touchMovePointList.slice(
    0 - computeByPointNumber,
    1 - computeByPointNumber
  )[0];
  let end = touchMovePointList.slice(-1)[0];
  let len = end.x - start.x;
  let time = end.timeStamp - start.timeStamp;
  return len / time;
}

// 根据起始速度结束速度摩擦系数计算长度
function getInertiaMoveLen(speed, resistance, endSpeed) {
  if (Math.abs(speed) < 1) {
    return 0;
  }
  endSpeed = endSpeed || 0;
  let len = (speed * speed - endSpeed * endSpeed) / (2 * resistance);
  if (speed < 0) {
    len = 0 - len;
  }
  return len;
}

let defaultConfig = {
  scrollX: true,
  scrollY: true,
  inertia: true,
  resistance: 0.1,
  snap: true,
  snapThreshold: 0.3,
  loop: true,
  interval: 4000,
  autoPlay: true
};

export default class {
  constructor(data) {
    this.data = {
      ...defaultConfig,
      data
    }
    this.wrapper = this.data.wrapper;
  }

  init() {
    setTimeout(() => {
      this.resetNode();
      this.reset();
      this._setSliderWidth();
    }, 50);
  }

  // props: ["sliderWidth"],
  // computed: {
  //   _sliderWidth: function() {
  //     return this.sliderWidth;
  //   }
  // }

  resetNode() {
    let wrapper = this.$refs.scrollGroup;
    if (wrapper.childNodes.length < 2) {
      return;
    }
    let last = wrapper.lastChild.cloneNode(true);
    let first = wrapper.childNodes[0].cloneNode(true);
    wrapper.appendChild(first);
    wrapper.insertBefore(last, wrapper.childNodes[0]);
  }
  // 触摸的一些数据
  touchData = {
    // 元素大小
    clientWidth: 0,
    // group的宽度
    wrapperWidth: 0,
    // 起始位置
    startPos: {},
    // 正在移动的
    inertiaMoveing: null,
    // 偏移
    shifting: {
      start: {
        x: 0,
        y: 0
      },
      current: {
        x: 0,
        y: 0
      }
    },
    // 存放计算移动的速度数据
    movePoint: []
  }

  _touchstart(event) {
    this.stopInertiaMove();
    this.start(getTouchPos(event));
  }

  _touchmove(event) {
    this.moveing(
      Object.assign({}, getTouchPos(event), {
        timeStamp: event.timeStamp
      })
    );
  }

  _touchend(event) {
    this.end();
  }

  // 停止惯性移动
  stopInertiaMove() {
    this.touchData.inertiaMoveing &&
      window.cancelAnimationFrame(this.touchData.inertiaMoveing);
    this.touchData.inertiaMoveing = null;
  }

  // 开始移动
  start(pos) {
    this.touchData.startPos = pos;
    this.touchData.movePoint = [];
  }

  // 移动中
  moveing(currentPos) {
    let startPos = this.touchData.startPos;
    if (startPos.x === undefined) {
      return;
    }
    this.touchData.movePoint.push(currentPos);

    let point = this.getLastPoint(currentPos);
    this.moveWrapper(point);
  }

  // 移动结束的处理
  end() {
    let touchData = this.touchData;
    touchData.shifting.start = touchData.shifting.cur;
    if (this.snap) {
      this.fixed().then(() => {
        this.resetMove();
      });
    } else if (this.inertia) {
      this.inertiaMove().then(() => {
        this.resetMove();
      });
    }
  }

  // 获取移动的位置
  getLastPoint(pos) {
    let touchData = this.touchData;
    return { x: pos.x - touchData.startPos.x + touchData.shifting.start.x };
  }

  // 获取移动的位置通过当前的偏移
  getLastPointByShiting(shifting) {
    let touchData = this.touchData;
    return {
      x: shifting + touchData.shifting.start.x
    };
  }

  // 移动外层元素
  moveWrapper(point) {
    let wrapper = this.$refs.scrollGroup;
    wrapper.style.transform = `translateX(${point.x}px)`;
    this.touchData.shifting.cur = point;
  }

  // 重置
  reset() {
    this.touchData = {
      // 起始位置
      startPos: {},
      // 正在移动的
      inertiaMoveing: null,
      // 偏移
      shifting: {
        start: {
          x: 0 - this.sliderWidth,
          y: 0
        },
        current: {
          x: 0,
          y: 0
        }
      },
      // 存放计算移动的速度数据
      movePoint: []
    };
    let scrollGroup = this.$refs.scrollGroup;
    let childsNumber = scrollGroup.childNodes.length;
    this.touchData.clientWidth = this.sliderWidth;
    this.touchData.wrapperWidth = childsNumber * this.sliderWidth;
    this.moveWrapper(this.touchData.shifting.start);
  }

  // 移动结束后
  resetMove() {
    let touchData = this.touchData;
    touchData.shifting.start = touchData.shifting.cur;
    touchData.startPos = {};
    touchData.movePoint = [];
    this.resetPos();
  }

  sendData() {
    let touchData = this.touchData;
    let x = touchData.shifting.start.x;
    let clientWidth = touchData.clientWidth;
    let number =
      Math.round(Math.abs(touchData.shifting.start.x) / clientWidth) - 1;
    this.$emit("change", number);
  }
  resetPos() {
    let touchData = this.touchData;
    let childsNumber = this.$refs.scrollGroup.childNodes.length;
    let clientWidth = touchData.clientWidth;

    let number = Math.round(
      Math.abs(touchData.shifting.start.x) / clientWidth
    );
    if (number === 0) {
      touchData.shifting.start.x = 0 - clientWidth * (childsNumber - 2);
    } else if (number === childsNumber - 1) {
      touchData.shifting.start.x = 0 - clientWidth;
    }
    this.moveWrapper(touchData.shifting.start);
    this.sendData();
  }

  // 拖动之后的惯性移动
  inertiaMove() {
    let touchData = this.touchData;
    let self = this;

    let speed = getMoveSpeed(touchData.movePoint);
    let resistance = this.resistance;
    console.log(resistance);
    return new Promise((resolve, reject) => {
      if (Math.abs(speed) < 1) {
        resolve();
        return;
      }
      let count = 0;
      let maxCount = Math.floor(Math.abs(speed) / resistance);

      function move() {
        if (count >= maxCount) {
          resolve();
          return;
        }
        let curSpeed = speed - count * resistance;
        if (speed < 0) {
          curSpeed = speed + count * resistance;
        }
        let inertiaLen = getInertiaMoveLen(speed, resistance, curSpeed);
        self.moveWrapper(self.getLastPointByShiting(inertiaLen));
        touchData.inertiaMoveing = window.requestAnimationFrame(move);
        count++;
      }
      move();
    });
  }

  // 固定最后的定位点
  fixed() {
    let touchData = this.touchData;
    let self = this;

    let inertiaLen = getInertiaMoveLen(
      getMoveSpeed(touchData.movePoint),
      self.resistance,
      0
    );

    let clientWidth = touchData.clientWidth;
    let lastPoint = touchData.movePoint.slice(-1)[0];
    let difLen = lastPoint.x - touchData.startPos.x;

    let millisecond = 100;
    let countOnceSecond = 60;
    let count = countOnceSecond * millisecond / 1000;

    if (Math.abs(difLen + inertiaLen) / clientWidth >= self.snapThreshold) {
      if (difLen > 0) {
        difLen = clientWidth - difLen;
      } else {
        difLen = 0 - clientWidth - difLen;
      }
    } else {
      difLen = 0 - difLen;
    }
    let onceDif = difLen / count;

    return new Promise((resolve, reject) => {
      let curCount = 0;

      function move() {
        if (curCount <= count) {
          let curShifting = onceDif * curCount;
          self.moveWrapper(self.getLastPointByShiting(curShifting));
          curCount++;
          touchData.inertiaMoveing = window.requestAnimationFrame(move);
        } else {
          resolve();
        }
      }
      move();
    });
  }

  // 初始化外层元素的宽度以及内部元素的宽度
  _setSliderWidth() {
    let scrollGroup = this.$refs.scrollGroup;
    scrollGroup.style.width = this.touchData.wrapperWidth + "px";

    let clientWidth = this.touchData.clientWidth;
    scrollGroup.childNodes.forEach(child => {
      child.style.width = clientWidth + "px";
      addClass(child, "slider-item");
    });
  }
};
