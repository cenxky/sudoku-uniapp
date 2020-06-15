<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	@import "/common/icons.css";
  @keyframes beam {
    50% {
      opacity: 0;
    }
  }
  @keyframes scanning {
    50% {
      transform: translateY(660upx);
    }
  }
  .bg-grey {
    background-color: #eee;
  }
</style>
