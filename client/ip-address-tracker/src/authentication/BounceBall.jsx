import React, { useRef, useEffect } from 'react';

const BounceBalls = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const resiSize = ()=>{
      canvas.width = window.innerWidth;
     canvas.height = window.innerHeight;
    }
   
   resiSize();
   window.addEventListener('resize',resiSize);
   const width = canvas.width;
   const height = canvas.height;
    // Create balls with random properties
    const balls = Array.from({ length: 50 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      dx: (Math.random() - 0.5) * 8,
      dy: (Math.random() - 0.5) * 8,
      radius: Math.random() * 10 + 10,
      color: getRandomColor(),
      smokeTrail: [],
    }));

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Handle ball movement and behavior
      balls.forEach((ball, index) => {
        // Update smoke trail
        ball.smokeTrail.push({ x: ball.x, y: ball.y, radius: ball.radius, opacity: 0.2 });
        if (ball.smokeTrail.length > 15) ball.smokeTrail.shift();

        ball.x += ball.dx;
        ball.y += ball.dy;

        // Dynamic velocity
        ball.dx += (Math.random() - 0.5) * 0.2;
        ball.dy += (Math.random() - 0.5) * 0.2;

        // Bounce off walls
        if (ball.x + ball.radius > width || ball.x - ball.radius < 0) {
          ball.dx *= -1;
          ball.color = getRandomColor();
        }
        if (ball.y + ball.radius > height || ball.y - ball.radius < 0) {
          ball.dy *= -1;
          ball.color = getRandomColor();
        }

        // Detect collisions with other balls
        for (let j = index + 1; j < balls.length; j++) {
          let otherBall = balls[j];
          if (areBallsColliding(ball, otherBall)) {
            const newColor = mixColors(ball.color, otherBall.color);
            ball.color = newColor;
            otherBall.color = getRandomColor();

            let tempDx = ball.dx;
            let tempDy = ball.dy;
            ball.dx = otherBall.dx;
            ball.dy = otherBall.dy;
            otherBall.dx = tempDx;
            otherBall.dy = tempDy;
          }
        }

        // Draw smoke effect
        drawSmokeEffect(ball, ctx);

        // Draw the ball
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
        ctx.closePath();
      });

      requestAnimationFrame(animate);
    };

    animate();
    
    return () => {
      window.removeEventListener('resize', resiSize);
    };
  }, []);

  // Function to get a random vibrant color
  const getRandomColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r},${g},${b})`;
  };

  // Function to detect if two balls are colliding
  const areBallsColliding = (ball1, ball2) => {
    const distX = ball1.x - ball2.x;
    const distY = ball1.y - ball2.y;
    const distance = Math.sqrt(distX * distX + distY * distY);
    return distance < ball1.radius + ball2.radius;
  };

  // Function to mix two colors
  const mixColors = (color1, color2) => {
    const rgb1 = parseRGB(color1);
    const rgb2 = parseRGB(color2);
    const mixedR = Math.round((rgb1.r + rgb2.r) / 2);
    const mixedG = Math.round((rgb1.g + rgb2.g) / 2);
    const mixedB = Math.round((rgb1.b + rgb2.b) / 2);
    return `rgb(${mixedR},${mixedG},${mixedB})`;
  };

  // Helper function to parse RGB string
  const parseRGB = (color) => {
    const matches = color.match(/\d+/g);
    return {
      r: parseInt(matches[0]),
      g: parseInt(matches[1]),
      b: parseInt(matches[2])
    };
  };

  // Draw smoke effect
  const drawSmokeEffect = (ball, ctx) => {
    ball.smokeTrail.forEach((smoke, index) => {
      const gradient = ctx.createRadialGradient(
        smoke.x, smoke.y, 0,
        smoke.x, smoke.y, smoke.radius * 1.5
      );
      const baseColor = parseRGB(ball.color);
      const smokeOpacity = (smoke.opacity - index * 0.013) * 0.3;
      gradient.addColorStop(0, `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${smokeOpacity})`);
      gradient.addColorStop(1, `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0)`);

      ctx.beginPath();
      ctx.arc(smoke.x, smoke.y, smoke.radius * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.closePath();
    });
  };

  return <canvas ref={canvasRef}  style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    fontSize:"10px",
    zIndex: -1,
  }} />;
};

export default BounceBalls;