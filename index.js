'use strict';

const autoprefixer = require('autoprefixer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PostCssFlexBugFixes = require('postcss-flexbugs-fixes');
const paths = require('razzle/config/paths');

const defaultOptions = {
  postcss: {
    dev: {
      sourceMap: true,
      ident: 'postcss',
    },
    prod: {
      sourceMap: false,
      ident: 'postcss',
    },
    plugins: [
      PostCssFlexBugFixes,
      autoprefixer({
        overrideBrowserslist: ['>1%', 'last 4 versions', 'Firefox ESR', 'not ie < 9'],
        flexbox: 'no-2009',
      }),
    ],
  },
  less: {
    dev: {
      // Fix Ant Design
      javascriptEnabled: true,
      sourceMap: true,
      includePaths: [paths.appNodeModules],
    },
    prod: {
      // XXX Source maps are required for the resolve-url-loader to properly
      // function. Disable them in later stages if you do not want source maps.
      
      // Fix Ant Design
      javascriptEnabled: true,
      sourceMap: true,
      sourceMapContents: false,
      includePaths: [paths.appNodeModules],
    },
  },
  css: {
    dev: {
      sourceMap: true,
      importLoaders: 1,
      modules: false,
    },
    prod: {
      sourceMap: false,
      importLoaders: 1,
      modules: false
    },
  },
  style: {},
  resolveUrl: {
    dev: {},
    prod: {},
  },
};

module.exports = (
  defaultConfig,
  { target, dev },
  webpack,
  userOptions = {}
) => {
  const isServer = target !== 'web';
  const constantEnv = dev ? 'dev' : 'prod';

  const config = Object.assign({}, defaultConfig);

  const options = Object.assign({}, defaultOptions, userOptions);

  const styleLoader = {
    loader: 'style-loader',
    options: options.style,
  };

  const cssLoader = {
    loader: 'css-loader',
    options: options.css[constantEnv],
  };

  const resolveUrlLoader = {
    loader: 'resolve-url-loader',
    options: options.resolveUrl[constantEnv],
  };

  const postCssLoader = {
    loader: 'postcss-loader',
    options: Object.assign({}, options.postcss[constantEnv], {
      plugins: () => options.postcss.plugins,
    }),
  };

  const lessLoader = {
    loader: 'less-loader',
    options: Object.assign({}, options.less[constantEnv]),
  };

  config.module.rules = [
    ...config.module.rules,
    {
      test: /\.less$/,
      use: isServer
        ? [
            {
              loader: 'css-loader',
              options: Object.assign({}, options.css[constantEnv], {
                onlyLocals: true,
              }),
            },
            resolveUrlLoader,
            postCssLoader,
            lessLoader,
          ]
        : [
            styleLoader,
            cssLoader,
            postCssLoader,
            resolveUrlLoader,
            lessLoader,
          ],
    },
  ];

  return config;
};
