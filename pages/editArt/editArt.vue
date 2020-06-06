<template>
	<view>
		<view class="wrap">
			<view class="write_title">
				<input type="text" v-model="title" placeholder="请输入标题" />
			</view>

			<!-- 内容展示 -->
			<view class="artList">
				<block v-for="(item, index) in artList" :key="index">
					<!-- 显示图片 -->
					<view class="item" v-if="item.type == 'image'">
						<image :src="item.content" :data-index="index" mode="widthFix" @tap="removeImg"></image>
					</view>
					<!-- 显示文字 -->
					<view class="item" v-if="item.type == 'text'">
						<textarea placeholder="" v-model="artList[index].content"></textarea>
						<view :data-index="index" class="deleteText" @tap="deleteText">删除</view>
					</view>
				</block>
			</view>

			<!-- 输入区 -->
			<form @submit="submit">
				<view class="inputArea">
					<view class="addImg" @tap="addImg">+图片</view>
					<view class="addText">
						<textarea name="artText" maxlength="-1" v-model="inputContent" placeholder="请输入文本"></textarea>
						<button type="primary" form-type="submit">添加</button>
					</view>
				</view>
			</form>

			<!-- 选择分类 -->
			<view class="art-cate">
				<view>文章分类</view>
				<view>
					<picker mode="selector" :range="caties" @change="cateChange">
						<view>{{ caties[currentCateIndex]}}</view>
					</picker>
				</view>
			</view>

			<!-- 提交按钮 -->
			<view class="submitNow" v-if="artList.length > 0" @tap="submitNow">
				发布文章
			</view>

		</view>
	</view>
</template>

