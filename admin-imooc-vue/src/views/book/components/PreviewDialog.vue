<template>
  <span style="padding: 0 10px">
    <el-dialog :title="title" :visible.sync="visible" :modal="false">
      <el-form
        :model="formData"
        label-position="left"
        label-width="70px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="书名">
          <el-input v-model="formData.title" disabled />
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="formData.author" disabled />
        </el-form-item>
        <el-form-item label="出版社">
          <el-input v-model="formData.publisher" disabled />
        </el-form-item>
        <el-form-item label="语言">
          <el-input v-model="formData.language" disabled />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="visible = false">
          关闭
        </el-button>
      </div>
    </el-dialog>
    <span @click="visible = true">
      <slot />
    </span>
  </span>
</template>

<script>
  export default {
    props: {
      title: {
        type: String,
        default: ''
      },
      data: {
        type: Object,
        default() {
          return {}
        }
      }
    },
    data() {
      return {
        visible: false,
        formData: {}
      }
    },
    created() {
      this.formData = Object.assign({}, this.data)
    }
  }
</script>

<style lang="scss" scoped>
</style>
