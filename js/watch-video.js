async function populateWatchVideoPage() {
    if (!window.location.pathname.includes('watch-video.html')) return;

    try {
        // 1. Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('courseId');
        const videoId = urlParams.get('videoId');
        
        if (!courseId || !videoId) {
            throw new Error('Missing courseId or videoId in URL');
        }

        // 2. Load course data
        const course = await fetchData(`http://localhost:3000/courses/${courseId}`);
        if (!course) throw new Error('Course not found');

        // 3. Video element setup
        const videoPlayer = document.getElementById('video');
        const videoUrl = new URL(`./images/${videoId}.mp4`, window.location.href).href;
        
        console.log('Loading video from:', videoUrl); // DEBUG

        // Completely reset video element
        videoPlayer.innerHTML = '';
        videoPlayer.removeAttribute('src');
        
        const source = document.createElement('source');
        source.src = videoUrl;
        source.type = 'video/mp4';
        videoPlayer.appendChild(source);
        videoPlayer.poster = course.thumbnail;
        videoPlayer.controls = true;

        // 4. Error handling
        videoPlayer.addEventListener('error', () => {
            console.error('Video Error Details:', {
                code: videoPlayer.error.code,
                message: videoPlayer.error.message,
                networkState: videoPlayer.networkState,
                readyState: videoPlayer.readyState,
                src: videoPlayer.querySelector('source')?.src
            });
            alert(`Failed to load video from:\n${videoUrl}\n\nCheck browser console for details.`);
        });

        // 5. Load metadata first
        videoPlayer.load(); // Critical for Firefox

        videoPlayer.addEventListener('loadeddata', () => {
            console.log('Video metadata loaded, attempting playback');
            videoPlayer.play().catch(e => {
                console.log('Autoplay prevented:', e.message);
                videoPlayer.controls = true;
            });
            // --- ADD THIS LINE HERE ---
            trackVideoProgress(courseId, videoId);
        });
        // 6. UI Setup
        document.querySelector('.title').textContent = 
            `${course.title} (part ${parseInt(videoId.split('-')[1]) + 1})`;
        document.getElementById('tutor-image').src = course.tutorImage;
        document.getElementById('tutor-name').textContent = course.tutor;

        // 7. Load comments
        await fetchAndDisplayComments(videoId);

    } catch (error) {
        console.error('Page initialization failed:', error);
        alert(`Error loading page: ${error.message}`);
    }
}

// Comments functionality (unchanged from your working version)
async function fetchAndDisplayComments(videoId) {
    try {
        const response = await fetch('http://localhost:3000/comments');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const allComments = await response.json();
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('courseId');
        const videoComments = allComments.filter(comment => 
            comment.videoId === videoId && comment.courseId === courseId
        );

        const commentsContainer = document.getElementById('comments-container');
        commentsContainer.innerHTML = '';

        const currentUser = localStorage.getItem('currentUser');
        const loggedInUserId = currentUser ? JSON.parse(currentUser).id : null;

        for (const comment of videoComments) {
            const user = await fetchData(`http://localhost:3000/users/${comment.userId}`);
            
            const commentDiv = document.createElement('div');
            commentDiv.className = 'box';
            commentDiv.innerHTML = `
                <div class="user">
                    <img src="${user.profileImage || 'images/pic-5.jpg'}" alt="${user.firstName} ${user.lastName}">
                    <div>
                        <h3>${user.firstName} ${user.lastName}</h3>
                        <span>${new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="comment-box">${comment.text}</div>
                ${loggedInUserId === comment.userId ? `
                    <div class="comment-actions">
                        <button class="edit-comment-btn" data-comment-id="${comment.id}">Edit</button>
                        <button class="delete-comment-btn" data-comment-id="${comment.id}">Delete</button>
                    </div>
                ` : ''}
            `;
            commentsContainer.appendChild(commentDiv);
        }

        setupCommentEditAndDelete();

    } catch (error) {
        console.error('Error loading comments:', error);
    }
}

// Initialize the page
populateWatchVideoPage();

