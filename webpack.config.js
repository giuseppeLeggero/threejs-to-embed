module.exports = {
  // メインとなるJavaScriptファイル（エントリーポイント）
  entry: {
    "DemoIcons_4000": './src/DemoIcons_4000.ts',
    "DemoCubes": './src/DemoCubes.ts',
    "DemoIcons_1": './src/DemoIcons_1.ts',
    "DemoIcons_2": './src/DemoIcons_2.ts',
  },
  // ファイルの出力設定
  output: {
    //  出力ファイルのディレクトリ名
    path: `${__dirname}/dist`,
    // 出力ファイル名
    filename: 'bundle.[name].js'
  },
  module: {
    rules: [{
        // 拡張子 .ts の場合
        test: /\.ts$/,
        // TypeScript をコンパイルする
        use: 'ts-loader'
      },
      {
        test: /\.css/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              url: false
            }
          },
        ],
      },
    ]
  },
  // import 文で .ts ファイルを解決するため
  resolve: {
    extensions: [
      '.ts', '.js'
    ],
  },
  // webpack-serve の設定
  serve: {
    open: true,
    content: './dist'
  }
};