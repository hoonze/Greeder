<template>
  <div class="right">    
     
    <!-- <div class="page_content_text" v-bind:id="'pct_' + idx" contenteditable="false"></div> -->
    <figure v-if="!backCover" class="back" :style="{backgroundImage: `url(${nextImage})`}"></figure>
    <figure v-if="backCover" class="back" id="back-cover"></figure>
    <figure class="front" :style="{backgroundImage: `url(${curImage})`}"></figure>

    <div id="page-buttons">
      <v-btn icon style="z-index:1000" @click="clickEditPage">
          <v-icon color="blue darken-3">mdi-pencil-outline</v-icon>
      </v-btn>
      <v-dialog
        v-model="deleteDialog"
        persistent
        max-width="290"
      >
          <template v-slot:activator="{ on, attrs }">
              <v-btn icon  v-bind="attrs" v-on="on">
                  <v-icon color="red darken-3">mdi-trash-can-outline</v-icon>
              </v-btn>
          </template>
          <delete-diary isPage=true :diaryId="page.id" :id="page.diaryId" @cancelDeleteDialog="onDeleteDialog"/>
      </v-dialog>
    </div>
  </div>
</template>

<script>
import DeleteDiary from '../main/DeleteDiary.vue'
export default {
  components:{
    DeleteDiary
  },
  props: ['curImage', 'nextImage', 'page', 'idx'],
  data(){
    return{
      deleteDialog: false,
      backCover: true
    }
  },
  created(){
    if(this.nextImage=='back-cover'){
      // console.log('dummy')
      // console.log(this.page)
      this.backCover=true
    }
    else{
      // console.log(this.page)
      this.backCover=false
    }
  },
  mounted(){
    // const textbox = document.getElementById(`pct_${this.idx}`)
    // console.log(textbox)
    // textbox.innerHTML = this.page.pageContent
    // textbox.style.left = this.page.left.toString()+"px"
    // textbox.style.top = this.page.top.toString()+"px"    
  },
  methods:{
    clickDeletePage(e){
      e.stopPropagation()
      // console.log("delete click")
    },
    clickEditPage(){
      // 수정페이지로 가
      this.$router.push({name:'CreatePage', params:{isEdit:true, diaryId:this.page.diaryId, pageId:this.page.id}})
    },
    onDeleteDialog(){
      this.deleteDialog = false
      this.$emit('requestRefresh')
    }
  }
}
</script>

<style>
/* .page_content_text{
  position: fixed !important;
} */
#page-buttons{
  position: absolute;
  top: 5%;
  left: 80%;
}
</style>