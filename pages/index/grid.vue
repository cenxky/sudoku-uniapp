<template>
  <view class="sudoku-container">
    <view class="sudoku-table">
      <view v-if="gridData" v-for="(row, y) in gridData" class="tr" :key="y"
        :class="{ 'block-boder': (y + 1) % sudoku.mode.height === 0 }">
        <view v-for="(value, x) in row" class="td" :key="x" :class="{
            'block-boder': (x + 1) % sudoku.mode.width === 0,
            active: editingCell[0] === x && editingCell[1] === y,
            'x-active': editingCell[0] === x,
            'y-active': editingCell[1] === y,
            'block-active':
              parseInt(editingCell[0] / sudoku.mode.width) ===
                parseInt(x / sudoku.mode.width) &&
              parseInt(editingCell[1] / sudoku.mode.height) ===
                parseInt(y / sudoku.mode.height),
            'filled-number': isFilledValue(x, y),
            'filled-error': !value && invalidRecords[[x, y].join()],
          }">
          <view class="cell" @tap="markCellEditing(x, y)">
            <view v-if="showTips && !value" class="tips">
              <view v-for="(groupedNumbers, idx) in numbersForTips" :key="idx" class="tips-row">
                <text v-for="num in groupedNumbers" :key="num" class="tips-item">
                  {{ sudoku.allowedNumbers(x, y).indexOf(num) >= 0 ? num : "" }}
                </text>
              </view>
            </view>
            <text v-else>
              {{ value || invalidRecords[[x, y].join()] || "" }}
            </text>
          </view>
        </view>
      </view>
    </view>
    <view class="sudoku-actions">
      <view hover-class="bg-grey" class="sudoku-actions-item" @tap="generateSudoku">
        <text class="iconfont icon-sudoku"></text>
        <text>{{ !baseNumbers.length ? "生成数独" : "重新生成" }}</text>
      </view>
      <view hover-class="bg-grey" class="sudoku-actions-item" @tap="canClean && fillValue(0)"
        :class="{ disabled: !canClean }">
        <text class="iconfont icon-eraser"></text>
        <text>清除</text>
      </view>
      <view hover-class="bg-grey" class="sudoku-actions-item" @tap="showTips = !showTips">
        <text class="iconfont icon-pencil"></text>
        <text>{{ showTips ? "关闭提示" : "开启提示" }}</text>
      </view>
      <view hover-class="bg-grey" class="sudoku-actions-item" @tap="solveSudoku">
        <text class="iconfont icon-magic"></text>
        <text>解数独</text>
      </view>
    </view>
    <view class="sudoku-numbers">
      <text v-for="num in numbers" @tap="fillValue(num)" :key="num">
        {{ num }}
      </text>
    </view>
    <fireworks v-if="playCongsAnimation" />
  </view>
</template>

