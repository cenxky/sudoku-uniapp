<template>
  <view>
    <view class="menu">
      <view
        class="menu-wrapper"
        v-for="(itemValue, itemName) in menus"
        :key="itemValue"
      >
        <navigator
          class="menu-item"
          :url="`grid?mode=${itemValue}&modeName=${itemName}`"
        >
          {{ itemName }}
        </navigator>
      </view>
      <view class="menu-wrapper">
        <navigator class="menu-item" url="recognition">
          <text>扫图识别数独</text>
        </navigator>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        menus: { 九宫格: 9, 八宫格: 8, 六宫格: 6, 四宫格: 4 }
      }
    },
    methods: {}
  }
</script>

<style lang="scss">
  page {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
  }
  .menu {
    padding: 0 50upx;
    .menu-wrapper {
      margin-bottom: 20upx;
    }
    .menu-item {
      width: 300upx;
      padding: 20upx 0;
      text-align: center;
      background-color: #ccc;
      border-radius: 10upx;
    }
  }
</style>
