<template>
    <div>
        <div class="cropper-content">
            <input
                @change="openFile"
                ref="cropperInput"
                :id="id + 'File'"
                type='file'
                class="fileInput"/>
            <!-- 预览区 -->
            <div
                v-for="(img, index) in imgs"
                :key="index"
                @click="openCropper(index)"
                class="cropper-btn-show">
                <div class="cropper-preview">
                    <img :src="img"/>
                    <i class="el-icon-circle-close cropper-preview-ope"
                        @click="deleteImg($event, index)">
                    </i>
                </div>
            </div>
            <!-- 预览区 END -->
            <label
                v-show="showAddBtn"
                :for="id + 'File'"
                class="cropper-btn-add">
                <i class="el-icon-plus"></i>
            </label>
        </div>
        <!-- 截图区 -->
        <div class="cropper-bomb-bg" v-if="showCropperBomb">
            <div class="cropper-bomb" :style="cropperBombStyle">
                <div class="cropper-bomb-title">
                    <i class="el-icon-picture-outline"></i> {{title}}
                    <el-button
                        @click="saveCropper"
                        type="success"
                        size="mini"
                        round
                        style="float: right; margin: 12px 0 0 0">
                        <i class="el-icon-check"></i> 确 定
                    </el-button>
                    <el-button
                        v-show="customize && width === 0 && height === 0"
                        @click="closeCropper"
                        type="info"
                        size="mini"
                        round
                        style="float: right; margin: 12px 10px 0 0">
                        <i class="el-icon-close"></i> 取 消
                    </el-button>
                </div>
                <!-- 截图容器 -->
                <div class="cropper-container" :style="cropperBgStyle">
                    <vue-cropper
                        ref="cropper"
                        :img="config.img"
                        :canScale="false"
                        :autoCrop="true"
                        :autoCropWidth="config.autoCropWidth"
                        :autoCropHeight="config.autoCropHeight"
                        :fixedBox="config.fixedBox"
                        :info="showInfo"
                        :fixed="config.fixed"
                        :fixedNumber="config.fixedNumber"
                        :full="true"
                        :outputSize="quality"
                        :outputType="type">
                    </vue-cropper>
                </div>
                <!-- 截图容器 END -->
            </div>
        </div>
        <!-- 截图区 END -->
    </div>
</template>

