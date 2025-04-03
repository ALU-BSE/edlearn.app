async function performSearch() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('search_box');
    const searchInput = document.querySelector('form.search-form input[name="search_box"]');
    const searchTermDisplay = document.getElementById('search-term-display');

    if (searchInput) {
        searchInput.value = searchTerm || ''; // Set the input value
    }
    if (searchTermDisplay) {
        searchTermDisplay.textContent = searchTerm || ''; // Display the search term in the heading
    }

    if (!searchTerm) {
        console.log('No search term provided.');
        displayCourses([]);
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/courses');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const allCourses = await response.json();

        const filteredCourses = allCourses.filter(course =>
            course.title.toLowerCase().includes(searchTerm.toLowerCase())
        );

        console.log('Search results for:', searchTerm, filteredCourses);
        displayCourses(filteredCourses); // Function to display the filtered courses on the page

    } catch (error) {
        console.error('Error fetching or filtering courses:', error);
        // Optionally display an error message on the page
    }
}

function displayCourses(courses) {
    const searchResultsContainer = document.getElementById('search-results-container');
    if (!searchResultsContainer) {
        console.error('Search results container not found!');
        return;
    }
    searchResultsContainer.innerHTML = '';

    if (courses.length === 0) {
        searchResultsContainer.innerHTML = '<p>No courses found matching your search.</p>';
        return;
    }

    courses.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = 'box'; // Using the 'box' class to match your course card styling

        courseCard.innerHTML = `
            <div class="thumb">
                <img src="${course.thumbnail}" alt="${course.title} Thumbnail">
                <span>${course.videos} videos</span>
            </div>
            <h3 class="title">${course.title}</h3>
            <div class="tutor">
                <img src="${course.tutorImage}" alt="${course.tutor} Image">
                <div>
                    <h3>${course.tutor}</h3>
                    <span>tutor</span>
                </div>
            </div>
            <a href="playlist.html?courseId=${course.id}" class="inline-btn">view playlist</a>
        `;
        searchResultsContainer.appendChild(courseCard);
    });
}

// Call performSearch when the search page loads
document.addEventListener('DOMContentLoaded', performSearch);