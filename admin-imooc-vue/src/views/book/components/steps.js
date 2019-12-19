const steps = [
  {
    element: '.el-upload-dragger',
    popover: {
      title: '上传电子书',
      description: '点击上传本地的epub电子书',
      position: 'bottom'
    }
  },
  {
    element: '.form-item-author',
    popover: {
      title: '电子书信息',
      description: '电子书上传后会自动解析电子书的信息并填入表单，此时可以对电子书的信息进行编辑',
      position: 'top'
    }
  },
  {
    element: '.submit-btn',
    popover: {
      title: '提交信息',
      description: '将电子书的信息保存到数据库',
      position: 'left'
    }
  }
]

export default steps
