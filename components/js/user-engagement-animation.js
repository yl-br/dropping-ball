const strings = ["Amazing", "Keep On Going", "You're The King","Excellent", "You are doing Great !",
    "You Rock !!!", "Great Success", "ROCK ON !", "Doing Amazing", "Keep exploding them", "(: <3"];

function getRandomString() {
    const randomIndex = Math.floor(Math.random() * strings.length);
    return strings[randomIndex];
}

// Function to display a string on the entire web page for a specified duration
async function displayString(string_to_show, duration_to_display = 1500) {
    return new Promise((resolve, reject) => {
        // Create a div element to display the string
        const displayDiv = document.createElement('div');
        displayDiv.style.position = 'fixed';
        displayDiv.style.top = '50%';
        displayDiv.style.left = '50%';
        displayDiv.style.transform = 'translate(-50%, -50%)';
        const fontSize = window.innerWidth * 0.1; // 10% of viewport width
        displayDiv.style.fontSize = `${fontSize}px`;
        displayDiv.style.zIndex = '9999';
        displayDiv.style.color = 'white';
        displayDiv.style.background = 'linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)';
        displayDiv.style.webkitBackgroundClip = 'text';
        displayDiv.style.webkitTextFillColor = 'transparent';
        displayDiv.style.textAlign = 'center';
        
        
        // Additional styles for preventing text selection and pointer events
        displayDiv.style.userSelect = 'none'; // Prevent text selection
        displayDiv.style.pointerEvents = 'none'; // Disable pointer events

        displayDiv.textContent = getRandomString();

        // Append the div to the body
        document.body.appendChild(displayDiv);

        // Remove the div after the specified duration
        setTimeout(() => {
            document.body.removeChild(displayDiv);
            resolve(); // Resolve the promise once the string is removed
        }, duration_to_display);
    });
}

    function updateTextSize() {
        
    }