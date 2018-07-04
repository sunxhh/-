import { getTouchPos, getMoveSpeed, getInertiaMoveLen } from './unit';
const defaultConfig = {
  scrollX: true,
  scrollY: true,
  inertia: true,
  resistance: 2,
  snap: true,
  snapThreshold: 0.3,
};

export default class Scroll {
  constructor(config) {
    this.config = {
      ...defaultConfig,
      ...config
    };
    this.wrapper = config.wrapper;
    this.init();
  }

  init() {
    this.bindle();
  }

  data = {
    // 开始移动
    isStartMove: false,
    // 正在缓动
    inertiaMoveing: null,
    startPos: {},
    // 存放计算移动的速度数据
    movePointList: [],
    // 偏移的位置
    shiftPos: {
      start: {
        x: 0,
        y: 0
      },
      current: {
        x: 0,
        y: 0
      }
    },
  }

  bindle() {
    const wrapper = this.wrapper;
    this.bindlePC(wrapper);
    this.bindleMobile(wrapper);
  }

  // 绑定手机端
  bindlePC(wrapper) {
    wrapper.addEventListener('mousedown', (e) => {
      this.isStartMove = true;
      this.startMove(e);
    });
    wrapper.addEventListener('mousemove', (e) => {
      if (!this.isStartMove) {
        return;
      }
      this.moving(e);
    });
    wrapper.addEventListener('mouseup', () => {
      if (this.isStartMove) {
        this.isStartMove = false;
        this.endMove();
      }
    });
    wrapper.addEventListener('mouseout', (e) => {
      if (this.isStartMove) {
        this.isStartMove = false;
        this.endMove();
      }
    });
  }

  // 绑定移动端
  bindleMobile(wrapper) {
    wrapper.addEventListener('touchstart', (e) => {
      this.isStartMove = true;
      this.startMove(e);
    });
    wrapper.addEventListener('touchmove', (e) => {
      if (!this.isStartMove) {
        return;
      }
      this.moving(e);
    });
    wrapper.addEventListener('touchend', () => {
      if (this.isStartMove) {
        this.isStartMove = false;
        this.endMove();
      }
    });
    wrapper.addEventListener('touchcancel', () => {
      if (this.isStartMove) {
        this.isStartMove = false;
        this.endMove();
      }
    });
  }

  // 停止惯性移动
  stopInertiaMove() {
    this.data.inertiaMoveing &&
      window.cancelAnimationFrame(this.data.inertiaMoveing);
    this.data.inertiaMoveing = null;
  }

  startMove(e) {
    this.data.startPos = getTouchPos(e);
    this.data.movePointList = [];
  }
  // 移动中
  moving(e) {
    let startPos = this.data.startPos;
    let currentPos = Object.assign(getTouchPos(e), {
      timeStamp: e.timeStamp
    });
    if (startPos.x === undefined) {
      return;
    }
    this.data.movePointList.push(currentPos);

    let point = this.getMovePoint(currentPos);
    this.moveWrapper(point);
  }
  // 移动结束的处理
  endMove() {
    let data = this.data;
    data.shiftPos.start = data.shiftPos.current;

    if (this.config.inertia) {
      this.inertiaMove().then(() => {
        this.resetMove();
      });
    }
  }

  // 获取需要移动的位置
  getMovePoint(pos) {
    let data = this.data;
    return {
      x: pos.x - data.startPos.x + data.shiftPos.start.x,
      y: pos.y - data.startPos.y + data.shiftPos.start.y
    };
  }

  // 获取移动的位置通过当前的偏移
  getLastPointByShitPos(shift) {
    let data = this.data;
    return {
      x: shift.x + data.shiftPos.start.x,
      y: shift.y + data.shiftPos.start.y,
    };
  }

  // 移动外层元素
  moveWrapper(point) {
    let wrapper = this.wrapper;
    wrapper.style.transform = `translate(${point.x}px,${point.y}px)`;
    this.data.shiftPos.current = point;
  }

  // 拖动之后的惯性移动
  inertiaMove() {
    let data = this.data;
    let config = this.config;
    let self = this;
    let speedDirection = getMoveSpeed(data.movePointList);

    let radius = Math.atan2(speedDirection.y, speedDirection.x);

    let resistance = config.resistance;
    let xResistance = Math.abs(resistance * Math.cos(radius));
    let yResistance = Math.abs(resistance * Math.sin(radius));

    return new Promise((resolve, reject) => {
      if (Math.abs(speedDirection.x) < 1 && Math.abs(speedDirection.y) < 1) {
        resolve();
        return;
      }

      let count = 0;
      let maxCount = Math.floor(Math.abs(speedDirection.x) / xResistance);

      function getSpeedLen(cSpeed, cCount, cResistance) {
        let curSpeed = cSpeed - cCount * cResistance;
        if (cSpeed < 0) {
          curSpeed = cSpeed + cCount * cResistance;
        }
        return getInertiaMoveLen(cSpeed, cResistance, curSpeed);
      }

      function move() {
        if (count >= maxCount) {
          resolve();
          return;
        }
        let movePointLen = {
          x: getSpeedLen(speedDirection.x, count, xResistance),
          y: getSpeedLen(speedDirection.y, count, yResistance)
        };

        self.moveWrapper(self.getLastPointByShitPos(movePointLen));
        data.inertiaMoveing = window.requestAnimationFrame(move);
        count++;
      }
      move();
    });
  }

  // 移动结束后
  resetMove() {
    let data = this.data;
    data.shiftPos.start = data.shiftPos.current;
    data.startPos = {};
    data.movePoint = [];
    // this.resetPos();
  }
}

new Scroll({
  wrapper: document.getElementById('app')
});
