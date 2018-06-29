// 获取移动端触摸的位置
export function getTouchPos(e) {
  let touch = e.touches[0];
  return {
    x: touch.clientX,
    y: touch.clientY
  };
}

// 获取移动端移动速度
export function getMoveSpeed(touchMovePointList) {
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