<script>
    import VueCropper from 'vue-cropper';

    export default {
        name: 'NewxCropper',
        data() {
            return {
                // vue-cropper 配置
                config: {
                    img: '', // 截图的图片数据（base64）
                    autoCropWidth: 300, // 截图框宽度
                    autoCropHeight: 300, // 截图框高度
                    fixed: false, // 是否限制截图框比例
                    fixedNumber: [1, 1], // 截图框比例
                    fixedBox: false, // 是否固定截图框大小
                    target: ''
                },
                imgs: [], // 图片暂存区（base64）
                origins: [], // 图像源
                showCropperBomb: false, // 是否打开截图弹框
                cropperBgStyle: '', // 截图容器样式
                cropperBombStyle: '', // 截图弹框样式
                showAddBtn: true // 是否显示添加图片按钮
            }
        },
        props: {
            // 截图宽度
            width: {
                type: Number,
                default: 0
            },
            // 截图高度
            height: {
                type: Number,
                default: 0
            },
            // 图片上限
            max: {
                type: Number,
                default: 1
            },
            // 弹框标题
            title: {
                type: String,
                default: 'Picture Cropper'
            },
            // 是否显示截图框信息（宽高）
            showInfo: {
                type: Boolean,
                default: false
            },
            // 是否自动开启截图
            auto: {
                type: Boolean,
                default: true
            },
            // 图像数据
            data: {
                type: Array,
                default() {
                    return [];
                }
            },
            // 截图质量（0.1 ~ 1）
            quality: {
                type: Number,
                default: 1
            },
            // 图片类型（jpeg || png || webp）
            type: {
                type: String,
                default: 'jpeg'
            },
            // 唯一标识符（组件被重复加载时需要）
            id: {
                type: String,
                default: 'cropper'
            },
            // 是否自定义截图
            customize: {
                type: Boolean,
                default: true
            }
        },
        methods: {
            // 获取图片
            openFile() {
                if (this.imgs.length >= this.max) {
                    this.onError('图片数量已达到上限');
                    return;
                }

                // 获取图片资源
                let file = this.$refs.cropperInput.files[0];
                document.getElementById(this.id + 'File').value = '';

                // 检查文件类型
                if(!/image\/\w+/.test(file.type)){
                    this.onError('请选择图片类型的文件');
                    return;
                }

                // 解析图片资源
                let reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (e) => {
                    // 保存图像源数据
                    const originsLength = this.origins.push(e.target.result);

                    // 图片数据放入暂存区
                    this.imgs.push(e.target.result);

                    // 是否自动打开截图框
                    if (this.auto) {
                        this.openCropper(originsLength - 1);
                    }
                };
            },
            // 打开截图框
            openCropper(index) {
                const origin = this.origins[index];

                // 上传过的图片已经是最佳尺寸（兼避免跨域获取图片资源的问题）
                if (origin.indexOf('http://') >= 0) {
                    this.onError('图片已是最佳尺寸，无需编辑');
                    return;
                }

                // 获取客户端屏幕高度
                const clientHeight = document.body.clientHeight;

                // 图片信息
                const image = new Image;
                image.src = origin;
                image.crossOrigin = "*";
                image.onload = () => {
                    // let canvas = document.createElement('canvas');
                    // let context = canvas.getContext('2d');
                    // context.drawImage(image, 0, 0);
                    // const imageData = canvas.toDataURL('images/jpeg');

                    const imageWidth = image.width;
                    const imageHeight = image.height;
                    const radio = imageWidth / imageHeight;

                    if (imageWidth <= this.width || imageHeight <= this.height) {
                        this.onError('图片不符合尺寸标准要求，无法编辑');
                        return;
                    }

                    // 截图容器最大高度 60.标题栏高度 40.内边距高度 40.外边距高度
                    const maxHeight = clientHeight - 60 - 40 - 40;

                    // 计算截图容器大小
                    const bgHeight = imageHeight > maxHeight ? maxHeight : imageHeight;
                    const bgWidth = radio * bgHeight;

                    // 截图容器高度（宽度100%）
                    this.cropperBgStyle = 'height: ' + bgHeight + 'px';

                    // 弹框宽度（高度自适应）
                    this.cropperBombStyle = 'width: '+ (bgWidth + 40) + 'px'; // 40.内边距宽度

                    // 计算截图框大小
                    if (this.width > 0) {
                        const cropWidth = bgWidth / (imageWidth / this.width);
                        this.config.autoCropWidth = cropWidth;
                    }
                    if (this.height > 0) {
                        const cropHeight = bgHeight / (imageHeight / this.height);
                        this.config.autoCropHeight = cropHeight;
                    }

                    // 开启截图弹框
                    this.config.img = origin;
                    this.config.target = index;
                    this.showCropperBomb = true;
                };

                image.onerror = () => {
                    this.onError('图片加载失败');
                };
            },
            // 截图保存
            saveCropper() {
                // 获取图片数据方式一：base64
                this.$refs.cropper.getCropData((data) => {
                    this.imgs[this.config.target] = data;
                });

                // 获取图片数据方式二：blob -> base64
                // this.$refs.cropper.getCropBlob((data) => {
                //     var reader = new FileReader();
                //     reader.onload = (e) => {
                //         this.imgs[this.config.target] = e.target.result;
                //     };
                //     reader.readAsDataURL(data);
                // });

                this.showCropperBomb = false;
            },
            // 取消截图
            closeCropper() {
                this.showCropperBomb = false;
            },
            // 移除图片
            deleteImg(event, index) {
                // 阻止冒泡
                if (event && event.stopPropagation) {
                    event.stopPropagation();
                } else {
                    window.event.cancelBubble = true;
                }
                this.imgs.splice(index, 1);
                this.origins.splice(index, 1);
            },
            // 错误信息
            onError(msg) {
                this.$emit('cropperErrorEvent', msg);
            },
            // 实时控制添加图片按钮的显示状态
            addBtnStatus() {
                this.showAddBtn = this.imgs.length >= this.max ? false : true;
            },
            // 初始化数据
            init() {
                if (this.data.length !== this.origins.length && this.data.length !== this.imgs.length) {
                    this.origins = Object.assign([], this.data);
                    this.imgs = Object.assign([], this.data);
                }
            },
            // 更新截图区域的尺寸比例
            updateFixedNumber() {
                if (this.width > 0 && this.height > 0) {
                    this.config.fixedNumber = [this.width, this.height];
                } else {
                    this.config.fixedNumber = [];
                }
            }
        },
        mounted() {
            /*
             |  Props Description
             |-------------------------------|
             |  width     =>  √   ×   √   ×  |
             |  height    =>  √   ×   √   ×  |
             |  customize =>  √   √   ×   ×  |
             |-------------------------------|
             |  Program   =>  P2  P3  P1  P1 |
             |-------------------------------|
             |  P1.固定大小                   |
             |  P2.固定比例                   |
             |  P3.自定义                     |
             |-------------------------------|
            */
            if (this.customize) {
                if (this.width > 0 && this.height > 0) {
                    // P2.固定比例
                    this.config.fixed = true;
                } else {
                    // P3.自定义
                    this.config.fixed = false;
                }
                this.config.fixedBox = false;
            } else {
                // P1.固定大小（宽高不传则按默认配置）
                this.config.fixed = false;
                this.config.fixedBox = true;
            }
            this.updateFixedNumber(); // 更新截图区域的尺寸比例

            this.init(); // 初始化数据
            this.addBtnStatus(); // 实时控制添加图片按钮的显示状态
        },
        watch: {
            imgs(val) {
                // 实时控制添加图片按钮的显示状态
                this.addBtnStatus();

                // 图片数据发送给父组件
                this.$emit('cropperDataEvent', val);
            },
            data() {
                this.init();
            },
            width(val) {
                if (val > 0) {
                    this.updateFixedNumber();
                }
            },
            height(val) {
                if (val > 0) {
                    this.updateFixedNumber();
                }
            }
        },
        components: { vueCropper: VueCropper }
    }
