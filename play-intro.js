async function play_introduction(){
    await play_intro();
    explode_pixel(1000);
    cleanupIntroElements();
}



// Function to run the entire introduction sequence
async function play_intro() {
    // Select elements that are now fully defined in the HTML
    // NOTE: These IDs MUST exist in your HTML file.
    const imageElement = document.getElementById('introImage');
    const videoElement = document.getElementById('mainVideo');

    if (!imageElement || !videoElement) { // This check is failing!
        console.error("Initialization Error: Required elements ('introImage' or 'mainVideo') not found in the HTML.");
        return;
    }


    const imageTransitionTime = 3000; // 3 seconds
    const videoTransitionTime = 8000; // 8 seconds

    // --- CRITICAL CHECK: Ensure elements exist ---
    if (!imageElement || !videoElement) {
        console.error("Initialization Error: Required elements ('introImage' or 'mainVideo') not found in the HTML.");
        // If elements are null, stop execution here to prevent TypeError
        return;
    }

    try {
        // --- 1. Wait for the Image to Load ---
        // This ensures the 3-second delay doesn't start until the image is visually ready.
        await new Promise((resolve) => {
            // Check if the image is already complete (cached or fast load)
            if (imageElement.complete && imageElement.naturalHeight !== 0) {
                resolve();
            } else {
                imageElement.onload = resolve;
                imageElement.onerror = () => {
                    console.warn("Image load failed. Proceeding to video anyway.");
                    resolve(); // Continue even if the image fails to load
                };
            }
        });

        console.log("Image loaded. Starting 3-second countdown.");

        // --- 2. Wait for the 3-Second Transition Time ---
        // Creates a pause using await and setTimeout
        await new Promise(resolve => setTimeout(resolve, imageTransitionTime));

        console.log("3 seconds passed. Switching to video.");

        // --- 3. Execute the Transition ---
        imageElement.style.display = 'none';

        // Use 'block' to show the video (assuming CSS makes it full screen)
        videoElement.style.display = 'block';

        // Play the video
        // Using await here allows us to catch the promise rejection if play() is blocked
        await videoElement.play()
            .catch(error => {
                console.warn("Video play was prevented by the browser. Error:", error.name);
                console.info("This usually happens if the browser blocks unmuted auto-play.");
            });
        await new Promise(resolve => setTimeout(resolve, videoTransitionTime));
    } catch (error) {
        console.error('An unhandled error occurred during the intro sequence:', error);
        // Fallback: Ensure image is hidden and video is visible
        if (imageElement) imageElement.style.display = 'none';
        if (videoElement) videoElement.style.display = 'block';
    }
}



async function explode_pixel(duration = 1000) {
    const count = 300;
    const pixels = [];

    for (let i = 0; i < count; i++) {
        const p = document.createElement("div");
        Object.assign(p.style, {
            position: "fixed",
            width: "4px",
            height: "4px",
            background: "#000",
            left: "50%",
            top: "50%",
            pointerEvents: "none",
            transform: "translate(-50%, -50%)",
            transition: `transform ${duration}ms linear, opacity ${duration}ms linear`,
        });
        document.body.appendChild(p);
        pixels.push(p);

        const x = (Math.random() - 0.5) * window.innerWidth;
        const y = (Math.random() - 0.5) * window.innerHeight;

        requestAnimationFrame(() => {
            p.style.transform = `translate(${x}px, ${y}px)`;
            p.style.opacity = "0";
        });
    }

    setTimeout(() => pixels.forEach(p => p.remove()), duration);
}


// Function to handle the removal of the elements
function cleanupIntroElements() {
    let el =document.getElementById("play-intro");

    if (el) {
        el?.remove()
        console.log("intro elements removed.")
    }




}