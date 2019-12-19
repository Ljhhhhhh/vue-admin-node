<template>
  <div class="singleImageUpload2 upload-container">
    <el-upload
      :action="action"
      :headers="headers"
      :multiple="false"
      :limit="1"
      :before-upload="beforeUpload"
      :on-success="onSuccess"
      :on-error="onError"
      :on-remove="onRemove"
      :file-list="fileList"
      :on-exceed="onExceed"
      :disabled="disabled"
      drag
      show-file-list
      class="image-uploader"
      accept="application/epub+zip"
    >
      <i class="el-icon-upload" />
      <div v-if="fileList.length === 0" class="el-upload__text">
        请将电子书拖入或
        <em>点击上传</em>
      </div>
      <div v-else class="el-upload__text">
        图书已上传
      </div>
    </el-upload>
  </div>
</template>

<script>
  import { getToken } from '@/utils/auth'

  export default {
    name: 'EbookUpload',
    props: {
      fileList: {
        type: Array,
        default() {
          return []
        }
      },
      disabled: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        action: `${process.env.VUE_APP_BASE_API}book/upload`
      }
    },
    computed: {
      headers() {
        return {
          Authorization: `Bearer ${getToken()}`
        }
      }
    },
    methods: {
      onRemove() {
        this.$message({
          message: '电子书删除成功',
          type: 'success'
        })
        this.$emit('onRemove')
      },
      onExceed() {
        this.$message({
          message: '每次只能上传一本电子书',
          type: 'warning'
        })
      },
      beforeUpload(file) {
        this.$emit('beforeUpload', file)
      },
      onSuccess(response, file) {
        console.log('onSuccess', response, file)
        const { code, msg, data } = response
        if (code !== 0) {
          this.$message({
            message: (msg && `上传失败，失败原因：${msg}`) || '上传失败',
            type: 'error'
          })
          this.$emit('onError', data)
        } else {
          this.$message({
            message: '上传成功',
            type: 'success'
          })
          this.$emit('onSuccess', data)
        }
      },
      onError(err) {
        const errMsg = (err.message && JSON.parse(err.message)) || '上传失败'
        this.$message({
          message: (errMsg.msg && `上传失败，失败原因：${errMsg.msg}`) || '上传失败',
          type: 'error'
        })
        this.$emit('onError', err)
      }
    }
  }
</script>

<style lang="scss" scoped>
  .upload-container {
    width: 100%;
    height: 100%;
    position: relative;

    .image-uploader {
      height: 100%;
    }
  }
</style>
