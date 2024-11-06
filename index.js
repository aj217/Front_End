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
                image: "/images/math.png",
            },
            {
                id: 2,
                subject: "English",
                location: "Colindale",
                price: 80,
                spaces: 3,
                image: "/images/english.png",
            },
            {
                id: 3,
                subject: "Science",
                location: "Brent Cross",
                price: 120,
                spaces: 2,
                image: "/images/science.png",
            },
            {
                id: 4,
                subject: "History",
                location: "Golders Green",
                price: 90,
                spaces: 1,
                image: "/images/history.png",
            },
            {
                id: 5,
                subject: "Art",
                location: "Hendon",
                price: 75,
                spaces: 0,
                image: "/images/art.png",
            },
            {
                id: 6,
                subject: "Music",
                location: "Kingsbury",
                price: 110,
                spaces: 4,
                image: "/images/music.png",
            },
            {
                id: 7,
                subject: "Physics",
                location: "Harrow",
                price: 150,
                spaces: 2,
                image: "/images/physics.png",
            },
            {
                id: 8,
                subject: "Chemistry",
                location: "Hendon",
                price: 100,
                spaces: 6,
                image: "/images/chemistry.png",
            },
            {
                id: 9,
                subject: "Biology",
                location: "Wembley",
                price: 130,
                spaces: 4,
                image: "/images/biology.png",
            },
            {
                id: 10,
                subject: "Geography",
                location: "Hendon",
                price: 95,
                spaces: 3,
                image: "/images/geography.png",
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
});