function setupCommentEditAndDelete() {
    const commentsContainer = document.getElementById('comments-container');

    commentsContainer.addEventListener('click', async (event) => {
        if (event.target.classList.contains('delete-comment-btn')) {
            const commentId = event.target.dataset.commentId;
            if (confirm('Are you sure you want to delete this comment?')) {
                try {
                    await deleteData('http://localhost:3000/comments', commentId);
                    const urlParams = new URLSearchParams(window.location.search);
                    const videoId = urlParams.get('videoId');
                    await fetchAndDisplayComments(videoId); // Refresh comments
                } catch (error) {
                    console.error('Error deleting comment:', error);
                    alert('Failed to delete comment.');
                }
            }
        } else if (event.target.classList.contains('edit-comment-btn')) {
            const commentId = event.target.dataset.commentId;
            const commentBox = event.target.closest('.box').querySelector('.comment-box');
            const currentText = commentBox.textContent.trim();

            commentBox.innerHTML = `
                <textarea class="edit-textarea"></textarea>
                <div class="edit-actions">
                    <button class="inline-btn save-edit-btn" data-comment-id="${commentId}">Save</button>
                    <button class="inline-btn cancel-edit-btn">Cancel</button>
                </div>
            `;
            commentBox.querySelector('.edit-textarea').value = currentText;
        } else if (event.target.classList.contains('save-edit-btn')) {
            const commentId = event.target.dataset.commentId;
            const commentBox = event.target.closest('.box').querySelector('.comment-box');
            const editedText = commentBox.querySelector('.edit-textarea').value.trim();
            const urlParams = new URLSearchParams(window.location.search);
            const courseId = urlParams.get('courseId');

            if (editedText) {
                try {
                    await updateData(`http://localhost:3000/comments`, commentId, { text: editedText, courseId: courseId });
                    const videoId = urlParams.get('videoId');
                    await fetchAndDisplayComments(videoId); // Refresh comments
                } catch (error) {
                    console.error('Error updating comment:', error);
                    alert('Failed to update comment.');
                }
            }
        } else if (event.target.classList.contains('cancel-edit-btn')) {
            // Revert to the original comment display
            const urlParams = new URLSearchParams(window.location.search);
            const videoId = urlParams.get('videoId');
            await fetchAndDisplayComments(videoId);
        }
    });
}

async function setupCommentSubmission() {
    if (window.location.pathname.includes('watch-video.html')) {
        document.addEventListener('DOMContentLoaded', () => {
            const commentForm = document.querySelector('.add-comment');
            const commentTextarea = commentForm.querySelector('textarea[name="comment_box"]');

            commentForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const commentText = commentTextarea.value.trim();
                const urlParams = new URLSearchParams(window.location.search);
                const videoId = urlParams.get('videoId');
                const courseId = urlParams.get('courseId'); // Get courseId
                const currentUser = localStorage.getItem('currentUser');
                const userId = currentUser ? JSON.parse(currentUser).id : null;

                if (commentText && videoId && userId && courseId) {
                    const newComment = {
                        videoId: videoId,
                        userId: userId,
                        courseId: courseId, // Include courseId
                        text: commentText,
                        createdAt: new Date().toISOString()
                    };

                    try {
                        const addedComment = await addData('http://localhost:3000/comments', newComment);
                        console.log('Comment added:', addedComment);
                        commentTextarea.value = ''; // Clear the textarea
                        await fetchAndDisplayComments(videoId); // Refresh comments
                    } catch (error) {
                        console.error('Error adding comment:', error);
                        alert('Failed to add comment.');
                    }
                } else {
                    alert('Please log in and ensure you are on a video page to submit a comment.');
                }
            });
        });
    }
}

setupCommentSubmission();

// Replace your current trackVideoProgress function with this:

async function trackVideoProgress(courseId, videoId) {
    const videoElement = document.getElementById('video');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser) return;

    // Throttled progress handler
    const handleProgressUpdate = throttle(async () => {
        try {
            const currentTime = videoElement.currentTime;
            const duration = videoElement.duration;
            const percentWatched = (currentTime / duration) * 100;
            const isComplete = percentWatched >= 90 || (duration - currentTime) < 30;

            console.log('[Progress Update]', { currentTime, duration, percentWatched, isComplete, videoId });

            const progressUrl = `http://localhost:3000/courseProgress?userId=${currentUser.id}&courseId=${courseId}`;
            const progressResponse = await fetch(progressUrl);
            if (!progressResponse.ok) throw new Error(`HTTP error! status: ${progressResponse.status} for ${progressUrl}`);
            const [existingProgress] = await progressResponse.json();

            let watchedVideos = existingProgress?.watchedVideos || [];
            let videoProgress = existingProgress?.videoProgress || {};

            videoProgress[videoId] = {
                lastPosition: currentTime,
                percentWatched,
                completed: isComplete,
                lastUpdated: new Date().toISOString()
            };

            if (!watchedVideos.includes(videoId)) {
                watchedVideos.push(videoId);
            }

            const progressData = {
                userId: currentUser.id,
                courseId,
                watchedVideos,
                videoProgress,
                lastWatchedVideo: videoId,
                lastUpdated: new Date().toISOString()
            };

            if (existingProgress) {
                const updateResponse = await fetch(`http://localhost:3000/courseProgress/${existingProgress.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(progressData)
                });
                if (!updateResponse.ok) throw new Error(`HTTP error! status: ${updateResponse.status} for updating progress`);
            } else {
                const createResponse = await fetch('http://localhost:3000/courseProgress', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(progressData)
                });
                if (!createResponse.ok) throw new Error(`HTTP error! status: ${createResponse.status} for creating progress`);
            }
        } catch (error) {
            console.error('Error updating video progress:', error);
        }
    }, 5000); // Update every 5 seconds

    // Set up event listeners
    videoElement.addEventListener('timeupdate', handleProgressUpdate);
    videoElement.addEventListener('ended', () => {
        handleProgressUpdate(); // Force update on end
    });
}