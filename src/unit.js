// 获取移动端触摸的位置
export function getTouchPos(e) {
  let touch = e.touches ? e.touches[0] : e;

  return {
    x: touch.clientX,
    y: touch.clientY
  };
}

// 获取移动端移动速度
export function getMoveSpeed(movePointList) {
  let computeByPointNumber = 3;
  if (movePointList.length < computeByPointNumber) {
    return {
      x: 0,
      y: 0
    };
  }
  let start = movePointList.slice(
    0 - computeByPointNumber,
    1 - computeByPointNumber
  )[0];
  let end = movePointList.slice(-1)[0];
  let xLen = end.x - start.x;
  let yLen = end.y - start.y;
  console.log(xLen, yLen);
  // 时间按 每秒60次计算
  let time = (end.timeStamp - start.timeStamp) * 6 / 100;
  return {
    x: xLen / time,
    y: yLen / time
  };
}

// 根据起始速度结束速度计算移动长度
export function getInertiaMoveLen(speed, resistance, endSpeed) {
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
