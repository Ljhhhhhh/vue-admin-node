<template>
  <article-detail :is-edit="false" />
</template>

<script>
import ArticleDetail from './components/Detail'

export default {
  name: 'CreateBook',
  components: { ArticleDetail }
}
</script>

