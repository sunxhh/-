<template>
  <div class="slider-wrapper">
      <div class="slider-group" ref="sliderGroup">
        <scroll v-bind:slider-width="clientWidth" @change="mchange">
          <slot></slot>
        </scroll>
      </div>
      <div class="dot-group">
        <div class="dot-item" v-for="(item,index) in _sliderList" :class="{'active-dot': index===currentIndex}"></div>
      </div>
  </div>
</template>
<script>
import { getElementClientSize, addClass, removeClass } from "common/js/dom";
import Scroll from "base/scroll/scroll";
export default {
  props: ["sliderNumber"],
  data: function() {
    return {
      clientWidth: 0,
      currentIndex: 0
    };
  },
  components: { Scroll },
  created: function() {},
  mounted: function() {
    this._setSliderWidth();
  },
  computed: {
    _sliderList: function() {
      return new Array(this.sliderNumber || 0);
    }
  },
  methods: {
    // 初始化外层元素的宽度以及内部元素的宽度
    _setSliderWidth: function() {
      let sliderGroup = this.$refs.sliderGroup;
      let width = getElementClientSize(sliderGroup).width;
      this.clientWidth = width;
    },
    mchange: function(num) {
      console.log("slider" + num);
      this.currentIndex = num;
    }
  }
};
</script>
<style lang="stylus" scoped>
@import '~common/stylus/variable.styl';
@import '~common/stylus/mixin.styl';

.slider-wrapper {
  width: 100%;
  overflow: hidden;
  position: relative;

  .dot-group {
    height: 50px;
    display: flex;
    width: 100%;
    justify-content: center;
    align-items: center;
    position: absolute;
    bottom: 0px;

    .dot-item {
      width: 8px;
      height: 8px;
      border-radius: 10px;
      margin: 0px 5px;
      background: rgba(144, 144, 144, 1);

      &.active-dot {
        background: #fff;
        width: 12px;
        height: 12px;
      }
    }
  }
}
</style>
