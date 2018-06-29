const defaultConfig = {
  scrollX: true,
  scrollY: true,
  inertia: true,
  resistance: 0.1,
  snap: true,
  snapThreshold: 0.3,
  loop: true,
  interval: 4000,
  autoPlay: true,
  slidesToShow: 3
};



class Scroll {
  constructor(config) {
    this.config = {
      ...defaultConfig,
      ...config
    }
    this.wrapper = config.wrapper;
  }
  playList = [];
  maxIndex = 0;
  currentIndex = 0;

  init() {

  }

  resetChildNodes() {
    let wrapper = this.wrapper;
    let childNodes = wrapper.childNodes;
    let playList = [...childNodes];
    let slidesToShow = this.config.slidesToShow;
    playList.forEach((node, index) => {
      node.setAttribute("node-index", index);
    })
    let last = playList.slice(0, slidesToShow - 1);
    let first = playList.slice(0 - (slidesToShow - 1));
    if (last.length < 2) {
      last = [...last, ...last];
      first = [...first, ...first];
    }
    last = last.map(node => {
      return node.cloneNode(true);
    })
    first = first.map(node => {
      return node.cloneNode(true);
    })
    this.playList = [...last, ...playList, ...first];
    this.maxIndex = childNodes.length - 1;
  }
}
