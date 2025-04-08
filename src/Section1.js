import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Section1.css";
import logo from './Images/Logo1.png';
import mainVideo from './Images/video.mp4';
import LoginIcon from "./LoginIcon";
import { IoIosGlobe } from "react-icons/io";
import { MdOutlineEmail } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";

function Section1() {
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(element => {
      observer.observe(element);
    });
  }, []);

  const words = ["Insights.", "Mapping.", "Tracking."];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    const handleTyping = () => {
      const currentWord = words[currentWordIndex];
      if (isDeleting) {
        setDisplayedText(prev => prev.slice(0, -1));
        setTypingSpeed(110);
      } else {
        setDisplayedText(prev => currentWord.slice(0, prev.length + 1));
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
    <div className="home-container">
      <div className="home-column">
        <Link to="/">
          <img
            loading="lazy"
            src={logo}
            className="home-image1 fade-in"
            alt="Logo"
          />
        </Link>
        <div className="home-column1 fade-in">
          <div className="vertical-line-wrapper">
            <div className="dotted-lines">.<br />.<br />.<br /><br /><br />.<br />.<br />.<br />.</div>
            <div className="home-vertical-line" />
            <a href="https://supply2u.jhubafrica.com/">
              <IoIosGlobe className="home-image-secondary"/>
            </a>
            <a href="mailto:supplytou@outlook.com">
               <MdOutlineEmail className="home-image-secondary"/>
            </a>
            <a href="tel:+254-748-837-743">
              <IoCallOutline className="home-image-secondary"/>
            </a>
          </div>
        </div>
        <div className="home-content-section fade-in">
          <div className="HomeNav fade-in">
            {/* <Link to="/">Home</Link> */}
            <a href="https://supply2u.jhubafrica.com/#introduction">About us</a>
            <div className="nav-item"><a href='https://supply2u.jhubafrica.com/#solutions'>Our Solutions</a></div>
            <Link to="/Help">Help</Link>
            
            <div className="loginSct">
              <LoginIcon />
            </div>
          </div>
          <video
            className="home-main-video"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src={mainVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <h1 className="home-heading fade-in">
            Smart Agriculture with<br /> Geo 
            <span className="typing-container"> {displayedText}</span>
          </h1>
          <p className="home-paragraph fade-in">
            Transforming agriculture supply chains through precise integration of farm geolocation data,<br /> real-time analytics,
            and consumer behavior insights.
            Empowering stakeholders at every step<br /> with unparalleled efficiency and informed decision-making.
          </p>
          <div className="GetStartedBtn fade-in">
            <Link to='/Signup'>Get started</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Section1;
