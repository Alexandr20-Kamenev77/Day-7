<template>
  <div>
    <input type="text" id="search-input" v-model="search" placeholder="Пошук за прізвищем">
    <form @submit.prevent="addStudent" class="form-fields">
      <label for="newStudentPhoto">Фото:</label>
      <input type="url" id="newStudentPhoto" v-model="newStudent.photo" placeholder="Фото">
      <label for="newStudentName">ПІБ:</label>
      <input type="text" id="newStudentName" v-model="newStudent.name" placeholder="ПІБ" required>
      <label for="newStudentGroup">Група:</label>
      <select id="newStudentGroup" v-model="newStudent.group">
        <option value="RPZ 20 1/9">RPZ 20 1/9</option>
        <option value="RPZ 20 2/9">RPZ 20 2/9</option>
      </select>
      <label for="newStudentMark">Оцінка:</label>
      <input type="number" id="newStudentMark" v-model="newStudent.mark" placeholder="Оцінка" required>
      <label for="newStudentIsDonePr">Практика:</label>
      <input type="checkbox" id="newStudentIsDonePr" v-model="newStudent.isDonePr">
      <button type="submit">Додати</button>
    </form>
    <div v-if="selectedStudent" class="form-fields">
      <label for="editStudentPhoto">Фото:</label>
      <input type="url" id="editStudentPhoto" v-model="selectedStudent.photo" placeholder="Фото">
      <label for="editStudentName">ПІБ:</label>
      <input type="text" id="editStudentName" v-model="selectedStudent.name" placeholder="ПІБ" required>
      <label for="editStudentGroup">Група:</label>
      <select id="editStudentGroup" v-model="selectedStudent.group">
        <option value="RPZ 20 1/9">RPZ 20 1/9</option>
        <option value="RPZ 20 2/9">RPZ 20 2/9</option>
      </select>
      <label for="editStudentMark">Оцінка:</label>
      <input type="number" id="editStudentMark" v-model="selectedStudent.mark" placeholder="Оцінка" required>
      <label for="editStudentIsDonePr">Практика:</label>
      <input type="checkbox" id="editStudentIsDonePr" v-model="selectedStudent.isDonePr">
      <button @click="saveEditedStudent">Зберегти</button>
    </div>
    <table>
      <thead>
        <tr>
          <th>Фото</th>
          <th>ПІБ</th>
          <th>Група</th>
          <th>Оцінка</th>
          <th>Практика</th>
          <th>Дії</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="student in filteredStudents" :key="student._id">
          <td>
            <a @click="openModal(student)">
              <img v-if="student.photo" :src="student.photo" alt="Фото студента" width="50">
            </a>
          </td>
          <td>
            <router-link :to="'/student-info/' + student._id">{{ student.name }}</router-link>
          </td>
          <td>
            {{ student.group }}
          </td>
          <td>
            {{ student.mark }}
          </td>
          <td>
            <input type="checkbox" v-model="student.isDonePr" @change="updateIsDonePr(student)">
          </td>
          <td>
            <a @click="removeStudent(student._id)" href="#">Видалити</a>
            <a @click="toggleEditing(student)" href="#">
              <i class="fas fa-edit"></i> Редагувати
            </a>
          </td>
        </tr>
      </tbody>
    </table>
    <p>Кількість студентів: {{ studentCount }}</p>
    <div class="modal" :class="{ 'light-table': isLightTheme, 'dark-table': isDarkTheme }" v-if="isModalOpen" @click="closeModal">
    <div class="modal-content" :class="{ 'light-table': isLightTheme, 'dark-table': isDarkTheme }" @click.stop>
    <img :src="selectedStudent.photo" alt="Фото студента">
    <h2>{{ selectedStudent.name }}</h2>
    <p>Група: {{ selectedStudent.group }}</p>
    <p>Оцінка: {{ selectedStudent.mark }}</p>
    <p>Практика: {{ selectedStudent.isDonePr ? 'Завершена' : 'Не завершена' }}</p>
    <p>Кількість студентів: {{ studentCount }}</p>
    <button @click="closeModal">Закрити</button>
  </div>