</script>

<style scoped>
    /* 可视区内容 */
    .cropper-content {
        padding: 10px;
        /* border: 1px dashed #D8DCE5; */
        float: left;
    }
    .cropper-btn-add {
        float: left;
        width: 100px;
        height: 100px;
        border: 1px dashed silver;
        line-height: 100px;
        border-radius: 5px;
        cursor: pointer;
        text-align: center;
        font-size: 20px;
        color: silver;
    }
    .cropper-btn-add:hover {
        border: 1px dashed #409EFF;
        color: #409EFF;
    }
    .cropper-btn-show {
        float: left;
        margin-right: 10px;
    }
    .cropper-preview { /* 图片预览区 */
        height: 100px;
        cursor: pointer;
        position: relative;
    }
    .cropper-preview img {
        border-radius: 5px;
        height: 100%;
    }
    .cropper-preview-ope {
        color: red;
        font-size: 20px;
        position: absolute;
        top: 3px;
        right: 3px;
    }
    /* 可视区内容 END */

    /* 截图弹框 */
    .cropper-bomb-bg {
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1;
    }
    .cropper-bomb {
        background: #fff;
        padding: 20px;
        margin: 20px auto;
        box-shadow: 0 0 10px 1px rgba(0, 0, 0, 0.1);
    }
    .cropper-bomb-title {
        width: 100%;
        height: 40px;
        line-height: 40px;
        text-align: left;
        font-size: 16px;
        font-family: 'Microsoft YaHei';
        margin-bottom: 20px;
    }
    .cropper-container { /* 截图容器 */
        width: 100%;
    }
    /* 截图弹框 END */

    .fileInput {
        display: none;
    }
</style>
