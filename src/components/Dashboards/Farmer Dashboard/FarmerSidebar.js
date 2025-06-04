import './FarmerDashboard.css';
import icon from '../../../Images/Performance Macbook.png';
import locations from '../../../Images/Place Marker.png';
import farm from '../../../Images/Grass.png';
import field from '../../../Images/Farm 2.png';
import track from '../../../Images/Journey.png';
import settings from '../../../Images/Settings.png';
import logouticon from '../../../Images/Logout Rounded.png';
import useLocalStorage from 'use-local-storage';

const FarmerSidebar = () => {
    const [isDark] = useLocalStorage("isDark", false);
    return (
        <>
            <div className='FarmerSidebar' data-theme={isDark ? "dark" : "light"}>
                <div className='DashTitle'>
                    <img className='DashboardIcon' src={icon} alt="Dashboard Icon" />
                    <h6>Dashboard</h6>
                </div>
                <div className='FarmerLinks'>
                    <div className='Location'>
                        <img className='PlaceMarker' src={locations} alt="View Locations" />
                        <p>View Locations</p>
                    </div>
                    <div className='Location'>
                        <img className='PlaceMarker' src={farm} alt="Add Farms" />
                        <p>Add Farms</p>
                    </div>
                    <div className='Location'>
                        <img className='PlaceMarker' src={field} alt="Add Fields" />
                        <p>Add Fields</p>
                    </div>
                    <div className='Location'>
                        <img className='PlaceMarker' src={track} alt="Track Delivery" />
                        <p>Track Delivery</p>
                    </div>
                    <div className='Location'>
                        <img className='PlaceMarker' src={settings} alt="Settings" />
                        <p>Settings</p>
                    </div>
                </div>
                <div className='FarmerLogout'>
                    <img className='LogoutIcon' src={logouticon} alt="Logout" />
                    <p>Logout</p>
                </div>
            </div>
        </>
    );
};

export default FarmerSidebar;
