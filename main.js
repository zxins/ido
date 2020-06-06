import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false

/**
* 检查登录状态
* backpage: 登录返回之前的页面
* backtype: 打开页面的类型[1.redirectTo 2.switchTab]
*/
Vue.prototype.checklogin = function(backpage, backtype) {
	var SUID = uni.getStorageSync('SUID');
	var SRAND = uni.getStorageSync('SRAND');
	var SNAME = uni.getStorageSync('SNAME');
	var SFACE = uni.getStorageSync('SFACE');
	
	if (SUID == '' || SRAND == '' || SFACE == '') {
		uni.redirectTo({
			url: '../login/login?backpage='+backpage+'&backtype='+backtype
		});
		return false;
	}
	return [SUID, SRAND, SNAME, SFACE];
}

var host = 'http://192.168.0.102:5000'
Vue.prototype.apiserver = host + '/api/v1'
Vue.prototype.staticserver = host 

App.mpType = 'app'

const app = new Vue({
	...App
})
app.$mount()
