import React, { useState } from 'react';
import Account from "./Images/Account.png";
import HelpImg from "./Images/Help.png";
import Theme from './Images/theme.png';
import { Toggle } from "./Toggle/Toggle";
import useLocalStorage from "use-local-storage";
import "./Sidebar.css";
import { Link } from "react-router-dom";
import { IoIosArrowForward, IoIosLogOut, IoIosMenu } from "react-icons/io";
import Modal from './Modal'; // Import Modal component
import axiosInstance from './utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ collapsed, toggleSidebar }) => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useLocalStorage("isDark", false);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal

  const handleLogoutClick = async () => {
    try {
      await axiosInstance.post('/logout/')
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
      setIsModalOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    // Show modal when logout is clicked
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close modal function
  };

  return (
    <>
      <div className={`Settingsdiv ${collapsed ? 'collapsed' : ''}`} data-theme={isDark ? "dark" : "light"}>
        <div className="sidebar-toggle" onClick={toggleSidebar}>
          <IoIosMenu />
        </div>
        <div className="Settingsdiv-2">
          <div className="Settingsdiv-3">
            <div className="Settings">Settings</div>
            <div className="SettingsAccount">
              <img loading="lazy" src={Account} className="Settingsimg-1" alt='image' />
              <div className="AccountTxt">Account</div>
            </div>
          </div>
          <div className="SettingsLine" />
          <div className="Settingsdiv-8">
            <div className="Settingsdiv-9">
              <div className="SettingsEditProfile">
                <div className="SettingsEdit"><Link to='/Account'>Edit Profile</Link></div>
                <div className="SettingsChangePass"><Link to='/Change Password'>Change Password</Link></div>
              </div>
              <div className="Settingsdiv-13">
                <Link to='/Account'><IoIosArrowForward className='Settingsimg-3'/></Link>
                <Link to='/ChangePassword'><IoIosArrowForward className='Settingsimg-3' /></Link>
              </div>
            </div>
          </div>
          <div className="Settingsdiv-3">
            <div className="SettingsAccount">
              <img loading="lazy" src={Theme} className="Settingsimg-1" alt='image'/>
              <div className="AccountTxt">Appearance</div>
            </div>
          </div>
          <div className="SettingsLine" />
          <div className="Settingsdiv-9">
            <div className="NotificationsTxt">Theme</div>
            <div className='Settings-toggle'>
              <Toggle
                isChecked={isDark}
                handleChange={() => setIsDark(!isDark)}
              />
            </div>
          </div>
          <div className="Settingsdiv-3">
            <div className="SettingsAccount">
              <img loading="lazy" src={HelpImg} className="Settingsimg-1" alt='image'/>
              <div className="AccountTxt">Help</div>
            </div>
          </div>
          <div className="SettingsLine" />
          <div className="Settingsdiv-8">
            <div className="Settingsdiv-9">
              <div className="SettingsEditProfile">
                <div className="SettingsEdit"><Link to='/Help'>FAQs</Link></div>
                <div className="SettingsChangePass"><Link to='/Inquiries'>Inquiries</Link></div>
              </div>
              <div className="Settingsdiv-13">
                <Link to='/Help'><IoIosArrowForward className='Settingsimg-3' /></Link>
                <Link to='/Inquiries'><IoIosArrowForward className='Settingsimg-3' /></Link>
              </div>
            </div>
          </div>
        </div>
        <div className='Settingsdiv-30'>
          <div className="Settingsdiv-29"><Link to="/">SUPPLY2U</Link></div>
          <div className='Settingsdiv-27' onClick={handleLogoutClick}> {/* Change Link to div with onClick */}
            <IoIosLogOut className='LogoutImg' />
            <div className="Settingsdiv-28">Logout</div>
          </div>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal} /> {/* Add Modal component */}
    </>
  );
}

export default Sidebar;
