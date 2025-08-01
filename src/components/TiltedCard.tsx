import React, { useState, useRef, useEffect } from 'react';

interface TiltedCardProps {
  imageSrc: string;
  altText: string;
  captionText?: string;
  containerHeight?: string;
  containerWidth?: string;
  imageHeight?: string;
  imageWidth?: string;
  rotateAmplitude?: number;
  scaleOnHover?: number;
  showMobileWarning?: boolean;
  showTooltip?: boolean;
  displayOverlayContent?: boolean;
  overlayContent?: React.ReactNode;
}

const TiltedCard: React.FC<TiltedCardProps> = ({
  imageSrc,
  altText,
  captionText,
  containerHeight = "300px",
  containerWidth = "300px",
  imageHeight = "300px",
  imageWidth = "300px",
  rotateAmplitude = 12,
  scaleOnHover = 1.2,
  showMobileWarning = false,
  showTooltip = true,
  displayOverlayContent = true,
  overlayContent
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isMobile) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    const maxTilt = rotateAmplitude;
    const tiltXValue = (mouseY / (rect.height / 2)) * maxTilt;
    const tiltYValue = -(mouseX / (rect.width / 2)) * maxTilt;
    
    setTiltX(tiltXValue);
    setTiltY(tiltYValue);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTiltX(0);
    setTiltY(0);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const transformStyle = {
    transform: isHovered && !isMobile
      ? `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scaleOnHover})`
      : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
    transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.3s ease-out',
  };

  return (
    <div className="relative">
      {showMobileWarning && isMobile && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium z-10">
          Hover effect works best on desktop
        </div>
      )}
      
      <div
        ref={cardRef}
        className="relative cursor-pointer"
        style={{
          height: containerHeight,
          width: containerWidth,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="relative w-full h-full rounded-2xl shadow-lg overflow-hidden"
          style={transformStyle}
        >
          <img
            src={imageSrc}
            alt={altText}
            className="w-full h-full object-cover"
            style={{
              height: imageHeight,
              width: imageWidth,
            }}
          />
          
          {displayOverlayContent && isHovered && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300">
              <div className="text-white text-center p-4">
                {overlayContent || (
                  <p className="text-lg font-semibold">{captionText}</p>
                )}
              </div>
            </div>
          )}
          
          {showTooltip && isHovered && (
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap z-20">
              {captionText || altText}
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TiltedCard; 