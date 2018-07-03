const defaultConfig = {
  scrollX: true,
  scrollY: true,
  inertia: true,
  resistance: 0.1,
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
  }

  init() {
    this.bindle();
  }

  bindle() {

  }
}
