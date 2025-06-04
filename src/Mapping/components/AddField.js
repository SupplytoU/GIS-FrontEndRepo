import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, FeatureGroup, LayersControl } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import axiosInstance from '../../utils/axiosInstance';
import Geocoder from './Geocoder';
import './crudForm.css';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { FiMenu } from 'react-icons/fi'; // Import menu icon
import useLocalStorage from "use-local-storage";
import Modal from './Modal';
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { BaseLayer } = LayersControl;

const AddField = ({ onAddField }) => {
    const [drawnCoordinates, setDrawnCoordinates] = useState('');
    const [name, setName] = useState('');
    const [id, setId] = useState('');
    const [description, setDescription] = useState('');
    const [produce, setProduce] = useState([{ produce_type: '', variety: '' }]);
    const [farmer, setFarmer] = useState('');
    const [farmArea] = useState('');
    const [farmers, setFarmers] = useState([]);
    const [notification, setNotification] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for sidebar visibility
    const sidebarRef = useRef();


    useEffect(() => {
        const fetchFarmers = async () => {
            try {
                const res = await axiosInstance.get("/fieldmapping/farmers/");
                setFarmers(res.data);
            } catch (error) {
                console.error("Error fetching farmers:", error);
                toast.error("Failed to load farmers. Please try again.");
            }
        };

        fetchFarmers();

        // Close sidebar when clicking outside
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target) && 
                !document.querySelector('.menu-toggle').contains(event.target)) {
                setIsSidebarOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleProduceChange = (index, field, value) => {
        const newProduce = [...produce];
        newProduce[index][field] = value;
        setProduce(newProduce);
    };

    const handleFieldAddition = async (e) => {
        e.preventDefault();

        if (!drawnCoordinates || !farmArea) {
            setNotification("Please draw the farm area on the map before saving.");
            setTimeout(() => {
                setNotification("");
            }, 3000);
            return;
        }

        const fieldData = {
            name,
            description,
            farm_area: drawnCoordinates,
            area_acres: farmArea,
            farmer,
            produce,
        };

        try {
            await axiosInstance.post('/fieldmapping/farms/', fieldData);
            onAddField(fieldData);
            setName('');
            setId('');
            setDescription('');
            setProduce([{ produce_type: '', variety: '' }]);
            setFarmer('');
            setDrawnCoordinates('');
            setIsModalOpen(true);
            toast.success("Field added successfully!");
        } catch (error) {
            console.error('Error adding field:', error);
            toast.error("Error adding field. Please try again.");
        }
    };


    const handleCreated = (e) => {
        const type = e.layerType;
        const layer = e.layer;
        if (type === "polygon") {
            const latlngs = layer.getLatLngs()[0].map((latlng) => `${latlng.lng} ${latlng.lat}`);
            
            if (latlngs[0] !== latlngs[latlngs.length - 1]) {
                latlngs.push(latlngs[0]);
            }

            const polygonString = `SRID=4326;POLYGON((${latlngs.join(", ")}))`;
            setDrawnCoordinates(polygonString);
            toast.info("Field area drawn successfully!");
        }
    };
    const navigate = useNavigate();
//   const handleUpdate = (id, type) => {
//     navigate(`/update-${type}/${id}`);
//   };

  const [isDark] = useLocalStorage("isDark", false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <>
            <div className="add-location-container">
                {/* Mobile Toggle Button */}
                <button className="menu-toggle" onClick={toggleSidebar}>
                    <FiMenu />
                </button>

                <div
                    ref={sidebarRef}
                    className={`form-sidebar-container ${isSidebarOpen ? 'open' : ''}`}
                    data-theme={isDark ? "dark" : "mapping"}
                >
                    <div className="nav-group">
                        <button className="back-button" onClick={() => navigate("/View Locations")}>
                            <FaArrowLeft /> <span className="home-text">Back</span>
                        </button>
                    </div>

                    <form className="add-field-form" onSubmit={handleFieldAddition}>
                        <h2 className='LocationTitle'>Add Field Drawing</h2>
                        {notification && <div className="notification">{notification}</div>}
                        <div className="form-control">
                            <label>Field Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter Field Name"
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label>Identification Number</label>
                            <input
                                type="text"
                                value={id}
                                onChange={(e) => setId(e.target.value)}
                                placeholder="Enter Identification Number"
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label>Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter Description"
                                rows="4"
                            />
                        </div>
                        <div className='form-control'>
                            <label>Produce Farmed (at least one required)</label>
                            {produce.map((prod, index) => (
                                <div key={index} className="produce-inputs">
                                    <input
                                        type='text'
                                        placeholder={`Produce Type ${index + 1}`}
                                        value={prod.produce_type}
                                        onChange={(e) => handleProduceChange(index, 'produce_type', e.target.value)}
                                        required={index === 0}
                                    />
                                    <input
                                        className='produce'
                                        type='text'
                                        placeholder={`Variety ${index + 1}`}
                                        value={prod.variety}
                                        onChange={(e) => handleProduceChange(index, 'variety', e.target.value)}
                                        required={index === 0}
                                    />
                                </div>
                            ))}
                            <button
                                type='button'
                                className='btnlocation'
                                onClick={() => setProduce([...produce, { produce_type: '', variety: '' }])}
                            >
                                Add Produce
                            </button>
                        </div>
                        <div className="form-control">
                            <label>Farmer</label>
                            <select
                                value={farmer}
                                onChange={(e) => setFarmer(e.target.value)}
                                required
                            >
                                <option value="">Select Farmer</option>
                                {farmers.map((farmer) => (
                                    <option key={farmer.id} value={farmer.id}>
                                        {farmer.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='form-control'>
                            <label>Farm Area Coordinates</label>
                            <textarea
                                value={drawnCoordinates}
                                rows="5"
                                readOnly
                            />
                        </div>
                        <button className="btnlocation" type="submit">Save Field</button>
                    </form>
                    <div className="home-button" onClick={() => navigate('/')}>SUPPLY2U</div>
                </div>

                <div className={`map-container ${isSidebarOpen ? 'overlay' : ''}`}>
                    <MapContainer center={[0, 38]} zoom={8} className='leaflet-container'>
                        <Geocoder />
                        <LayersControl position="topright">
                            <BaseLayer checked name='Google Hybrid Map'>
                                <TileLayer
                                    url="http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
                                    attribution='&copy; Google Maps'
                                    subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                                    maxZoom={23}
                                />
                            </BaseLayer>
                            <BaseLayer name='Esri World'>
                                <TileLayer
                                    url="http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                    attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                                    maxZoom={20}
                                />
                            </BaseLayer>
                        </LayersControl>
                        <FeatureGroup>
                            <EditControl
                                position="topright"
                                onCreated={handleCreated}
                                draw={{
                                    rectangle: false,
                                    circle: false,
                                    circlemarker: false,
                                    marker: false,
                                    polyline: false
                                }}
                            />
                        </FeatureGroup>
                    </MapContainer>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}/>
            <ToastContainer
                position="top-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
                transition={Bounce}
            />
        </>
    );
};

export default AddField;