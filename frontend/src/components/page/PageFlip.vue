<template>
  <div class="book-section">
    <div class="container" ref="wrapper">
      <page
        v-for="(page, idx) in list()"
        :key="idx"
        :nextImage="pages[idx].pageImage"
        :curImage="pages[idx + 1].pageImage"
        :page="pages[idx + 1]"
        :idx="idx + 1"
        @requestRefresh="refresh"
      />
      <div class="right">
        <figure class="back" :style="{ backgroundImage: `url(${pages[pages.length - 1].pageImage})` }"></figure>
        <figure class="front" id="cover">
          <div style="margin-top: 40%;">
            <hr />
            <h1>{{ diaryTitle }}</h1>
            <hr />
            <p>{{ diaryDesc }}</p>
          </div>
        </figure>
      </div>
    </div>
    <div id="page-text" contenteditable="false"></div>
    <div id="prev" @click="turnLeft"></div>
    <div id="next" @click="turnRight"></div>
    <div id="create-page-btn">
      <v-tooltip right>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on" @click="clickCreate">
            <v-icon large :color="$vuetify.breakpoint.xs ? 'black' : 'white'">mdi-plus-circle-outline</v-icon>
          </v-btn>
        </template>
        <span>일기 추가하기</span>
      </v-tooltip>

      <!-- <v-btn icon @click="clickCreate" >
          <v-icon :color="$vuetify.breakpoint.xs?'black':'white'" >mdi-plus-circle-outline</v-icon>
      </v-btn> -->
    </div>
    <br />
    <div class="music-container">
      <music-recommend :page="curPage" />
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
import Page from "../../components/page/Page.vue";
import MusicRecommend from "./MusicRecommend.vue";
const diaryStore = "diaryStore";
const pageStore = "pageStore";
const musicStore = "musicStore";
export default {
  components: {
    Page,
    MusicRecommend,
  },
  data() {
    return {
      right: "",
      texts: "",
      si: -1,
      z: 1,
      list: function() {
        let list = [];
        for (let i = 0; i < this.pages.length - 1; i++) {
          list.push(this.pages[i]);
        }
        // console.log(list)
        return list;
      },
      curPage: {
        text: "",
        textMusic: "",
        emotionMusic: "",
      },
      // pages: []
    };
  },
  computed: {
    ...mapGetters(pageStore, ["pageList"]),

    pages() {
      return this.pageList;
    },
    // ...mapState(pageStore, {
    //   pages: state=>state.store.pageList.reverse(),
    // }),
    ...mapState(diaryStore, {
      diaryId: (state) => state.store.diaryId,
      diaryTitle: (state) => state.store.diaryTitle,
      diaryDesc: (state) => state.store.diaryDesc,
    }),
  },
  mounted() {
    // console.log(this.pages)
    // console.log(this.pages[0].pageContent)
    // document.getElementById('page_content_text_back').innerHTML = this.pages[0].pageContent
  },
  created() {
    if (this.pages[0].pageImage == "back-cover") {
      console.log("다시접근해서 삭제+reverse");
      console.log(this.pages);
    } else {
      let dummy = {
        pageImage: "back-cover",
      };
      this.pages.reverse();
      this.pages.unshift(dummy);
      console.log(this.pages);
    }

    this.getterPages;
    setTimeout(() => {
      // HTMLCollection 길이가 0으로 나오는 문제 해결
      this.right = document.getElementsByClassName("right");
      this.texts = document.getElementsByClassName("page_content_text");
      this.si = this.right.length;
    }, 0);
  },
  methods: {
    ...mapActions(pageStore, ["requestPageList", "setPageList"]),
    ...mapActions(diaryStore, ["requestDiaryInfo"]),
    ...mapActions(musicStore, ["requestMusicByText", "requestMusicByPage"]),

    turnRight() {
      if (this.si >= 1) {
        this.si--;
      } else {
        console.log("last page");
      }
      this.musicPlay();
      this.setText();

      if (this.si == 0) {
        document.getElementById("next").style.zIndex = -2;
        document.getElementById("create-page-btn").style.zIndex = 10;
      } else {
        document.getElementById("next").style.zIndex = 999;
        document.getElementById("create-page-btn").style.zIndex = -1;
      }

      this.right[this.si].classList.add("flip");
      this.z++;
      this.right[this.si].style.zIndex = this.z;
    },
    turnLeft() {
      if (this.si < this.right.length) {
        this.si++;
      } else {
        console.log("first page");
      }
      this.musicPlay();
      this.setText();

      if (this.si == 0) {
        document.getElementById("next").style.zIndex = -2;
        document.getElementById("create-page-btn").style.zIndex = 10;
      } else {
        document.getElementById("next").style.zIndex = 999;
        document.getElementById("create-page-btn").style.zIndex = -1;
      }

      this.right[this.si - 1].className = "right";
      this.z++;
      this.right[this.si - 1].style.zIndex = this.z;
    },
    clickCreate(e) {
      this.$router.push({ name: "CreatePage" });
    },
    refresh() {
      // console.log(this.pages)
      // console.log(this.pages.length)
      console.log(this.si);

      if (this.pages.length == 1) {
        // 모든 페이지 삭제되면 최초 작성으로 라우팅
        this.$router.push({ name: "BeforeCreate" });
      } else {
        // document.getElementById('page-text').innerHTML = this.pages[this.si].pageContent
        this.setText();
        this.musicPlay();
      }
    },
    musicPlay() {
      if (this.si == this.right.length) {
        document.getElementById("text-recomm-music").pause();
        return;
      }
      if (this.pages[this.si] && this.si != 0) {
        // 현재 페이지 저장
        let plainText = this.pages[this.si].pageContent.replace(/<[^>]*>/g, ""); // html to plain text
        // console.log(plainText)
        this.curPage.text = plainText;
        let param = {
          writing: plainText,
        };
        this.requestMusicByText(param) // text 기반 음악추천
          .then((res) => {
            // console.log(res)
            this.curPage.textMusic = res.data[0].link;
            document.getElementById("text-recomm-music").load();
          });
      } else {
        document.getElementById("text-recomm-music").pause();
      }
    },
    setText() {
      if (this.pages[this.si] && this.si != 0) {
        let curText = document.getElementById("page-text");
        let realText = this.pages[this.si].pageContent;

        curText.innerHTML = "";
        setTimeout(function() {
          curText.innerHTML = realText;
        }, 500);
        let width = (window.innerWidth - this.$refs.wrapper.clientWidth) / 2;
        let height = (window.innerHeight - this.$refs.wrapper.clientHeight) / 2;
        console.log(width, height);
        if (this.pages[this.si].left) curText.style.left = (this.pages[this.si].left - width).toString() + "px";
        if (this.pages[this.si].top) curText.style.top = this.pages[this.si].top.toString() + "px";
      } else document.getElementById("page-text").innerHTML = "";
    },
  },
};
</script>

