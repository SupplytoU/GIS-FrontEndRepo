import React, { useState } from 'react';
import Sidebar from './Sidebar';
import './SettingsAccount.css';
import { MdOutlinePassword } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import useLocalStorage from "use-local-storage";
import Modal from './Modal'; // Import Modal component
//For the tour
import { Steps, Hints } from "intro.js-react";
import "intro.js/introjs.css";

const SettingsPass = ({ page }) => { // Add page prop to determine which page is active
  const [isEditable, setIsEditable] = useState(false);
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isDark] = useLocalStorage("isDark", false);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleEditClick = () => {
    setIsEditable(!isEditable);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveChanges = () => {
    setIsModalOpen(true); // Show modal when saving changes
    setIsEditable(false);
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close modal function
  };

  const [stepsEnabled, setStepsEnabled] = useState(false);
  const [initialStep] = useState(0);
  const [steps] = useState([
    {
      element: ".Account",
      intro: "Welcome to your account password section! </br>Here you can manage your password."
    },
    {
      element: ".EditIcon2",
      intro: "To edit your password, click on this icon to activate the fields."
    },
    {
      element: ".AccountDetails",
      intro: "Ensure all details filled here are accurate and then click on the save button."
    }
    
  ]);

  const [hintsEnabled, setHintsEnabled] = useState(false);
  const [hints] = useState([
    {
      element: ".EditIcon2",
      hint: "Account hint",
      hintPosition: "middle-right"
    }
  ]);

  const toggleSteps = () => {
    setStepsEnabled(!stepsEnabled);
  };

  const toggleHints = () => {
    setHintsEnabled(!hintsEnabled);
  };
  return (
    <div className={`settings-account-container ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <Sidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div className="Accountdiv" data-theme={isDark ? "dark" : "light"}>
        <div className="AccountBody">
          <div className="Accountdiv-3">
            <div className="Accountcolumn">
              <MdOutlinePassword className='PasswordImg' />
            </div>
            <div className="Accountcolumn-2">
              <div className="Account">Account</div>
            </div>
          </div>
        </div>
        <div>
        <Steps
          enabled={stepsEnabled}
          steps={steps}
          initialStep={initialStep}
          onExit={() => setStepsEnabled(false)}
        />
        <Hints enabled={hintsEnabled} hints={hints} />
        <div className="Controls">
          <button onClick={toggleSteps} className='ControlButton'>Get a tour</button>
          <button onClick={toggleHints} className='ControlButton'>Tour Hints</button>
        </div>
        </div>
        <div className='SettingsAccountBody'>
          <div className="EditProfile" onClick={handleEditClick}>
            Change Password <CiEdit className="EditIcon2" />
          </div>
          <div className='AccountDetails'>
          <div className="Accountdiv-6">
            <div className="Accountdiv-7">
              <div className="AccountFirstName">Enter the previously used password</div>
              {isEditable ? (
                <input
                  type="password"
                  className="Accountdiv-9"
                  name="oldPassword"
                  value={formData.oldPassword}
                  onChange={handleChange}
                />
              ) : (
                <div className="Accountdiv-9">{formData.oldPassword}</div>
              )}
            </div>
            <div className="Accountdiv-10" />
          </div>
          <div className="Accountdiv-6">
            <div className="Accountdiv-7">
              <div className="AccountFirstName">New Password</div>
              {isEditable ? (
                <input
                  type="password"
                  className="Accountdiv-9"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                />
              ) : (
                <div className="Accountdiv-9">{formData.newPassword}</div>
              )}
            </div>
            <div className="Accountdiv-10">
              <div className="AccountFirstName">
                Confirm Password
              </div>
              {isEditable ? (
                <input
                  type="password"
                  className="Accountdiv-9"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              ) : (
                <div className="Accountdiv-9">{formData.confirmPassword}</div>
              )}
            </div>
          </div>
          </div>
          {isEditable && (
            <div className="Accountdiv-23">
              <div className="AccountSave" onClick={handleSaveChanges}>
                Save Changes
              </div>
            </div>
          )}
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal} /> {/* Add Modal component */}
    </div>
  );
};

export default SettingsPass;
