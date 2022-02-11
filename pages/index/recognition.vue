<template>
  <view>
    <view v-if="!image">
      <button class="pick-image-button" @click="choseImage">
        选择照片
      </button>
      <view class="pick-image-desc">
        拍摄或选择一张，你需要识别的照片。
      </view>
    </view>
    <view v-else>
      <view class="picked-image-container" >
        <image class="picked-image" :src="image" mode="aspectFit"></image>
        <view class="diode">
          <view class="laser"></view>
        </view>
      </view>
      <view class="recognition-desc">
        识别中...
      </view>
    </view>
  </view>
</template>

<script>
  import { recognizeImage } from "@/utils/api"
  export default {
    data() {
      return {
        image: null
      }
    },
    methods: {
      choseImage() {
        uni.chooseImage({ count: 1 }).then(([_, res]) => {
          if (!res || !res.tempFilePaths.length) { return }
          this.image = res.tempFilePaths[0]
          recognizeImage(this.image).then(([_, res]) => {
            this.image = null
            res = JSON.parse(res.data)
            if (res.success) {
              const gridData = JSON.stringify(res.data)
              uni.navigateTo({
                url: `grid?amendable=1&gridData=${gridData}`
              })
            } else {
              uni.showModal({
                title: "提示",
                content: "抱歉，未识别到有效数独, 建议尝试其它照片",
                mask: true
              })
            }
          })
        })
      }
    }
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
  
  .pick-image-button {
    width: 200upx;
    font-size: 30upx;
    background-color: $blue;
    color: #fff;
    border-radius: 3000upx;
  }
  .pick-image-desc {
    margin-top: 30upx;
    font-size: 30upx;
  }
  .picked-image-container {
    border: 1px solid #eee;
    position: relative;
    width: 700upx;
    height: 700upx;
    padding: 20upx;
    box-sizing: border-box;
    .laser {
      width: 660upx;
      background-color: #09f387;
      height: 1px;
      position: absolute;
      top: 20upx;
      z-index: 2;
      box-shadow: 0 0 20upx #8cefa7;
      animation: scanning 3s infinite;
    }
    .diode {
      animation: beam .01s infinite;
    }
  }
  .picked-image {
    
  }
  .picked-image {
    width: 100%;
    height: 100%;
  }
  .recognition-desc {
    margin-top: 30upx;
    text-align: center;
  }
</style>
