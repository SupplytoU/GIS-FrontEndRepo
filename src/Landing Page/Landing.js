import React, { useState, useEffect } from 'react';
import Section1 from './Section1'
import Section2 from './Section2';
import Section3 from './Section3'
import InquiriesForm from './Inquiries';
import Footer  from './Footer';
import Loading from '../Loading';
import styles from './LandingPage.module.css';

const Landing = () => {
  const [loading, setLoading] = useState(true);
  const [,setShowScroll] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowScroll(true);
      } else {
        setShowScroll(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLoadingComplete = () => {
    console.log('Loading animation completed');
  };
  return (
    <>
    {loading ? (
      <Loading onLoadComplete={handleLoadingComplete} />
    ) : (
      <>
    <div className={styles.container}>
      <div className={styles.content}>
        <div class name= {styles.section1}>
        {/* <SideNavigation /> */}
        <Section1 /></div>
        <Section2/>
        <Section3/>
        <InquiriesForm/>
        <Footer/>
      </div>
    </div>
    </>
  )}
    </>
  );
};

export default Landing;