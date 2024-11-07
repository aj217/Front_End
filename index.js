new Vue({
    el: "#app",
    data: {
        lessons: [
            {
                id: 1,
                subject: "Math",
                location: "Hendon",
                price: 100,
                spaces: 5,
                image: "./images/math.png",
            },
            {
                id: 2,
                subject: "English",
                location: "Colindale",
                price: 80,
                spaces: 3,
                image: "./images/English.png",
            },
            {
                id: 3,
                subject: "Science",
                location: "Brent Cross",
                price: 120,
                spaces: 2,
                image: "./images/Science.png",
            },
            {
                id: 4,
                subject: "History",
                location: "Golders Green",
                price: 90,
                spaces: 1,
                image: "./images/History.png",
            },
            {
                id: 5,
                subject: "Art",
                location: "Hendon",
                price: 75,
                spaces: 0,
                image: "./images/art.png",
            },
            {
                id: 6,
                subject: "Music",
                location: "Kingsbury",
                price: 110,
                spaces: 4,
                image: "./images/music.png",
            },
            {
                id: 7,
                subject: "Physics",
                location: "Harrow",
                price: 150,
                spaces: 2,
                image: "./images/physics.png",
            },
            {
                id: 8,
                subject: "Chemistry",
                location: "Hendon",
                price: 100,
                spaces: 6,
                image: "./images/chemistry.png",
            },
            {
                id: 9,
                subject: "Biology",
                location: "Wembley",
                price: 130,
                spaces: 4,
                image: "./images/biology.png",
            },
            {
                id: 10,
                subject: "Geography",
                location: "Hendon",
                price: 95,
                spaces: 3,
                image: "./images/geography.png",
            },
        ],
        cart: [],
        name: "",
        phone: "",
        searchQuery: "",
        sortBy: "subject",
        sortOrder: "asc",
        showCheckoutPage: false,
        nameError: "",
        phoneError: "",
    },
    computed: {
        sortedAndFilteredLessons() {
            // Convert the search query to lowercase for case-insensitive matching
            const query = this.searchQuery.toLowerCase();
      
            // Filter lessons based on matching any attribute (subject, location, price, spaces)
            let filtered = this.lessons.filter(lesson => {
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
            return this.cart.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );
        },
        validCheckout() {
            return (
                this.name && this.phone && !this.nameError && !this.phoneError
            );
        },
    },
    methods: {
        toggleSortOrder() {
            this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
        },
        addToCart(lesson) {
            // check if there are remainig spaces for this item
            if (lesson.spaces > 0) {
                lesson.spaces -= 1;
                const itemInCart = this.cart.find(
                    (item) => item.id === lesson.id
                );
                if (itemInCart) {
                    itemInCart.quantity += 1;
                } else {
                    this.cart.push({ ...lesson, quantity: 1 });
                }
            }
        },
        incrementItemInCart(item) {
            // Find the corresponding lesson in the lessons list
            const lesson = this.lessons.find((lesson) => lesson.id === item.id);

            // Add to cart only if more spaces are available
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
            lesson.spaces += item.quantity; // Return all spaces back to lesson's available 
            this.cart = this.cart.filter((cartItem) => cartItem.id !== item.id);

            // Automatically go back to lesson list if cart becomes empty
            if (this.cart.length === 0) {
                this.showCheckoutPage = false;
            }
        },
        toggleCheckoutPage() {
            if (this.cart.length > 0 || this.showCheckoutPage) {
                this.showCheckoutPage = !this.showCheckoutPage;
            }
        },
        submitCheckout() {
            alert(`Order for ${this.name} submitted successfully!`);
            this.cart = [];
            this.name = "";
            this.phone = "";
            this.showCheckoutPage = false;
        },
        validateName() {
            // Regular expression to allow only letters and spaces
            const nameRegex = /^[A-Za-z\s]+$/;
            if (!nameRegex.test(this.name)) {
                this.nameError = "Name must contain only letters and spaces.";
            } else {
                this.nameError = "";
            }
        },
        validatePhone() {
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(this.phone)) {
                this.phoneError = "Phone number must 10 digits.";
            } else {
                this.phoneError = "";
            }
        },
    },
});
