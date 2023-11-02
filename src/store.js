import axios from 'axios';
import { createStore } from 'vuex';
export default createStore({
  state: {
    studentCount: 0,
    students: [],
    theme: 'light-theme', 
  },
  mutations: {
    setStudentCount(state, count) {
      state.studentCount = count;
    },
    updateStudent(state, { index, student }) {
      state.students[index] = student;
    },
    setTheme(state, theme) {
      state.theme = theme;
    },
  },
  getters: {
    theme: (state) => state.theme,
  },
  actions: {
    updateStudentCount({ commit }, count) {
      commit('setStudentCount', count);
    },
    setAppTheme({ commit }, theme) {
      commit('setTheme', theme);
    },
    saveStudent({ commit, state }, updatedStudent) {
      return new Promise((resolve, reject) => {
        axios.put(`${apiBaseUrl}/students/${updatedStudent._id}`, updatedStudent)
          .then((response) => {
            const index = state.students.findIndex((student) => student._id === updatedStudent._id);
            if (index !== -1) {
              commit('updateStudent', { index, student: response.data });
            }
            commit('setStudentCount', state.students.length);
            resolve(response.data);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
  },
});