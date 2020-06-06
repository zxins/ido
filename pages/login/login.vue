<template>
	<view>
		<!-- #ifdef MP-WEIXIN -->
		<button type="primary" open-type="getUserInfo" @getuserinfo="getUserInfo">使用微信登录</button>
		<!-- #endif -->
	</view>
</template>

<script>
	var sign = require('../../commons/sign.js');
	var pageOptions, session_key, openId;
	
	export default {
		data() {
			return {

			}
		},
		methods: {
			getUserInfo: function(info) {				
				// #ifdef MP-WEIXIN
				console.log(info)
				var sign = uni.getStorageSync('sign');
				uni.request({
					url: this.apiserver + '/login',
					method: 'POST',
					header: {'content-type': 'application/x-www-form-urlencoded'},
					data: {
						openid: openId,
						name: info.detail.userInfo.nickName,
						face: info.detail.userInfo.avatarUrl,
						sign: sign
					},
					success: (res) => {
						console.log(res);
						uni.setStorageSync('SUID', res.data.openid);
						uni.setStorageSync('SRAND', res.data.random);
						uni.setStorageSync('SNAME', res.data.name);
						uni.setStorageSync('SFACE', res.data.face);
						if (pageOptions.backtype == 1){
							uni.redirectTo({
								url: pageOptions.backpage
							});
						}else{
							uni.switchTab({
								url: pageOptions.backpage
							})
						}
					},
					fail: (err) => {
						console.log(err)
					}
				})
				// #endif
			}
		},
		onLoad: function(options) {
			sign.sign(this.apiserver);
			pageOptions = options;
			
			// 微信
			// #ifdef MP-WEIXIN
			uni.login({
				success: (info) => {
					console.log(info);
					uni.request({
						url: this.apiserver + '/wxsession?jscode=' + info.code,
						method: 'GET',
						success: (res) => {
							console.log(res)
							session_key = res.data.session_key;
							openId = res.data.openid;
						}
					})
				}
			})
			// #endif
			
			
			// APP 
			// #ifdef APP-PLUS
			uni.login({
				success: (res) => {
					uni.getUserInfo({
						success: (info) => {
							console.log(info)
							var sign = uni.getStorageSync('sign');
							
							uni.request({
								url: this.apiserver + '/login',
								method: 'POST',
								header: {
									'content-type': 'application/x-www-form-urlencoded'
								},
								data: {
									openid: info.userInfo.openId,
									name: info.userInfo.nickName,
									face: info.userInfo.avatarUrl,
									sign: sign
								},
								success: (res) => {
									console.log(res)
									res = res.data;
									uni.setStorageSync('SUID', res.openid);
									uni.setStorageSync('SRAND', res.random);
									uni.setStorageSync('SNAME', res.name);
									uni.setStorageSync('SFACE', res.face);
									if (options.backtype == 1) {
										uni.redirectTo({
											url: options.backpage
										})
									} else {
										uni.switchTab({
											url: options.backpage
										})
									}
								},
								fail: (err) => {
									console.log(err)
								}
							})
						},
						fail: (err) => {
							console.log(err);
						}
					})
				},
				fail: (err) => {
					console.log(err);
					uni.showToast({
						title: "微信登录授权失败"
					})
				}
			})
			// #endif

		}

	}
</script>

<style>

</style>
