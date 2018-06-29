export function getElementClientSize(dom) {
    return {
        width: dom.clientWidth,
        height: dom.clientHeight
    };
}

export function addClass(dom, className) {
    if (!hasClass(dom, className)) {
        dom.className = `${dom.className} ${className}`;
    }
}

export function removeClass(dom, className) {
    let reg = new RegExp("(^|([\\s]+))(" + className + ")(([\\s]+)|$)", 'g');
    let oldClassName = dom.className;
    oldClassName.replace(reg, "");
}

export function hasClass(dom, className) {
    let reg = new RegExp("(^|([\\s]+))(" + className + ")(([\\s]+)|$)", 'g');
    let oldClassName = dom.className;
    return reg.test(oldClassName);
}
