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
      // Filter lessons based on search query
      let filtered = this.lessons.filter((lesson) => {
        return (
          lesson.subject.toLowerCase().includes(query) ||
          lesson.location.toLowerCase().includes(query) ||
          lesson.price.toString().includes(query) ||
          lesson.spaces.toString().includes(query)
        );
      });
      // Sort the filtered lessons
      let sorted = filtered.sort((a, b) => {
        let modifier = this.sortOrder === "asc" ? 1 : -1;
        if (a[this.sortBy] < b[this.sortBy]) return -1 * modifier;
        if (a[this.sortBy] > b[this.sortBy]) return 1 * modifier;
        return 0;
      });
      return sorted;
    },
    cartTotal() {
      // Calculate total cost of items in cart
      return this.cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
    },
    validCheckout() {
      // Check for valid checkout inputs and no errors
      return this.name && this.phone && !this.nameError && !this.phoneError;
    },
  },
  methods: {
    async loadLessons() {
      try {
        // If there’s a search query, send it to the search endpoint
        const url = this.searchQuery
          ? `http://localhost:5000/api/search?q=${encodeURIComponent(
              this.searchQuery
            )}`
          : "http://localhost:5000/api/get-lessons";

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch lessons");
        }
        this.lessons = await response.json();
      } catch (error) {
        console.error("Failed to load lessons:", error);
        alert("Could not load lessons. Please try again later.");
      }
    },

    // Method to trigger loading of lessons based on search input
    handleSearch() {
      this.loadLessons(); // Calls loadLessons() with the current searchQuery
    },

    async updateLesson(lessonId, updateData) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/update-lesson/${lessonId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to update lesson");
        }
        alert("Lesson updated successfully!");
        this.loadLessons(); // Refresh lessons list after update
      } catch (error) {
        console.error("Failed to update lesson:", error);
      }
    },

    toggleSortOrder() {
      this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
    },

    addToCart(lesson) {
      if (lesson.spaces > 0) {
        lesson.spaces -= 1;
        const itemInCart = this.cart.find((item) => item._id === lesson._id);
        if (itemInCart) {
          itemInCart.quantity += 1;
        } else {
          this.cart.push({ ...lesson, quantity: 1 });
        }
      }
    },

    incrementItemInCart(item) {
      const lesson = this.lessons.find((lesson) => lesson._id === item._id);
      if (lesson && item.quantity < lesson.spaces + item.quantity) {
        item.quantity += 1;
        lesson.spaces -= 1;
      }
    },

    decrementItem(item) {
      const lesson = this.lessons.find((lesson) => lesson._id === item._id);
      if (lesson && item.quantity > 1) {
        item.quantity -= 1;
        lesson.spaces += 1;
      } else {
        this.removeFromCart(item);
      }
    },

    removeFromCart(item) {
      const lesson = this.lessons.find((lesson) => lesson._id === item._id);
      if (lesson) {
        lesson.spaces += item.quantity;
      }
      this.cart = this.cart.filter((cartItem) => cartItem._id !== item._id);

      if (this.cart.length === 0) {
        this.showCheckoutPage = false;
      }
    },

    toggleCheckoutPage() {
      if (this.cart.length > 0) {
        this.showCheckoutPage = !this.showCheckoutPage;
      } else {
        alert("Add items to the cart to proceed to checkout.");
      }
    },

    async submitCheckout() {
      const orderData = {
        name: this.name,
        phone: this.phone,
        lessonIDs: this.cart.map((item) => item._id), // Consistent use of _id
        number_of_spaces: this.cart.reduce(
          (total, item) => total + item.quantity,
          0
        ),
      };

      try {
        const response = await fetch("http://localhost:5000/api/add-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        });
        if (!response.ok) {
          throw new Error("Failed to submit order");
        }
        alert(`Order for ${this.name} submitted successfully!`);
        this.cart = [];
        this.name = "";
        this.phone = "";
        this.showCheckoutPage = false;
        this.loadLessons(); // Refresh lessons list after order submission
      } catch (error) {
        console.error("Failed to submit order:", error);
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
