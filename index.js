new Vue({
  el: "#app",
  data() {
    return {
      lessons: [], // Initially empty; will be loaded from the backend
      cart: [],
      name: "",
      phone: "",
      searchQuery: "",
      sortBy: "subject",
      sortOrder: "asc",
      showCheckoutPage: false,
      nameError: "",
      phoneError: "",
    };
  },
  computed: {
    sortedAndFilteredLessons() {
      const query = this.searchQuery.toLowerCase();
      let filtered = this.lessons.filter((lesson) => {
        return (
          lesson.subject.toLowerCase().includes(query) ||
          lesson.location.toLowerCase().includes(query) ||
          lesson.price.toString().includes(query) ||
          lesson.spaces.toString().includes(query)
        );
      });
      let sorted = filtered.sort((a, b) => {
        let modifier = this.sortOrder === "asc" ? 1 : -1;
        if (a[this.sortBy] < b[this.sortBy]) return -1 * modifier;
        if (a[this.sortBy] > b[this.sortBy]) return 1 * modifier;
        return 0;
      });
      return sorted;
    },
    cartTotal() {
      return this.cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
    },
    validCheckout() {
      return this.name && this.phone && !this.nameError && !this.phoneError;
    },
  },
  methods: {
    async loadLessons() {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/get-lessons"
        );
        this.lessons = response.data;
        console.log(this.lessons); // Debugging line to confirm image paths
      } catch (error) {
        console.error("Failed to load lessons:", error);
      }
    },
    // Method to update a lesson
    async updateLesson(lessonId, updateData) {
      try {
        const response = await axios.put(
          `http://localhost:5000/api/update-lesson/${lessonId}`,
          updateData
        );
        alert("Lesson updated successfully!");
        this.loadLessons(); // Refresh lesson list to show updated data
      } catch (error) {
        console.error("Failed to update lesson:", error);
        alert("Error updating lesson.");
      }
    },
    toggleSortOrder() {
      this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
    },
    addToCart(lesson) {
      if (lesson.spaces > 0) {
        lesson.spaces -= 1;
        const itemInCart = this.cart.find((item) => item.id === lesson.id);
        if (itemInCart) {
          itemInCart.quantity += 1;
        } else {
          this.cart.push({ ...lesson, quantity: 1 });
        }
      }
    },
    incrementItemInCart(item) {
      const lesson = this.lessons.find((lesson) => lesson.id === item.id);
      if (item.quantity < lesson.spaces + item.quantity) {
        item.quantity += 1;
        lesson.spaces -= 1;
      }
    },
    decrementItem(item) {
      const lesson = this.lessons.find((lesson) => lesson.id === item.id);
      if (item.quantity > 1) {
        item.quantity -= 1;
        lesson.spaces += 1;
      } else {
        this.removeFromCart(item);
      }
    },
    removeFromCart(item) {
      const lesson = this.lessons.find((lesson) => lesson.id === item.id);
      lesson.spaces += item.quantity;
      this.cart = this.cart.filter((cartItem) => cartItem.id !== item.id);
      if (this.cart.length === 0) {
        this.showCheckoutPage = false;
      }
    },
    toggleCheckoutPage() {
      if (this.cart.length > 0 || this.showCheckoutPage) {
        this.showCheckoutPage = !this.showCheckoutPage;
      }
    },
    async submitCheckout() {
      const orderData = {
        name: this.name,
        phone: this.phone,
        lessonIDs: this.cart.map((item) => item.id),
        number_of_spaces: this.cart.reduce(
          (total, item) => total + item.quantity,
          0
        ),
      };
      try {
        await axios.post("http://localhost:5000/api/add-order", orderData);
        alert(`Order for ${this.name} submitted successfully!`);
        this.cart = [];
        this.name = "";
        this.phone = "";
        this.showCheckoutPage = false;
        this.loadLessons(); // Refresh lesson list
      } catch (error) {
        console.error("Failed to submit order:", error);
        alert("Error submitting order.");
      }
    },
    validateName() {
      const nameRegex = /^[A-Za-z\s]+$/;
      this.nameError = nameRegex.test(this.name)
        ? ""
        : "Name must contain only letters and spaces.";
    },
    validatePhone() {
      const phoneRegex = /^[0-9]{10}$/;
      this.phoneError = phoneRegex.test(this.phone)
        ? ""
        : "Phone number must be 10 digits.";
    },
  },
  mounted() {
    this.loadLessons(); // Load lessons when app starts
  },
});