<style>
.music-container {
  position: fixed;
  height: 20%;
  width: 100%;
  color: white;
  background-color: rgba(71, 67, 67, 0.7);
  margin: 0;
  padding: 0;
  left: 0;
}
.book-section {
  height: 85vh;
  width: 100%;
  padding: 40px 0;
  text-align: center;
}
.book-section > .container {
  /* height: 400px;
  width: 500px; */
  height: 100%;
  width: 100%;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 2%;
  margin-bottom: 30px;
  perspective: 1200px;
}
.container > .right {
  position: absolute;
  height: 100%;
  width: 50%;
  transition: 0.7s ease-in-out;
  transform-style: preserve-3d;
}
.book-section > .container > .right {
  right: 0;
  transform-origin: left;
  border-radius: 10px 0 0 10px;
}
.right > figure.front,
.right > figure.back {
  margin: 0;
  height: 100%;
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
  background-size: 200%;
  background-repeat: no-repeat;
  backface-visibility: hidden;
  background-color: white;
  overflow: hidden;
}
.right > figure.front {
  background-position: right;
  border-radius: 0 10px 10px 0;
  box-shadow: 2px 2px 15px -2px rgba(0, 0, 0, 0.2);
}
.right > figure.back {
  background-position: left;
  border-radius: 10px 0 0 10px;
  box-shadow: -2px 2px 15px -2px rgba(0, 0, 0, 0.2);
  transform: rotateY(180deg);
}
.flip {
  transform: rotateY(-180deg);
}
.flip::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  width: 100%;
  height: 100%;
  border-radius: 0 10px 10px 0;
  background-color: rgba(0, 0, 0, 0.1);
}
.book-section > button {
  border: 2px solid #ef9f00;
  background-color: transparent;
  color: #ef9f00;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin: 10px;
  transition: 0.3s ease-in-out;
}
.book-section > button:focus,
.book-section > button:active {
  outline: none;
}
.book-section > p {
  color: rgba(0, 0, 0, 0.7);
  font-family: calibri;
  font-size: 24px;
}
.book-section > p > a {
  text-decoration: none;
  color: #ef9f00;
}
.book-section > button:hover {
  background-color: #ef9f00;
  color: #fff;
}
.front#cover,
.back#back-cover {
  background-color: #ffcb63;
  font-family: calibri;
  text-align: left;
  padding: 0 30px;
}
.front#cover h1 {
  /* margin: 40% 0 0 0; */
  text-align: center;
  color: rgb(121, 116, 99);
}
.front#cover hr {
  text-align: center;
  color: rgb(121, 116, 99);
  height: 5px;
  border: none;
}
.front#cover p {
  margin: 10% 0 0 0;
  text-align: center;
  color: rgb(121, 116, 99);
  font-size: 20px;
}

#page-text {
  position: absolute;
  top: 70px;
  left: 0;
}
/* controls */
#prev,
#next {
  position: absolute;
  width: 50%;
  height: 80%;
  z-index: 999;
}
/* #prev:hover, #next:hover {
  background: rgba(0,0,0,0.05);
  cursor: pointer;
} */
#prev {
  top: 10%;
  left: 0;
}
#next {
  top: 20%;
  left: 50%;
}
#create-page-btn {
  position: absolute;
  z-index: -1;
  top: 45%;
  left: 75%;
}
</style>