<script>
	var artId, loginRes, _self;
	var signModel = require('../../commons/sign.js');
	export default {
		data() {
			return {
				title: '',
				artList: [],
				inputContent: "",
				needUploadImg: [],
				uploadIndex: 0,
				// 分类
				caties: ['点击选择'],
				currentCateIndex: 0,
				catiesFromApi: [],
				// 记录真实选择的api接口数据的分类id
				sedCateIndex: 0
			}
		},
		methods: {
			// 添加图片
			addImg: function() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					success: (res) => {
						_self.artList.push({
							"type": "image",
							"content": res.tempFilePaths[0]
						})
					}
				})
			},
			// 删除图片
			removeImg: function(e) {
				var index = e.currentTarget.dataset.index;
				uni.showModal({
					content: "确定要删除此图片吗",
					title: "提示",
					success(e) {
						if (e.confirm) {
							_self.artList.splice(index, 1)
						}
					}
				})
			},
			// 添加文字
			submit: function(res) {
				var content = res.detail.value.artText;
				if (content.length < 1) {
					uni.showToast({
						title: "请输入内容",
						icon: 'none'
					});
					return;
				}
				this.artList.push({
					"type": "text",
					"content": content
				});
				this.inputContent = '';
			},
			// 删除文字
			deleteText: function(e) {
				var index = e.currentTarget.dataset.index;
				uni.showModal({
					content: "确定要删除吗",
					title: "提示",
					success(e) {
						if (e.confirm) {
							_self.artList.splice(index, 1);
						}
					}
				})
			},
			// 选择分类
			cateChange: function(e) {
				var sedCateIndex = e.detail.value;
				this.currentCateIndex = sedCateIndex;
				// 获取选择的分类名称
				if (sedCateIndex < 1) {
					return;
				}
				var cateName = this.caties[sedCateIndex];
				for (var i in this.catiesFromApi) {
					if (cateName == this.catiesFromApi[i]) {
						this.sedCateIndex = i;
						break;
					}
				}
				this.currentCateIndex = sedCateIndex;
			},

			// 发布文章
			submitNow: function() {
				// 数据验证
				if (this.title.length < 2) {
					uni.showToast({
						title: "请输入标题",
						icon: "none"
					});
					return;
				}

				if (this.artList.length < 1) {
					uni.showToast({
						title: "请填写文章内容",
						icon: "none"
					});
					return;
				}

				if (this.currentCateIndex < 1) {
					uni.showToast({
						title: "请选择分类",
						icon: "none",
					});
					return;
				}

				// 上传图片 一次一个多次上传[递归]
				// 上传完成后整体提交数据
				// 首先整理一下需要上传的图片
				this.needUploadImg = [];
				for (var i in this.artList) {
					if (this.artList[i].type == 'image') {
						if (this.artList[i].content.indexOf('192.168.0.102') == -1) {
							this.needUploadImg.push({
								"tmpurl": this.artList[i].content,
								"indexID": i
							})
						}
					}
				}
				this.uploadImg();
			},
			// 上传图片
			uploadImg: function() {
				// 如果没有图片或者已经上传完成，则执行提交
				if (_self.needUploadImg.length < 1 || _self.uploadIndex >= _self.needUploadImg.length) {
					uni.showLoading({
						title: "正在提交"
					});
					// 将信息整合后提交到服务器
					var sign = uni.getStorageSync('sign');
					uni.request({
						url: _self.apiserver + '/article',
						method: 'PUT',
						header: {
							'content-type': 'application/x-www-form-urlencoded'
						},
						data: {
							title: _self.title,
							content: JSON.stringify(_self.artList),
							uid: loginRes[0],
							random: loginRes[1],
							cate: _self.sedCateIndex,
							sign: sign,
							aid: artId
						},
						success: (res) => {
							console.log(res);
							uni.showToast({
								title: "提交成功",
								icon: "none"
							});
							_self.artList = [];
							// 清空数据
							signModel.sign(_self.apiserver);
							// 防止数据缓存
							_self.currentCateIndex = 0;
							_self.sedCateIndex = 0;
							_self.needUploadImg = [];
							_self.uploadIndex = 0;
							_self.title = '';

							// 1秒后跳转
							setTimeout(function() {
								uni.switchTab({
									url: '../my/my'
								})
							}, 1000);
						},
						fail: (err) => {

						},
						complete: () => {

						}
					});
					return;
				}
				// 上传图片
				uni.showLoading({
					title: "上传图片"
				});

				var tmpurl = _self.needUploadImg[_self.uploadIndex].tmpurl;
				console.log(tmpurl);
				var uploader = uni.uploadFile({
					url: _self.apiserver + '/img',
					filePath: tmpurl,
					name: 'file',
					success: (uploadFileRes) => {
						uploadFileRes = JSON.parse(uploadFileRes.data);
						// 上传失败
						// if uploadFileRes.status != 'ok'....

						// 将已经上传的文件地址赋值给文章数据
						var index = _self.needUploadImg[_self.uploadIndex].indexID;
						_self.artList[index].content = _self.staticserver + uploadFileRes.path;
						console.log(_self.artList[index].content)
						_self.uploadIndex++;

						// 递归上传
						setTimeout(function() {
							_self.uploadImg();
						}, 1000);

					},
					fail: (err) => {
						console.log(err)
						uni.showToast({
							title: "上传图片失败",
							icon: "none"
						})
					}
				})
			},
		},
		onLoad: function(options) {
			artId = options.artId;
			_self = this;
			signModel.sign(this.apiserver);
			loginRes = this.checklogin('../my/my', 2);
			if (!loginRes) {
				return false;
			}

			// 加载文章默认值
			uni.request({
				url: this.apiserver + '/article',
				method: 'GET',
				data: {
					'aid': artId
				},
				success: (res) => {
					var art = res.data;
					// 文章内容转换并展示
					var artContent = art.content;
					artContent = JSON.parse(artContent);
					_self.artList = artContent;

					// 默认值赋值
					this.title = art.title;
					// 加载文章分类并设置默认值
					uni.request({
						url: _self.apiserver + '/categories',
						method: 'GET',
						success: (r) => {
							var categories = r.data;
							for (var i in categories) {
								_self.caties.push(categories[i]);
							}
							// 记录分类信息
							_self.catiesFromApi = categories;

							//  获取当前分类的默认值
							_self.sedCateIndex = art.cate;
							// 对应的查找picker的默认值
							var cateName = categories[art.cate];
							for (var i = 0; i < _self.caties.length; i++) {
								if (cateName == _self.caties[1]) {
									_self.currentCateIndex = i;
									break;
								}
							}
							this.currentCateIndex = _self.sedCateIndex;
						}

					});
				}
			});
		}
	}
</script>

<style>

</style>
