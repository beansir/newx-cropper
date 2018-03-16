import NewxCropper from './NewxCropper.vue'; // 导入组件

const paykeyboard = {
  install (Vue, options) {
    Vue.component(NewxCropper.name, NewxCropper);
  }
};

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(paykeyboard);
}

export default paykeyboard; // 导出..
