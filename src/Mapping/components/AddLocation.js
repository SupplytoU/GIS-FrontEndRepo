import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, FeatureGroup, LayersControl } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import { useNavigate} from 'react-router-dom';
import Geocoder from './Geocoder';
import Modal from './Modal'; 
import './crudForm.css';
import { FaArrowLeft } from 'react-icons/fa';
import useLocalStorage from "use-local-storage";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from '../../utils/axiosInstance';

const { BaseLayer } = LayersControl;

// Create a mapping for label choices
const LABEL_CHOICES = {
  "Farm": "farms",
  "Processing Facility": "processing-facilities",
  "Distribution Center": "distribution-centers",
  "Warehouse": "warehouses",
  "Restaurant": "restaurants",
  "Supermarket": "supermarkets",
};

const REGION_CHOICES = {
  'Central': 'central',
  'Coast': 'coast',
  'Eastern': 'eastern',
  'Nairobi': 'nairobi',
  'North Eastern': 'north-eastern',
  'Nyanza': 'nyanza',
  'Rift Valley': 'rift-valley',
  'Western': 'western'
};

const AddLocation = ({ onAdd }) => {
  const [name, setName] = useState("");
  const [label, setLabel] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [region, setRegion] = useState("");
  const [description, setDescription] = useState("");
  const [farmName, setFarmName] = useState("");
  const [farms, setFarms] = useState([]); // Define farms state
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const mapRef = useRef();
  const markerRef = useRef();

  useEffect(() => {
    const fetchFarms = async () => {
      const res = await axiosInstance.get("https://gis-backend-1c87.onrender.com/api/fieldmapping/farms/");
      setFarms(res.data); // Update farms state
    };

    fetchFarms();
  }, []);

  const onCreated = (e) => {
    const { layerType, layer } = e;
    if (layerType === "marker") {
      const { lat, lng } = layer.getLatLng();
      setLatitude(lat);
      setLongitude(lng);
      mapRef.current.flyTo([lat, lng], 15);
      markerRef.current = layer; // Store reference to the marker
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!name || !latitude || !longitude || !label || !region) {
      toast.error("Please fill in all required fields!");
      return;
    }

    // Map the label and region to the corresponding values
    const labelValue = LABEL_CHOICES[label] || "";
    const regionValue = REGION_CHOICES[region] || "";

    onAdd({
      name,
      label: labelValue, // Use the mapped label value
      location: `SRID=4326;POINT (${longitude} ${latitude})`,
      region: regionValue, // Use the mapped region value
      description,
      farmName: labelValue === "farms" ? farmName : undefined, // Update farmName condition
    });

    // Reset form fields
    setName("");
    setLabel("");
    setLatitude("");
    setLongitude("");
    setRegion("");
    setDescription("");
    setFarmName("");

    // Open modal to show success message
    setIsModalOpen(true);

    if (markerRef.current) {
      markerRef.current.remove(); // Remove the marker from the map
      markerRef.current = null;
    }

    mapRef.current.flyTo([0, 38], 8); // Reset map to initial position
  };

  const navigate = useNavigate();

  //Dark mode/light mode
const [isDark] = useLocalStorage("isDark", false);

  return (
    <>
      <div className="add-location-container">
        <div
          className="form-sidebar-container"
          data-theme={isDark ? "dark" : "mapping"}
        >
          <button
            className="back-button"
            onClick={() => navigate("/View Locations")}
          >
            <FaArrowLeft /> <span className="home-text">Back</span>
          </button>

          <form className="add-location-form" onSubmit={onSubmit}>
            <h2 className="LocationTitle">Enter Location Details</h2>
            <div className="form-control">
              <label>Location Name</label>
              <input
                type="text"
                placeholder="Add Location Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-control">
              <label>Label</label>
              <select
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                required
              >
                <option value="">Select Label</option>
                {Object.keys(LABEL_CHOICES).map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </div>
            {label === "Farm" && (
              <div className="form-control">
                <label>Farm</label>
                <select
                  data-testid="farm-select"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  required
                >
                  <option value="">Select Farm</option>
                  {farms.map((farm) => (
                    <option key={farm.name} value={farm.name}>
                      {farm.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-control">
              <label>Latitude</label>
              <input
                type="text"
                placeholder="Add Latitude"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                required
              />
            </div>
            <div className="form-control">
              <label>Longitude</label>
              <input
                type="text"
                placeholder="Add Longitude"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                required
              />
            </div>
            <div className="form-control">
              <label>Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                required
              >
                <option value="">Select Region</option>
                {Object.keys(REGION_CHOICES).map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label>Description</label>
              <textarea
                type="text"
                placeholder="Add Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
              />
            </div>
            <input
              type="submit"
              value="Save Location"
              className="btnlocation"
            />
          </form>
        </div>
        <MapContainer
          center={[0, 38]}
          zoom={8}
          className="leaflet-container"
          ref={mapRef}
          whenReady={() => toast.success("Map loaded successfully!")}
          error={(err) => {
            console.error("Map loading error:", err);
            toast.error(
              "Failed to load the map. Please try refreshing the page."
            );
          }}
        >
          <Geocoder />
          <LayersControl position="topright">
            <BaseLayer checked name="Google Hybrid Map">
              <TileLayer
                url="http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
                attribution="&copy; Google Maps"
                subdomains={["mt0", "mt1", "mt2", "mt3"]}
                maxZoom={23}
              />
            </BaseLayer>
            <BaseLayer name="Terrain Map">
              <TileLayer
                url="http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
                attribution="&copy; Google Maps"
                subdomains={["mt0", "mt1", "mt2", "mt3"]}
                maxZoom={20}
              />
            </BaseLayer>
            <BaseLayer name="Esri World">
              <TileLayer
                url="http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                maxZoom={20}
              />
            </BaseLayer>
          </LayersControl>
          <FeatureGroup>
            <EditControl
              position="topright"
              draw={{
                rectangle: false,
                circle: false,
                circlemarker: false,
                polyline: false,
                polygon: false,
              }}
              onCreated={onCreated}
            />
          </FeatureGroup>
        </MapContainer>
      </div>

      {/* Modal to show success message */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
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

export default AddLocation;
