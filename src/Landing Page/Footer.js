import React from 'react';
import styles from './Footer.module.css';
import { ContactItem } from './ContactItem';
import { useNavigate} from 'react-router-dom';

function Footer(){
const contactData = [
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/8cdd257381d6b42febbeaf022153963a1b12e98c00bb76f858c4ef983940cfe2?placeholderIfAbsent=true&apiKey=7a55d1e3f90e440382ed8e79ea8a2c83",
    title: "Pay Us a Visit",
    description: "Jomo Kenyatta University of Agriculture and Technology"
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/73ed87b08a20a4c1bcbce2a8e7962b4af78e361556d8bc57b33e8b08202cb1e5?placeholderIfAbsent=true&apiKey=7a55d1e3f90e440382ed8e79ea8a2c83",
    title: "Give Us a Call",
    description: "+254 759 191 326"
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/5a1023add4a41bf2043952cfeb1cc6611f40c95a5436c5dd5b3fff3b155eea61?placeholderIfAbsent=true&apiKey=7a55d1e3f90e440382ed8e79ea8a2c83",
    title: "Send Us a Message",
    description: "supplytou@outlook.com"
  }
];

const navigate = useNavigate();
// const handleUpdate = (id, type) => {
//   navigate(`/update-${type}/${id}`);
// };


  return (
    <footer className={styles.footer}>
      <div className={styles.topSection}>
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/19b9921da98f387897924650c2b7463b8c82ff0e141d67a4ddc990ee74b33d6b?placeholderIfAbsent=true&apiKey=7a55d1e3f90e440382ed8e79ea8a2c83"
          className={styles.logo}
          alt="Supply2U Logo"
        />
        
        {contactData.map((contact, index) => (
          <React.Fragment key={contact.title}>
            <ContactItem {...contact} />
            {index < contactData.length - 1 && (
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/4c12f57527f6d2962694404ab9b5789976363d555cbc05f9f208a1dd8235ea19?placeholderIfAbsent=true&apiKey=7a55d1e3f90e440382ed8e79ea8a2c83"
                className={styles.divider}
                alt="Divider"
              />
            )}
          </React.Fragment>
        ))}
      </div>
        <div className={styles.navigation}>
          <div className={styles.navLink} onClick={() => navigate('/Signup')}>SIGN UP</div>
          <a href='https://supply2u.jhubafrica.com/' className={styles.navLink}>ABOUT US </a>
          <a href='https://supply2u.jhubafrica.com/#solutions' className={styles.navLink}>OUR SOLUTIONS</a>
          {/* add the right link */}
          <div className={styles.navLink} onClick={() => navigate('/FAQs')}>FAQs</div> 

        </div>

      <img
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/42e68dc9ee13cd6bd0c936d20f714e2ede5f34c2972b1382a4c92a775a32b4bd?placeholderIfAbsent=true&apiKey=7a55d1e3f90e440382ed8e79ea8a2c83"
        className={styles.footerImage}
        alt="Footer"
      />      
      <div className={styles.copyright}>
        2024 ©SUPPLY2U- ALL RIGHTS RESERVED
      </div>
    </footer>
  );
};

export default Footer;