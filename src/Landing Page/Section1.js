import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoIosMenu } from "react-icons/io";
import styles from './Section1.module.css';
import mainVideo from './video.mp4';

function CombinedSection() {
  const [fadeInClass, setFadeInClass] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Menu state
  const heroContainerRef = useRef(null);
  const navigate = useNavigate();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);
  const words = useMemo(() => ['Insights.', 'Mapping.', 'Tracking.'], []);

  useEffect(() => {
    const timeoutId = setTimeout(() => setFadeInClass(styles.fadeIn), 300);
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const handleTyping = () => {
      const currentWord = words[currentWordIndex];
      if (isDeleting) {
        setDisplayedText((prev) => prev.slice(0, -1));
        setTypingSpeed(110);
      } else {
        setDisplayedText((prev) => currentWord.slice(0, prev.length + 1));
        setTypingSpeed(150);
      }

      if (!isDeleting && displayedText === currentWord) {
        setTimeout(() => setIsDeleting(true), 1000);
      } else if (isDeleting && displayedText === '') {
        setIsDeleting(false);
        setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, typingSpeed, currentWordIndex, words]);

  return (
    <div className={styles.container}>
      <section className={`${styles.heroContainer} ${fadeInClass}`} ref={heroContainerRef}>
        <div className={styles.heroContent}>
          <video className={styles.backgroundImage} autoPlay muted loop playsInline>
            <source src={mainVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          <nav className={styles.navigation}>
            <div className={styles.logo}>SUPPLY2U</div>

            {/* Desktop Navigation */}
            <div className={`${styles.navLinks} ${styles.desktopNav}`}>
              <a href='https://supply2u.jhubafrica.com/' className={styles.navItem}>About Us</a>
              <a href='https://supply2u.jhubafrica.com/#solutions' className={styles.navItem}>Our Solutions</a>
              <div className={styles.navItem}>Contact Us</div>
            </div>

            {/* Mobile Navigation - Menu Icon */}
            <div 
              className={styles.menuIcon} 
              onMouseEnter={() => setIsMenuOpen(true)} 
              onMouseLeave={() => setIsMenuOpen(false)}
            >
              <IoIosMenu size={28} />

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className={styles.mobileMenu}>
                  <a href='https://supply2u.jhubafrica.com/' className={styles.mobileNavItem}>About Us</a>
                  <a href='https://supply2u.jhubafrica.com/#solutions' className={styles.mobileNavItem}>Our Solutions</a>
                  <div className={styles.mobileNavItem}>Contact Us</div>
                </div>
              )}
            </div>

            <button className={styles.joinButton} onClick={() => navigate('/Login')}>Log In</button>
          </nav>

          <div className={styles.content}>
            <h1 className={styles.heroTitle}>
              Smart Agriculture with<br /> Geo
              <span className="typing-container"> {displayedText}</span>
            </h1>
            <p className={styles.titleDescription}>
              Transforming agriculture supply chains through precise integration of farm geolocation data,
              real-time analytics, <br />and consumer behavior insights. Empowering stakeholders at every step
              with unparalleled efficiency and informed decision-making.
            </p>
          </div>

          <div className={styles.ctaContainer}>
            <div className={styles.ctaButton} onClick={() => navigate('/Signup')}>GET STARTED</div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default CombinedSection;
