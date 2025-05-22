import React, { useState } from "react";
import './Inquiries.css';
import phone from "./Images/Phone.png";
import email from "./Images/Email.png";
import web from "./Images/Web.png";
import location from "./Images/Location.png";
import Sidebar from './Sidebar';
import useLocalStorage from "use-local-storage";
import emailjs from 'emailjs-com'; 
import InquiriesModal from "./InquiriesModal";

function Inquiries() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isDark] = useLocalStorage("isDark", false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required.";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      newErrors.email = "Invalid email format.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^\d{10,15}$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number format.";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsButtonDisabled(false); // Disable button on form submit

    // Sending email with EmailJS
    emailjs
      .send("service_i8r0sol", "template_2joutye", {
        from_name: `${formData.firstName} ${formData.lastName}`, // User's full name
        from_email: formData.email, // User's email
        from_phone: formData.phone, // User's phone
        message_sent: formData.message, // User's message
      }, "UzzQKjNZgNgkBw5Cb")
      .then((response) => {
        setIsButtonDisabled(true);
        setIsModalOpen(true);
        // Clear the form after submission
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          message: "",
        });
        setErrors({}); // Clear errors
        setIsButtonDisabled(false); // Re-enable button after alert
      })
      .catch((err) => {
        console.error("Error sending email:", err);
        alert("Failed to send message. Please try again.");
        setIsButtonDisabled(false); // Re-enable button if there's an error
      });
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className={`container1 ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <Sidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div className="inquiries-container" data-theme={isDark ? "dark" : "light"}>         
        <div className="form-container">
          <div className="form-layout">
            <div className="message-column">
              <div className="message-box">
                <div className="send-message-header">
                  <span className="send-message-title">Send us a message</span>
                  {/* <img src={mail} alt="Mail icon" className="icon-mail" /> */}
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="name-fields">
                    <div className="field-container">
                      <label className="field-label" htmlFor="firstName">First Name</label>
                      <input
                        type="text"
                        id="firstName"
                        className="form-fields"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="First Name"
                      />
                      {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                      <div className="Line2"></div>
                    </div>
                    <div className="field-container">
                      <label className="field-label" htmlFor="lastName">Last Name</label>
                      <input
                        type="text"
                        id="lastName"
                        className="form-fields"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Last Name"
                      />
                      {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                      <div className="Line5"></div>
                    </div>
                  </div>
                  <div className="field-container">
                    <label className="field-label" htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      className="form-fields"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email"
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                    <div className="Line3"></div>
                  </div>
                  <div className="field-container">
                    <label className="field-label" htmlFor="phone">Phone</label>
                    <input
                      type="text"
                      id="phone"
                      className="form-fields"
                      value={formData.phone}
                      onChange={handleInputChange} 
                      placeholder="e.g. 071234567"
                    />
                    {errors.phone && <span className="error-message">{errors.phone}</span>}
                    <div className="Line6"></div>
                  </div>
                  <div className="field-container">
                    <label className="field-label" htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      className="form-fields"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Message"
                    />
                    {errors.message && <span className="error-message">{errors.message}</span>}
                    <div className="Line4"></div>
                  </div>
                  <button type="submit" className="send-button" disabled={isButtonDisabled}>Send</button>
                </form>
              </div>
            </div>
            <div className="contact-column">
              <div className="contact-box">
                <div className="contact-header">Contact Information</div>
                <div className="Line2"></div>
                <div className="contact-details">
                  <div className="contact-info">
                    <img src={phone} alt="Phone" className="contact-icon" />
                    <a href="tel:+254-748-837-743">+254-748-837-743</a> 
                  </div>
                  <div className="contact-info">
                    <img src={email} alt="Email" className="contact-icon" />
                    <a href="mailto:supply2u@outlook.com">supply2u@outlook.com</a>                    
                  </div>
                  <div className="contact-info">
                    <img src={web} alt="Web" className="contact-icon" />
                    <a href="https://supply2u.jhubafrica.com" target="_blank" rel="noopener noreferrer">
                      supply2u.jhubafrica.com
                    </a>
                  </div>
                  <div className="contact-info">
                    <img src={location} alt="Location" className="contact-icon" />
                    <a href="https://maps.app.goo.gl/QYzmJ1MJv6ygqVtZA">Jomo Kenyatta University Of Agriculture And Technology</a> 
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    <InquiriesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default Inquiries;
