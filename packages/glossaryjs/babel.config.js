module.exports = {
  "presets": [
    ["@babel/preset-env", {
      modules: "auto",
      useBuiltIns: "entry",
      corejs: 3,
    }]
  ],
  "plugins": [
    ["@babel/plugin-transform-runtime", {
      corejs: 3,
      regenerator: true
    }],
    "@babel/plugin-syntax-dynamic-import"
  ],
  "comments": false,
  "env": {
    "test": {
      "presets": [
        "@babel/preset-env",
      ]
      // "plugins": [ "istanbul" ]
    }
  }
}
