new Vue({
    el: '#app',
    data: {
        records: [],
        imageCache: {}, // Cache object
        currentIndex: 0,
        currentPage: 1,
        totalPages: null,
        loading: false,
        apiCallCount: 0, // Counter for API calls
        autoScrollInterval: null, // Stores the interval reference
        isAutoScrolling: false,  // Indicates whether auto-scrolling is active

    },
    computed: {
        currentRecord() {
            return this.records[this.currentIndex];
        }
    },
    mounted() {
        this.fetchRecords();
    },
    methods: {
        fetchRecords() {
            const url = `https://api.discogs.com/users/nacooke/collection/folders/0/releases?sort=artist&per_page=50&page=${this.currentPage}`;
            this.loading = true;
            this.apiCallCount++; // Increment the API call counter
            fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Discogs token=`
                }
            })
            .then(response => response.json())
            .then(data => {
                data.releases.forEach(release => {
                    if (!this.imageCache[release.id]) {
                        this.imageCache[release.id] = release; // Cache the image data
                    }
                });
                this.records = this.records.concat(data.releases);
                this.totalPages = data.pagination.pages;
                this.loading = false;
            })
            .catch(error => {
                console.error('Error:', error);
                this.loading = false;
            });
        },
        imageLoaded(releaseId) {
            if (this.imageCache[releaseId]) {
                this.loading = false;
            }
        },
        goToNextRecord() {
            if (this.currentIndex < this.records.length - 1) {
                this.currentIndex++;
            } else if (this.currentPage < this.totalPages) {
                this.currentPage++;
                //this.currentIndex = 0;
                this.currentIndex++;
                this.fetchRecords();
            }
            else {
                this.currentIndex = 0;
            }
        },
        goToPreviousRecord() {
            if (this.currentIndex > 0) {
                this.currentIndex--;
            } else if (this.currentPage > 1) {
                this.currentPage--;
                this.currentIndex--;
                this.fetchRecords().then(() => {
                    this.currentIndex = this.records.length - 1;
                });
            }
        },
        startAutoScroll() {
            this.isAutoScrolling = true;
            this.autoScrollInterval = setInterval(() => {
                this.goToNextRecord();
            }, 2000); // Change album every 2 seconds
        },
    
        stopAutoScroll() {
            this.isAutoScrolling = false;
            clearInterval(this.autoScrollInterval);
        },
    
        toggleAutoScroll() {
            if (this.isAutoScrolling) {
                this.stopAutoScroll();
            } else {
                this.startAutoScroll();
            }
        }
    }
});
