

function getRandomColor() {
                // List of available colors
  const colors = ["yellow", "red", "blue", "green",  "orange", "purple", "brown",  "pink" , "Cyan", "SpringGreen"];
  const options_number = colors.length

                // Check if options_number is a valid index
  if (options_number <= 0 || options_number > colors.length) {
    throw new Error("Invalid options_number");
  }

                  // Generate a random index within the specified range
  const randomIndex = Math.floor(Math.random() * options_number);

                // Return the color at the randomly generated index
  return colors[randomIndex];
}

function getRandomColors(number_of_colors){
  number_of_colors = number_of_colors || getRandomNumber();
  const out_colors = [];
  for(let i = 0; i < number_of_colors; i++){
    out_colors.push(getRandomColor())
  }
  return out_colors;

}

function getRandomNumber() {
  const random = Math.random();

  if (random < 0.60) {
        return 1; // 60% chance
      } else if (random < 0.90) {
        return 2; // 30% chance (60% + 30%)
      } else if (random < 0.95) {
        return 3; // 5% chance (60% + 30% + 5%)
      } else {
        return 4; // 5% chance (remaining)
      }
    }

// Function to draw a red "X"
// `x` and `y` parameters are the center coordinates for the "X"
    function drawX(ctx, x, y) {
    const lineLength = 40; // Length of each stroke of the "X"

    ctx.beginPath(); // Begin a new path
    ctx.strokeStyle = 'black'; // Set the color of the line
    ctx.lineWidth = 8; // Set the width of the line

    // Calculate the start and end points of the lines
    // Draw the first line of the "X"
    ctx.moveTo(x - lineLength / 2, y - lineLength / 2); // Start at top-left relative to center
    ctx.lineTo(x + lineLength / 2, y + lineLength / 2); // End at bottom-right relative to center

    // Draw the second line of the "X"
    ctx.moveTo(x + lineLength / 2, y - lineLength / 2); // Start at top-right relative to center
    ctx.lineTo(x - lineLength / 2, y + lineLength / 2); // End at bottom-left relative to center

    ctx.stroke(); // Execute the drawing
    ctx.closePath(); // Close the path
  }



  function drawLine(ctx, line_height) {
    ctx.beginPath();
      ctx.moveTo(0, line_height); // Starting point at the middle of the canvas
    ctx.lineTo(ctx.canvas.width, line_height); // Ending point at the width of the canvas
    ctx.strokeStyle = "red";
      ctx.lineWidth = 5; // You can adjust the line width
      ctx.stroke();
    }

    function atomic_bomb_animation(ctx, duration = 150) {
    // Create a new image object
      var image = new Image();
    // Set the source of the image
      image.src = "/assets/images/atomic-cloud.png";

    // Wait for the image to load
      image.onload = function() {
        console.log("atomic cloud image loaded.");
        let lastToggleTime = Date.now();
        let startTime = Date.now();
        let showing = true;

        // Function to update the canvas
        function updateCanvas() {
          let currentTime = Date.now();
          let elapsed = currentTime - startTime;

            // Calculate current opacity based on elapsed time
          let opacity = elapsed / duration;
          if (opacity > 1) opacity = 1;

            // Stop the animation after the specified duration
          if (elapsed > duration) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            return;
          }

            // Toggle image visibility every 30 milliseconds
          if (currentTime - lastToggleTime >= 30) {
            showing = !showing;
            lastToggleTime = currentTime;
          }

            // Clear the canvas
          ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

          if (showing) {
                // Set the global alpha for opacity effect
            ctx.globalAlpha = opacity;

                // Draw the image stretched to fill the canvas
            ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height);

                // Reset the global alpha
            ctx.globalAlpha = 1.0;
          }

            // Request the next frame of the animation
          requestAnimationFrame(updateCanvas);
        }

        // Start the animation
        requestAnimationFrame(updateCanvas);
      };
    }

    function bird_animation(ctx, balls, duration = 600) {
      const birdImage = new Image();
      birdImage.src = "/assets/images/bird.png";

      birdImage.onload = function () {
        console.log("bird image loaded.");
        const startTime = Date.now();
        const bird = { x: -150, y: 150, width: 120, height: 100 };
        const sack = { radius: 0, maxRadius: 250, caught: [], deform: 0, swingAngle: 0 };

    // --- Inline animation loop ---
        (function animate() {
          const elapsed = Date.now() - startTime;
          const progress = elapsed / duration;
          if (progress > 1.1) return ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
          ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // Bird flight path
          bird.x = progress * (ctx.canvas.width + 300) - 100;
          bird.y = 120 + Math.sin(progress * Math.PI * 2) * 40;

      // Sack growth / hold / lift
          sack.radius =
        progress < 0.4 ? Math.min(sack.maxRadius, progress * sack.maxRadius * 2.5) : // expand
        progress < 0.6 ? sack.maxRadius :                                            // hold
        sack.radius * 0.97;                                                          // shrink on lift

      sack.deform = Math.min(30, sack.caught.length * 2 + Math.sin(Date.now() / 150) * 8); // deform effect
      sack.swingAngle = Math.sin(Date.now() / 300) * 0.1;                                  // swing left-right

      // Center sack over average ball position (before lift)
      let avgX = 0, avgY = 0;
      balls.forEach(b => { avgX += b.x; avgY += b.y; });
      avgX /= balls.length; avgY /= balls.length;
      const sackX = progress < 0.6 ? avgX : bird.x;
      const sackY = progress < 0.6 ? avgY + 40 : bird.y + 80 + sack.deform * 0.5;

      // --- Draw sack ---
      (function drawSack() {
        ctx.save();
        ctx.translate(sackX, sackY);
        ctx.rotate(sack.swingAngle);
        const sag = sack.deform * 0.8, topY = -sack.radius * 0.9, bottomY = sack.radius + sag, w = 0.8;
        ctx.beginPath();
        ctx.moveTo(-sack.radius * w, topY);
        ctx.bezierCurveTo(-sack.radius * 1.1, topY + sack.radius * 0.5, -sack.radius * 0.8, bottomY - sack.radius * 0.3, 0, bottomY);
        ctx.bezierCurveTo(sack.radius * 0.8, bottomY - sack.radius * 0.3, sack.radius * 1.1, topY + sack.radius * 0.5, sack.radius * w, topY);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, topY, 0, bottomY);
        grad.addColorStop(0, "rgba(60,60,60,0.9)");
        grad.addColorStop(0.5, "rgba(30,30,30,1)");
        grad.addColorStop(1, "rgba(0,0,0,1)");
        ctx.fillStyle = grad; ctx.fill(); // fill sack
        ctx.beginPath();
        ctx.moveTo(0, topY + 10); ctx.lineTo(0, bottomY - 10);
        ctx.strokeStyle = "rgba(0,0,0,0.5)"; ctx.lineWidth = 1.5; ctx.stroke(); ctx.closePath();
        ctx.beginPath();
        ctx.moveTo(-sack.radius * w, topY); ctx.lineTo(sack.radius * w, topY);
        ctx.lineWidth = 3; ctx.strokeStyle = "black"; ctx.stroke(); // top rope
        ctx.restore();
      })();

      // --- Balls inside sack ---
      balls.forEach((ball, i) => {
        const dx = ball.x - sackX, dy = ball.y - sackY, dist = Math.sqrt(dx * dx + dy * dy);
        if (!sack.caught.includes(ball) && dist < sack.radius) sack.caught.push(ball); // capture
        if (sack.caught.includes(ball)) { // wobble inside
          ball.x += (sackX - ball.x) * 0.15 + Math.sin(Date.now() / 250 + i) * 0.3;
          ball.y += (sackY - ball.y) * 0.15 + Math.cos(Date.now() / 230 + i) * 0.3;
        }
        ball.draw(ctx);
      });

      // --- Rope connection ---
      (function drawRope() {
        ctx.beginPath();
        ctx.strokeStyle = "black"; ctx.lineWidth = 3;
        ctx.moveTo(bird.x + bird.width / 2, bird.y + bird.height);
        ctx.lineTo(sackX, sackY - sack.radius * 0.8);
        ctx.stroke(); ctx.closePath();
      })();

      // --- Bird ---
      ctx.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height);

      requestAnimationFrame(animate);
    })(); // end animate()
  };
}

function parrots_animation(ctx, ball, duration = 200) {
  const image = new Image();
  image.src = "/assets/images/parrots.png";

  image.onload = function () {
    const startTime = Date.now();

    const startX = 0; // top-left start
    const startY = 0;
    const endX = ball.x;
    const endY = ball.y;
    const size = Math.max(60, ball.radius * 2);
    let prevX = startX;
    let prevY = startY;

    function updateCanvas() {
      const now = Date.now();
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);

      // current parrot position
      const x = startX + (endX - startX) * t;
      const y = startY + (endY - startY) * t;

      // erase only the previous parrot area
      ctx.clearRect(prevX - size / 2 - 2, prevY - size / 2 - 2, size + 4, size + 4);

      // draw parrot in the new position
      ctx.save();
      ctx.translate(x, y);
      ctx.drawImage(image, -size / 2, -size / 2, size, size);
      ctx.restore();

      prevX = x;
      prevY = y;

      // continue animation until reaching the ball
      if (t < 1) requestAnimationFrame(updateCanvas);
    }

    requestAnimationFrame(updateCanvas);
  };
}



