async function populateWatchVideoPage() {
    if (window.location.pathname.includes('watch-video.html')) {
        document.addEventListener('DOMContentLoaded', async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const courseId = urlParams.get('courseId');
            const videoId = urlParams.get('videoId');

            if (courseId && videoId) {
                const course = await fetchData(`http://localhost:3000/courses/${courseId}`);
                console.log(course);
                if (course) {
                    const videoPlayer = document.getElementById('video');
                    const videoTitleElement = document.querySelector('.watch-video .title');
                    const tutorImageElement = document.getElementById('tutor-image'); // Get the tutor image element
                    const tutorNameElement = document.getElementById('tutor-name');   // Get the tutor name element

                    // Dynamically set video source
                    videoPlayer.src = `images/${videoId}.mp4`;

                    // Dynamically set poster attribute
                    videoPlayer.poster = course.thumbnail;

                    // Dynamically set video title
                    const videoPartNumber = videoId.split('-')[1];
                    videoTitleElement.textContent = `${course.title} (part ${parseInt(videoPartNumber) + 1})`;

                    // Set the tutor image and name
                    tutorImageElement.src = course.tutorImage;
                    tutorImageElement.alt = course.tutor;
                    tutorNameElement.textContent = course.tutor;

                } else {
                    console.error('Could not find course with ID:', courseId);
                    // Optionally display an error message
                }
            } else {
                console.error('Missing courseId or videoId in the URL.');
                // Optionally display an error message
            }
        });
    }
}

populateWatchVideoPage();