module.exports = {
	lintOnSave: true,

	devServer: {
		proxy: {
			// proxy all requests starting with /api to json place holder
			'/api': {
				target: 'http://localhost:8889', //代理接口
				changeOrigin: true
				// pathRewrite: {
				// 	'^/api': '/mock' //代理的路径
				// }
			}
		}
	}
};