<script>
  import Sudoku from "sudoku-react"
  import fireworks from '@/components/sanshui-fireworks/sanshui-fireworks.vue'
  import {
    arrayChunk
  } from "@/utils"

  export default {
    data() {
      return {
        mode: null,
        sudoku: null,
        gridData: [],
        editingCell: [],
        allowedNumbers: [],
        baseNumbers: [],
        showTips: false,
        isSudokuSolved: false,
        invalidRecords: {},
        playCongsAnimation: false,
      }
    },
    onLoad(option) {
      let mode, grid

      if (option.mode) {
        mode = option.mode
      }

      if (option.modeName) {
        uni.setNavigationBarTitle({
          title: `${option.modeName || "九宫格"}数独`
        })
      }

      if (option.gridData) {
        grid = JSON.parse(option.gridData)
      }

      this.sudoku = new Sudoku({
        mode,
        grid
      })
      this.mode = this.sudoku.mode
      this.gridData = this.sudoku.grid
    },
    computed: {
      numbers() {
        return this.sudoku ? this.sudoku.numbers : []
      },
      numbersForTips() {
        if (!this.sudoku) {
          return []
        }

        return arrayChunk(this.numbers, this.sudoku.mode.height)
      },
      canClean() {
        const [x, y] = this.editingCell
        return (
          this.isFilledValue(...this.editingCell) &&
          this.editingCell.length &&
          this.gridData[y][x] || this.invalidRecords[[x, y].join()]
        )
      },
      currentFilledCoordinates() {
        return this.gridData.reduce((cells, row, y) => {
          row.forEach((num, x) => {
            num && cells.push([x, y].join())
          })
          return cells
        }, [])
      },
      isGridEmpty() {
        return this.gridData.every(row => row.every(value => !value))
      },
      isGridAllFilled() {
        return this.gridData.every(row => row.every(value => value))
      }
    },
    methods: {
      // changeMode(newMode) {
      //   //reset
      //   this.editingCell = []
      //   this.allowedNumbers = []
      //   this.baseNumbers = []
      //   this.showTips = false
      //   // update mode
      //   this.mode = newMode
      //   this.sudoku = new Sudoku({ mode: this.mode })
      //   this.gridData = [...this.sudoku.grid]
      // },
      markCellEditing(x, y) {
        this.editingCell = [x, y]
        this.allowedNumbers = this.sudoku.allowedNumbers(x, y)
      },
      fillValue(num) {
        const [x, y] = this.editingCell

        // Fill num to cell and save to invalid records if raised error
        try {
          this.sudoku.set(x, y, num)
          delete this.invalidRecords[[x, y].join()]
        } catch (e) {
          const point = [x, y].join()
          this.sudoku.set(x, y, 0)
          this.invalidRecords = {
            ...this.invalidRecords,
            [point]: num
          }
        }

        // Retry invalidRecords
        Object.entries(this.invalidRecords).forEach(([point, value]) => {
          const [x, y] = point.split(",").map(x => parseInt(x))
          try {
            this.sudoku.set(x, y, value)
            delete this.invalidRecords[point]
          } catch (e) {
            console.log("Failed to retry invalidRecord", point, value)
          }
        })

        this.gridData = [...this.sudoku.grid]
        this.allowedNumbers = this.sudoku.allowedNumbers(x, y)

        if (this.isGridAllFilled) {
          this.congratulateWhenSolved()
        }
      },
      isRefuseFillValue(num) {
        return this.allowedNumbers.indexOf(num) < 0
      },
      isFilledValue(x, y) {
        return this.baseNumbers.indexOf([x, y].join()) < 0
      },
      generateSudoku() {
        const generate = () => {
          this.sudoku.generate()
          this.gridData = [...this.sudoku.grid]
          this.baseNumbers = this.currentFilledCoordinates
          this.isSudokuSolved = false
          this.invalidRecords = {}
        }

        if (this.isGridEmpty) {
          return generate()
        }

        uni.showModal({
          title: '确认',
          content: '您确定要放弃当前数独吗？',
          success: (res) => {
            if (res.confirm) {
              generate()
            } else if (res.cancel) {
              console.log('Cancelled sudoku generating.')
            }
          }
        })
      },
      solveSudoku() {
        const sudokuSolvedStatus = this.sudoku.solve()

        if (sudokuSolvedStatus) {
          if (!this.baseNumbers.length) {
            this.baseNumbers = this.currentFilledCoordinates
          }
          this.gridData = [...this.sudoku.grid]
          this.isSudokuSolved = true
        } else {
          uni.showModal({
            title: "提示",
            content: "不可思议，此数独竟然无解！",
            showCancel: false
          })
        }
      },
      congratulateWhenSolved() {
        if (this.isSudokuSolved) {
          return
        }

        this.playCongsAnimation = true

        // Load congratulation modal
        setTimeout(() => {
          uni.showModal({
            title: "恭喜",
            content: "太赞了！此数独被您成功破解！",
            showCancel: false,
            mask: false,
            success: (res) => {
              this.playCongsAnimation = false
              this.isSudokuSolved = true
            }
          })
        }, 1000)
      }
    },
    components: {
      fireworks
    }
  }
</script>

<style lang="scss">
  $theme-color: #ffff00;
  $black: #000;
  $grey: #c5c5c5;
  $blue: #1165a4;
  $light-blue: #b5ddfe;
  $pale-blue: #dee6eb;
  $red: #dc3545;
  $light-red: #f8969f;

  page {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
  }

  .sudoku-container {
    font-family: Arial, Helvetica, sans-serif;
    color: #333;
  }

  .sudoku-table {
    width: 100%;
    margin: 0 auto;
    border-top: 2px solid $black;
    border-left: 2px solid $black;
    background-color: #fff;

    .tr {
      display: flex;
    }

    .td {
      flex: 1 1 auto;
      position: relative;
      overflow: hidden;
      font-size: 50upx;
      color: #333;

      &:after {
        content: "";
        display: block;
        margin-top: 100%;
      }

      &.x-active,
      &.y-active,
      &.block-active {
        background-color: $pale-blue;
      }

      &.active {
        background-color: $light-blue;
      }

      &.filled-number {
        color: $blue;
      }

      &.filled-error {
        background-color: $light-red;
        color: $red;
      }

      .cell {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border-right: 1px solid $grey;
        border-bottom: 1px solid $grey;
      }

      .tips {
        width: 100%;
        height: 100%;
        font-size: 20upx;
        display: flex;
        flex-direction: column;

        &-row {
          flex: 1 1 0;
          display: flex;
          justify-content: space-evenly;
        }

        &-item {
          flex: 1 1 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }

    .block-boder {
      &.td {
        border-right: 2px solid $black;

        .cell {
          border-right: 0;
        }
      }

      .td {
        border-bottom: 2px solid $black;

        .cell {
          border-bottom: 0;
        }
      }
    }
  }

  .sudoku-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 50upx;

    &-item {
      text-align: center;
      padding: 0 20upx;

      text {
        font-size: 20upx;
        display: block;
      }

      .iconfont {
        font-size: 70upx;
      }

      &.disabled {
        color: rgba(#333, 0.25);
      }
    }
  }

  .sudoku-numbers {
    margin-top: 50upx;
    display: flex;
    justify-content: center;

    text {
      font-size: 80upx;
      color: $blue;
      padding: 0.1em 0.22em;

      &.disabled {
        color: rgba($blue, 0.25);
      }
    }
  }
</style>
