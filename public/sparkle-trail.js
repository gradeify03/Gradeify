// Sparkle Trail Effect
/*
(function() {
  const colors = [
    'rgba(86, 223, 207, 0.8)', // teal
    'rgba(38, 93, 74, 0.8)',   // green
    'rgba(255, 255, 255, 0.7)', // white
    'rgba(255, 255, 153, 0.7)', // yellow
    'rgba(204, 255, 229, 0.7)'  // mint
  ];
  const bubbles = [];
  const maxBubbles = 40;

  function createBubble(x, y) {
    const bubble = document.createElement('div');
    const size = Math.random() * 12 + 8;
    bubble.style.position = 'fixed';
    bubble.style.left = `${x - size/2}px`;
    bubble.style.top = `${y - size/2}px`;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.borderRadius = '50%';
    bubble.style.pointerEvents = 'none';
    bubble.style.zIndex = 9999;
    bubble.style.background = colors[Math.floor(Math.random() * colors.length)];
    bubble.style.boxShadow = `0 0 16px 4px ${bubble.style.background}`;
    bubble.style.opacity = 1;
    bubble.style.transition = 'opacity 0.7s, transform 0.7s';
    document.body.appendChild(bubble);
    bubbles.push(bubble);
    setTimeout(() => {
      bubble.style.opacity = 0;
      bubble.style.transform = `translateY(-${Math.random() * 40 + 10}px) scale(${0.7 + Math.random() * 0.5})`;
    }, 10);
    setTimeout(() => {
      bubble.remove();
      bubbles.shift();
    }, 700);
    if (bubbles.length > maxBubbles) {
      const old = bubbles.shift();
      if (old) old.remove();
    }
  }

  document.addEventListener('mousemove', (e) => {
    createBubble(e.clientX, e.clientY);
  });
})(); 
*/ 