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
      debounceTimer: null, // Timer for debouncing search input
    };
  },
  computed: {
    sortedAndFilteredLessons() {
      // Use lessons already filtered from the backend
      let sorted = this.lessons.sort((a, b) => {
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
    async loadLessons(query = "") {
      try {
        const url = query
          ? `http://localhost:5001/api/search?q=${encodeURIComponent(query)}`
          : "http://localhost:5001/api/get-lessons";

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch lessons");
        }
        const lessons = await response.json();
        this.lessons = lessons.map((lesson) => ({
          ...lesson,
          image: `http://localhost:5001/images/${lesson.image}`,
        }));
      } catch (error) {
        console.error("Failed to load lessons:", error);
        alert("Could not load lessons. Please try again later.");
      }
    },

    handleSearch() {
      clearTimeout(this.debounceTimer); // Clear previous timer
      this.debounceTimer = setTimeout(() => {
        this.loadLessons(this.searchQuery); // Fetch lessons after delay
      }, 300); // Adjust debounce time as needed (300ms here)
    },

    // Other methods remain unchanged
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
        lessonIDs: this.cart.map((item) => item._id),
        number_of_spaces: this.cart.reduce(
          (total, item) => total + item.quantity,
          0
        ),
      };

      try {
        const response = await fetch("http://localhost:5001/api/add-order", {
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
        this.loadLessons();
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
    this.loadLessons(); // Load all lessons initially
  },
});
