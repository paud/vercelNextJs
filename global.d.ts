// global.d.ts
// 解决自定义元素 <pwa-install> 的类型报错

declare namespace JSX {
  interface IntrinsicElements {
    "pwa-install": any;
  }
}
