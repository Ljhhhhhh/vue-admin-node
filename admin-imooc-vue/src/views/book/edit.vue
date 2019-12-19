<template>
  <article-detail :is-edit="true" />
</template>

<script>
import ArticleDetail from './components/Detail'

export default {
  name: 'EditBook',
  components: { ArticleDetail }
}
</script>

