import './App.css';
import React, { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { CustomProvider } from './redux/provider.js';
import { Icon, divIcon, point } from 'leaflet';
import Login from './Authentication/Login.js';
import Reset from './Reset.js';
import PasswordChanged from './PasswordChanged.js';
import Help from './Help.js';
import Signup from './Authentication/Signup.js';
import Forgot from './Authentication/Forgot.js';
import Success from './Success.js';
import LoginIcon from './Authentication/LoginIcon.js';
import LandingPage from './LandingPage.js';
import SettingsAccount from './SettingsAccount.js';
import Solutions from './Dropdown/Solutions.js';
import Track from './OurSolutions/Track.js';
import Analytics from './OurSolutions/Analytics.js';
import SideBar from './Sidebar.js';
import Section1 from './Section1.js';
import Inquries from './Inquiries.js';
import UserInquiries from './UserInquiries.js';
import Footer from './Footer.js';
import SettingsPass from './Password.js';
import Construct from './Construct.js';
import Landing from './Landing Page/Landing.js';
import WelcomePage from './WelcomePage';
// MAPPING
import AddLocation from './Mapping/components/AddLocation.js';
import AddField from './Mapping/components/AddField';
import MainMap from './Mapping/components/MainMap';
import UpdateLocation from './Mapping/components/UpdateLocation';
import UpdateFarm from './Mapping/components/UpdateFarm';
import ActivationPage from './ActivationPage';
import Google from './ContinueWithGoogle.js';
import axiosInstance from './utils/axiosInstance.js';

function App() {
  const [locations, setLocations] = useState([]);
  const [farms, setFarms] = useState([]);
  const [farmers, setFarmers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('access');
    
    if (token) {
      axiosInstance.get('/fieldmapping/locations/')
      .then(response => {
        setLocations(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching the location data!", error);
      });

    axiosInstance.get('/fieldmapping/farms')
      .then(response => {
        setFarms(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching the farm data!", error);
      });

    axiosInstance.get('/fieldmapping/farmers')

      .then(response => {
        setFarmers(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching the farmers data!", error);
      });
    }
    
  }, []);

  const customIcon = new Icon({
    iconUrl: require("./Mapping/img/location-marker.png"),
    iconSize: [38, 38],
  });

  const createCustomClusterIcon = (cluster) => {
    return new divIcon({
      html: `<div class="cluster-icon">${cluster.getChildCount()}</div>`,
      className: 'custom-marker-cluster',
      iconSize: point(33, 33, true)
    });
  };

  const parseLocation = (locationString) => {
    const coords = locationString.split('POINT (')[1].split(')')[0].split(' ');
    return [parseFloat(coords[1]), parseFloat(coords[0])];
  };

  const parsePolygon = (polygonString) => {
    const coords = polygonString.split('POLYGON ((')[1].split('))')[0].split(', ');
    return coords.map(coord => {
      const [lng, lat] = coord.split(' ');
      return [parseFloat(lat), parseFloat(lng)];
    });
  };

  const addLocation = async (location) => {
    try {
      const res = await axiosInstance.post('/fieldmapping/locations/', location, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      setLocations([...locations, res.data]);
    } catch (error) {
      console.error("There was an error adding the location!", error);
    }
  };

  const addField = async (farm) => {
    try {
      const res = await axiosInstance.post('/fieldmapping/farms', farm, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setFarms([...farms, res.data]);
    } catch (error) {
      console.error("There was an error adding the field!", error);
    }
  };

  const handleUpdateLocation = async (id, updatedLocation) => {
    const res = await axiosInstance.put(`/fieldmapping/locations/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedLocation),
    });

    if (res.ok) {
      setLocations(locations.map((loc) => (loc.id === id ? updatedLocation : loc)));
    }
  };

  const updateFarm = async (id, updatedFarm) => {
    try {
      await axiosInstance.put(`/fieldmapping/farms/${id}/`, updatedFarm);
      setFarms(farms.map((farm) => (farm.id === id ? updatedFarm : farm)));
    } catch (error) {
      console.error("There was an error updating the farm!", error);
    }
  };

  return (
    <GoogleOAuthProvider clientId="599325683287-m0dvd4mm77na25p7qfoldped6opvek4q.apps.googleusercontent.com">
      <Router>
        <CustomProvider>
          <Routes>
            <Route path="/reset" element={<Reset />} />
            <Route path="/password-changed" element={<PasswordChanged />} />
            <Route path="/help" element={<Help />} />
            <Route path="/inquiries" element={<Inquries />} />
            <Route path="/Contact Us" element={<UserInquiries />} />
            <Route path="/login" element={<Login />} />
            <Route path="/landingPage" element={<LandingPage />} />
            <Route path="/welcome" element={<WelcomePage userFirstName="Neema" />} />
            <Route path="/OurSolutions" element={<Solutions />} />
            <Route path="/Signup" element={<Signup />} />
            <Route path="/Success" element={<Success />} />
            <Route path="/Reset Password" element={<Forgot />} />
            <Route path="/Track Order" element={<Track />} />
            <Route path="/Analytics" element={<Analytics />} />
            <Route path="/Account" element={<SettingsAccount />} />
            <Route path="/SideBar" element={<SideBar />} />
            <Route path="/Section1" element={<Section1 />} />
            <Route path="/LoginIcon" element={<LoginIcon />} />
            <Route path="/Footer" element={<Footer />} />
            <Route path="/Change Password" element={<SettingsPass />} />
            <Route path="/FAQs" element={<Help />} />
            <Route path="/Soon" element={<Construct />} />
            <Route
              path="/View Locations"
              element={
                <>
                  <MainMap
                    locations={locations}
                    farms={farms}
                    parseLocation={parseLocation}
                    parsePolygon={parsePolygon}
                    customIcon={customIcon}
                    createCustomClusterIcon={createCustomClusterIcon}
                    farmers={farmers}
                  />
                </>
              }
            />
            <Route
              path="/add-location"
              element={<AddLocation onAdd={addLocation} />}
            />
            <Route path="/add-field" element={<AddField onAdd={addField} />} />
            <Route path="/update-location/:id" element={<UpdateLocation locations={locations} farms={farms} onUpdate={handleUpdateLocation} />} />
            <Route path='/update-farm/:id' element={<UpdateFarm farms={farms} onUpdateFarm={updateFarm} />} />
            <Route path="/activate/:uidb64/:token" element={<ActivationPage />} /> {/* New activation route */}
            <Route path="/auth/google/" element={<Google/>}/>
            <Route path="/" element={<Landing/>}/>
          </Routes>
        </CustomProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