</div>
  </div>
</template>
<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import axios from 'axios';
export default {
  props: {
    isLightTheme: Boolean,
    isDarkTheme: Boolean
  },
  setup() {
    const apiBaseUrl = 'http://34.82.81.113:3000';
    const store = useStore();
    const isLightTheme = computed(() => store.getters.theme === 'light-theme');
    const isDarkTheme = computed(() => store.getters.theme === 'dark-theme');
    const students = ref([]);
    const search = ref('');
    const newStudent = ref({
      name: '',
      group: '',
      mark: null,
      isDonePr: false,
      photo: '',
    });
    const selectedStudent = ref(null);
    const isModalOpen = ref(false);
    const fetchStudents = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/students`);
        students.value = response.data;
        store.dispatch('updateStudentCount', students.value.length);
      } catch (error) {
        console.error('Помилка при завантаженні студентів:', error);
      }
    };
    const removeStudent = (id) => {
      axios
        .delete(`${apiBaseUrl}/students/${id}`)
        .then(() => {
          const index = students.value.findIndex((student) => student._id === id);
          if (index !== -1) {
            students.value.splice(index, 1);
            store.dispatch('updateStudentCount', students.value.length); 
          }
        })
        .catch((error) => {
          console.error('Помилка при видаленні студента:', error);
        });
    };
    const addStudent = () => {
      axios
        .post(`${apiBaseUrl}/students`, newStudent.value)
        .then((response) => {
          students.value.push(response.data);
          newStudent.value = {
            name: '',
            group: '',
            mark: null,
            isDonePr: false,
            photo: '',
          };
          store.dispatch('updateStudentCount', students.value.length); 
        })
        .catch((error) => {
          console.error('Помилка при додаванні студента:', error);
        });
    };
    const updateIsDonePr = (student) => {
      const apiUrl = `${apiBaseUrl}/students/${student._id}`;
      const data = { isDonePr: student.isDonePr };
      axios
        .put(apiUrl, data)
        .then(() => {
          console.log('isDonePr успішно оновлено');
        })
        .catch((error) => {
          console.error('Помилка при оновленні isDonePr', error);
        });
    };
    const toggleEditing = (student) => {
      selectedStudent.value = { ...student };
    };
    const saveEditedStudent = () => {
      if (selectedStudent.value) {
        axios
          .put(`${apiBaseUrl}/students/${selectedStudent.value._id}`, selectedStudent.value)
          .then((response) => {
            const updatedStudent = response.data;
            const index = students.value.findIndex((student) => student._id === updatedStudent._id);
            if (index !== -1) {
              students.value[index] = updatedStudent;
            }
            selectedStudent.value = null;
          })
          .catch((error) => {
            console.error('Помилка при збереженні студента:', error);
          });
      }
    };
    const openModal = (student) => {
      selectedStudent.value = student;
      isModalOpen.value = true;
    };
    const closeModal = () => {
      isModalOpen.value = false;
    };
    const toggleTheme = () => {
      if (isLightTheme.value) {
        store.dispatch('setAppTheme', 'dark-theme');
      } else {
        store.dispatch('setAppTheme', 'light-theme');
      }
    };
    const filteredStudents = computed(() => {
      const searchTerm = search.value.toLowerCase();
      return students.value.map((student) => ({
        ...student,
        nameIsHighlighted: searchTerm && student.name.toLowerCase().includes(searchTerm),
        groupIsHighlighted: searchTerm && student.group.toLowerCase().includes(searchTerm),
      }));
    });
    onMounted(fetchStudents);
    onBeforeUnmount(() => {
    });
    return {
      isLightTheme,
      isDarkTheme,
      students,
      search,
      newStudent,
      selectedStudent,
      isModalOpen,
      fetchStudents,
      removeStudent,
      addStudent,
      updateIsDonePr,
      toggleEditing,
      saveEditedStudent,
      openModal,
      closeModal,
      toggleTheme,
      filteredStudents,
      studentCount: computed(() => store.state.studentCount),
    };
  },
};
</script>