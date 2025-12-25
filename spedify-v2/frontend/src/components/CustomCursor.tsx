import { useEffect, useState } from 'react';

const CustomCursor = () => {
  const [particles, setParticles] = useState<Array<{ 
    id: number; 
    x: number; 
    y: number; 
    vx: number; 
    vy: number; 
    size: number;
    opacity: number;
  }>>([]);

  useEffect(() => {
    let animationFrameId: number;
    let lastParticleTime = 0;
    const particleDelay = 40; // milliseconds between particles

    const handleMouseMove = (e: MouseEvent) => {
      const currentTime = Date.now();
      
      if (currentTime - lastParticleTime > particleDelay) {
        // Create multiple blue particles at once
        const newParticles = Array.from({ length: 2 }, (_, i) => ({
          id: Date.now() + i,
          x: e.clientX + (Math.random() - 0.5) * 20,
          y: e.clientY + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5 - 0.5, // Slight upward bias
          size: Math.random() * 3 + 2,
          opacity: Math.random() * 0.4 + 0.3,
        }));
        
        setParticles((prev) => [...prev.slice(-40), ...newParticles]); // Keep last 40 particles
        lastParticleTime = currentTime;
      }
    };

    // Animate particles
    const animateParticles = () => {
      setParticles((prev) => 
        prev.map((particle) => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          opacity: particle.opacity - 0.012,
          vy: particle.vy + 0.04, // Gravity effect
        })).filter(p => p.opacity > 0)
      );
      animationFrameId = requestAnimationFrame(animateParticles);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animationFrameId = requestAnimationFrame(animateParticles);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <>
      {/* Blue Particles in background */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="fixed pointer-events-none rounded-full"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: '#3B82F6', // Blue-600
            opacity: particle.opacity,
            zIndex: 1,
            boxShadow: `0 0 ${particle.size * 2}px rgba(59, 130, 246, ${particle.opacity * 0.5})`,
            transition: 'opacity 0.1s ease-out',
          }}
        />
      ))}
    </>
  );
};

export default CustomCursor;
