<template>
	<view class="grace-padding">
		<view class="myface">
			<image :src="myFace" mode="widthFix"></image>
		</view>
		<view class="grace-box-banner" style="margin:30rpx 0;">
			<view class="grace-items" style="margin: 0 auto;">
				<view class="line1"><text>{{user.art_count}}</text></text></view>
				<view class="line2">文章</view>
			</view>
			<view class="grace-items">
				<view class="line1"><text>{{user.integral}}</text></view>
				<view class="line2">积分</view>
			</view>
			<view class="grace-items">
				<view class="line1"><text>{{user.remainder}}</text></view>
				<view class="line2">余额</view>
			</view>
			<view class="grace-items">
				<view class="line1"><text>0</text></view>
				<view class="line2">消息</view>
			</view>
		</view>
		<view class="grace-title grace-nowrap grace-space-between">
			<view class="grace-h5 grace-blod">我的文章</view>
		</view>
		<view class="myart-list" v-for="(item, index) in articleList" :key="index">
			<view class="title">{{item.title}}</view>
			<view class="btns">
				<view :data-artid="item.aid" @tap="editArticle">编辑</view>
				<view :data-artid="item.aid" :data-index="index" @tap="removeArticle">删除</view>
			</view>
		</view>
		<view class="loadMore" @tap="getArtList">{{loadMore}}</view>
	</view>
</template>

<script>
	var loginRes, _self, page;

	export default {
		data() {
			return {
				face: '',
				user: {},
				loadMore: "点击加载更多",
				articleList: []
			}
		},
		methods: {
			getArtList: function() {
				if (this.loadMore != '点击加载更多') {
					return;
				}
				this.loadMore = '加载中...';
				uni.request({
					url: this.apiserver + '/articles',
					method: 'GET',
					data: {
						uid: loginRes[0],
						random: loginRes[1],
						page: page
					},
					success: (res) => {
						this.articleList = this.articleList.concat(Object.values(res.data));
						page++;

						if (res.data.length == 0) {
							this.loadMore = '已经加载全部'
						} else {
							this.loadMore = '点击加载更多';
						}
						return res.data;
					}
				})
			},
			editArticle: function(e) {
				var artId = e.currentTarget.dataset.artid;
				uni.navigateTo({
					url:"../editArt/editArt?artId=" + artId
				});
			},
			removeArticle: function(e) {
				var artId = e.currentTarget.dataset.artid;
				var index = e.currentTarget.dataset.index;
				uni.showModal({
					title: "提示",
					content: "确定要删除吗",
					success: (r) => {
						if (r.confirm == true) {
							uni.request({
								url: this.apiserver + '/article',
								method: 'DELETE',
								header: {
									'content-type': 'application/x-www-form-urlencoded'
								},
								data: {
									uid: loginRes[0],
									random: loginRes[1],
									aid: artId
								},
								success: (res) => {
									if (res.data.deleted == true) {
										uni.showToast({
											title: "已删除",
											icon: "none"
										});
										_self.articleList.splice(index, 1);
									} else {
										uni.showToast({
											title: "删除失败",
											icon: "none"
										})
									}
								}
							})
						}else{
							console.log("???")
						}
					}
				})
			}
		},
		onLoad: function(options) {
			_self = this;
			loginRes = this.checklogin('../my/my', 2)
			if (!loginRes) {
				return false;
			}
			this.face = loginRes[3];
		},
		onShow: function(options) {
			// 加载我的文章
			page = 1;
			this.getArtList();

			// 加载用户信息
			uni.request({
				url: this.apiserver + '/info',
				method: 'GET',
				data: {
					uid: loginRes[0],
					random: loginRes[1]
				},
				success: (res) => {
					console.log(res);
					this.user = res.data;
				}
			})
		}
	}
</script>

<style>
	.myface {
		width: 88px;
		height: 88px;
		border: 5px solid #F1F2F3;
		border-radius: 100%;
		margin: 15px auto;
	}

	.myface image {
		width: 100%;
		border-radius: 100%;
	}

	.myart-list {
		display: flex;
		flex-direction: row;
		width: 100%;
		margin: 8px 0;
		overflow: hidden;
		border-bottom: 1px dashed #D7D8D9;
	}

	.myart-list .title {
		line-height: 2em;
		width: 100%;
	}

	.myart-list .btns {
		display: flex;
		flex-direction: row-reverse;
		line-height: 2em;
		width: 100%;
	}

	.myart-list .btns view {
		float: right;
		padding: 0 6px;
		margin: 0 5px;
		color: #00B26A;
	}

	.myart-list .btns view:last-child {
		color: #F76260;
	}

	.loadMore {
		width: 100%;
		padding: 8px 0;
		text-align: center;
		color: #CCCCCC;
	}
</style>
