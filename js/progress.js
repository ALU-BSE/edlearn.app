async function displayLearningProgress() {
    try {
        console.log('[Progress] Initializing...');

        // Verify user is logged in
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            console.log('User not logged in');
            return;
        }

        // Get DOM elements - UPDATED SELECTORS
        const activeCountElement = document.querySelector('.active-courses-count'); // Changed to span
        const inProgressContainer = document.querySelector('.current-courses');
        const completedContainer = document.querySelector('.completed-courses .course-list');

        console.log('Found elements:', {
            activeCount: !!activeCountElement,
            inProgress: !!inProgressContainer,
            completed: !!completedContainer
        });

        if (!activeCountElement || !inProgressContainer || !completedContainer) {
            throw new Error('Dashboard elements missing');
        }

        // Fetch data
        const [courses, progressRecords, user] = await Promise.all([
            fetchData('http://localhost:3000/courses').catch(() => []),
            fetchData(`http://localhost:3000/courseProgress?userId=${currentUser.id}`).catch(() => []),
            fetchData(`http://localhost:3000/users/${currentUser.id}`).catch(() => ({ enrolledCourses: [] }))
        ]);

        // Process enrolled courses
        const enrolledCourses = courses.filter(course =>
            user.enrolledCourses?.includes(parseInt(course.id))
        );

        // Update active courses count
        activeCountElement.textContent = enrolledCourses.length;
        inProgressContainer.innerHTML = '<h3>in progress</h3>';
        completedContainer.innerHTML = '';

        // Process each course
        enrolledCourses.forEach(course => {
            const progress = progressRecords.find(
                p => p.courseId === course.id && p.userId === currentUser.id
            );
            const totalVideos = course.videos; // Use course.videos directly
            let watchedCount = 0;

            if (progress?.videoProgress && totalVideos) {
                watchedCount = Object.keys(progress.videoProgress)
                    .filter(videoId => progress.videoProgress[videoId].completed).length;
                const completionPercentage = Math.round((watchedCount / totalVideos) * 100);

                if (completionPercentage >= 100) {
                    // Add to completed
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <a href="playlist.html?courseId=${course.id}">${course.title}</a>
                        <span class="completed-badge">✓</span>
                    `;
                    completedContainer.appendChild(li);
                } else if (watchedCount > 0) {
                    // Add to in-progress
                    const div = document.createElement('div');
                    div.className = 'progress-item';
                    div.innerHTML = `
                        <h4>${course.title}</h4>
                        <div class="progress-track">
                            <div class="progress-bar" style="width: ${completionPercentage}%"></div>
                        </div>
                    `;
                    inProgressContainer.appendChild(div);
                }
            } else if (enrolledCourses.length > 0 && !progress) {
                // If enrolled but no progress, consider it in progress with 0%
                const div = document.createElement('div');
                div.className = 'progress-item';
                div.innerHTML = `
                    <h4>${course.title}</h4>
                    <div class="progress-track">
                        <div class="progress-bar" style="width: 0%"></div>
                    </div>
                `;
                inProgressContainer.appendChild(div);
            }
        });

        // Handle empty states
        if (inProgressContainer.children.length === 1) {
            inProgressContainer.innerHTML += '<p>No courses in progress</p>';
        }

    } catch (error) {
        console.error('Progress display error:', error);
        const errorContainer = document.querySelector('.current-courses') || document.body;
        errorContainer.innerHTML = `
            <div class="error-message">
                <p>Error loading progress data</p>
                <button onclick="location.reload()">Try Again</button>
            </div>
        `;
    }
}

// Initialize on dashboard load
if (window.location.pathname.includes('dashboard.html')) {
    document.addEventListener('DOMContentLoaded', displayLearningProgress);
    window.addEventListener('pageshow', displayLearningProgress);
}