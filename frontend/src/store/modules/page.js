import api from "../../api";
import axios from "axios";
import { setInterceptors } from "../interceptors";

function createInstance() {
  const instance = axios.create();
  return setInterceptors(instance);
}

// Token값과 특정 url을 붙여서 셋팅
function createInstanceWithAuth(url) {
  const instance = axios.create({
    baseURL: BASE_URL + `${url}`,
  });
  return setInterceptors(instance);
}

const BASE_URL = "http://15.164.104.218/api/v1/page";
const instanceWithAuth = createInstance();

const pageStore = {
  namespaced: true,

  // initial state
  state: {
    store: {
      page_id: "",
      page_img: null,
      page_text: "",
      page_title: "",
      isKeywordSearch: false,
      selectedKeywords: [],
      pageList: [],
      isKeywordExist: false,
    },
  },

  // getters
  getters: {
    pageList: (state) => {
      return state.store.pageList;
    },
  },

  // mutations
  mutations: {
    SET_PAGE_LIST(state, pages) {
      state.store.pageList = pages;
    },
    SET_PAGE_ID(state, id) {
      state.store.page_id = id;
    },

    SET_PAGE_IMG(state, img) {
      state.store.page_img = img;
      console.log(state.store.page_img);
    },

    SET_PAGE_TEXT(state, text) {
      state.store.page_text = text;
    },

    SET_PAGE_TITLE(state, title) {
      state.store.page_title = title.replace(" ", "");
      console.log(state.store.page_title);
    },

    GET_PAGE_IMG(state) {
      return state.store.page_img;
    },

    SET_IS_KEYWORD_SEARCH(state) {
      state.store.isKeywordSearch = !state.store.isKeywordSearch;
      // state.store.isKeywordSearch = true
      // console.log(state.store.isKeywordSearch)
    },

    SET_SELECTED_KEYWORDS(state, selected) {
      state.store.selectedKeywords = selected;
    },
    SET_IS_KEYWORD_EXIST(state, exist) {
      if (exist == "false") {
        state.store.isKeywordExist = false;
      } else {
        state.store.isKeywordExist = true;
      }
    },

    DELETE_PAGE(state, page) {
      // 찾아서 지우기
      const res = state.store.pageList.filter((item) => item.id != page);
      state.store.pageList = res;
      // console.log(state.store.pageList)
    },
    ADD_PAGE(state, page) {
      state.store.pageList.push(page);
      // console.log(state.store.pageList)
    },
    UPDATE_PAGE(state, page) {
      // 찾아서 바꾸기
      const res = state.store.pageList.map((item) => {
        if (item.id == page.id) {
          return page;
        } else return item;
      });
      // console.log(res)
      state.store.pageList = res;
    },
  },

  // actions
  actions: {
    requestPageList({ commit }, diaryId) {
      return instanceWithAuth.get(`${BASE_URL}/read/${diaryId}`);
    },
    setPageList({ commit }, pages) {
      commit("SET_PAGE_LIST", pages);
    },
    setPageId({ commit }, id) {
      commit("SET_PAGE_ID", id);
    },

    setPageImg({ commit }, img) {
      commit("SET_PAGE_IMG", img);
    },

    setPageText({ commit }, text) {
      commit("SET_PAGE_TEXT", text);
    },

    setPageTitle({ commit }, title) {
      commit("SET_PAGE_TITLE", title);
    },

    getPageImg({ commit }) {
      return commit("GET_PAGE_IMG");
    },

    setIsKeywordSearch({ commit }) {
      commit("SET_IS_KEYWORD_SEARCH");
    },

    // 키워드 분석
    requestKeyword({ commit }, info) {
      return axios.post("http://13.124.43.16:8998/keyword_extraction", info);
    },
    setSelectedKeywords({ commit }, selected) {
      commit("SET_SELECTED_KEYWORDS", selected);
    },
    // 키워드 선택
    requestKeywordImage({ commit }, key) {
      console.log(key.keyword);
      return axios.get("http://13.124.43.16:8998/image/?keyword=" + key.keyword);
    },
    // 감정 추출
    requestEmotion({ commit }, info) {
      return axios.post("http://13.125.248.60:8999/emotion", info);
    },
    //키워드 DB 존재 여부
    requestKeywordExist({ commit }, keyword) {
      return axios.get("http://13.124.43.16:8995/image/" + keyword).then((res) => {
        console.log(res);
        commit("SET_IS_KEYWORD_EXIST", res.data);
      });
    },
    //추천 이미지 생성하기
    requestRecommendImage({ commit }, keyword) {
      return axios.get("http://13.124.43.16:8995/image/recommend/" + keyword);
    },
    // 일기 작성
    requestCreateDiary({ commit }, formData) {
      return instanceWithAuth.post(`${BASE_URL}/create`, formData, { headers: { "Content-Type": "multipart/form-data" } });
    },
    addPage({ commit }, page) {
      commit("ADD_PAGE", page);
    },
    // 일기 삭제
    requestDeletePage({ commit }, info) {
      return instanceWithAuth.delete(`${BASE_URL}/delete`, {
        data: info,
      });
    },
    deletePage({ commit }, page) {
      commit("DELETE_PAGE", page);
    },
    // 일기 조회
    requestReadPage({ commit }, info) {
      return instanceWithAuth.get(`${BASE_URL}/read/${info.diaryId}/${info.pageId}`);
    },
    // 일기 수정
    requestUpdatePage({ commit }, formData) {
      return instanceWithAuth.put(`${BASE_URL}/update`, formData, { headers: { "Content-Type": "multipart/form-data" } });
    },
    updatePage({ commit }, page) {
      commit("UPDATE_PAGE", page);
    },
    //사진 선택시 선택 횟수 증가
    imageCountUp({ commit }, url) {
      console.log(url);
      return axios.get("http://13.124.43.16:8995/image/select/" + url);
    },
  },
};
export default pageStore;
