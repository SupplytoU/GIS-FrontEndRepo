import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, LayersControl, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import Geocoder from './Geocoder';
import './crudForm.css';
import axiosInstance from '../../utils/axiosInstance';
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

const UpdateLocation = ({farms, onUpdate }) => 
{
  const { id } = useParams();
  const navigate = useNavigate();
  const [location, setLocation] = useState();
  const [name, setName] = useState('');
  const [label, setLabel] = useState('');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [region, setRegion] = useState('');
  const [description, setDescription] = useState('');
  const [farmName, setFarmName] = useState('');
  const [notification, setNotification] = useState('');

  const mapRef = useRef();
  const featureGroupRef = useRef();


  useEffect(() => {
    axiosInstance.get('http://localhost:8000/api/fieldmapping/locations/' + id)
      .then(response => {
        setLocation(response.data);
      })
      .catch(error => {
        toast.error('Error fetching location data');
      });
  }, [id]);

  useEffect(() => {
    if (location) {
      setName(location.name);
      setLabel(location.label);

      // Parse the location string
      const coords = parseLocation(location.location);
      setLatitude(coords.lat);
      setLongitude(coords.lng);

      setRegion(location.region);
      setDescription(location.description);
      setFarmName(location.farmName || '');
    }
  }, [location]);

  useEffect(() => {
    if (latitude && longitude) {
      mapRef.current.flyTo([latitude, longitude], 15);
    }
  }, [latitude, longitude]);

  const parseLocation = (locationString) => {
    const match = locationString.match(/SRID=\d+;POINT\s*\(([^)]+)\)/);
    if (match) {
      const [lng, lat] = match[1].split(' ').map(parseFloat);
      return { lat, lng };
    }
    return { lat: 0, lng: 0 };
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!name || !latitude || !longitude) {
      toast.error('Please fill in all required fields!');
      setNotification('Please fill in all required fields!');
      return;
    }

    const updatedLocation = {
      id,
      name,
      label,
      location: `SRID=4326;POINT (${longitude} ${latitude})`,
      region,
      description,
      farmName: label === 'Farm' ? farmName : undefined,
    };

    await onUpdate(id, updatedLocation);

    setNotification('Location details updated successfully!');
    toast.success('Location details updated successfully!');

    setTimeout(() => {
      setNotification('');
      navigate('/');
    }, 3000); // Clear the notification and navigate to main map after 3 seconds
  };

  if (!location) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="update-location-container">
        <div className="form-sidebar-container">
          <form className="update-location-form" onSubmit={onSubmit}>
            <h2>Update Location Details</h2>
            {notification && <div className="notification">{notification}</div>}
            <div className="form-control">
              <label>Location Name</label>
              <input
                type="text"
                placeholder="Update Location Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label>Identification Number</label>
              <input
                type="text"
                placeholder="Update Identification Number"
                value={id}
                readOnly
              />
            </div>
            <div className="form-control">
              <label>Label</label>
              <select
                value={Object.keys(LABEL_CHOICES).find(
                  (key) => LABEL_CHOICES[key] === label
                )}
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
                placeholder="Update Latitude"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
              />
            </div>
            <div className="form-control">
              <label>Longitude</label>
              <input
                type="text"
                placeholder="Update Longitude"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
              />
            </div>
            <div className="form-control">
              <label>Region</label>
              <select
                value={Object.keys(REGION_CHOICES).find(
                  (key) => REGION_CHOICES[key] === region
                )}
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
                placeholder="Update Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
              />
            </div>
            <input
              type="submit"
              value="Update Location"
              className="btn btn-block"
            />
          </form>
        </div>
        <MapContainer
          center={[latitude || 0, longitude || 38]}
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
          <FeatureGroup ref={featureGroupRef}>
            {latitude && longitude && (
              <Marker
                position={[latitude, longitude]}
                draggable
                eventHandlers={{
                  dragend: (event) => {
                    const marker = event.target;
                    const position = marker.getLatLng();
                    setLatitude(position.lat);
                    setLongitude(position.lng);
                  },
                }}
              />
            )}
            <EditControl
              position="topright"
              onCreated={(e) => {
                const { layerType, layer } = e;
                if (layerType === "marker") {
                  const { lat, lng } = layer.getLatLng();
                  setLatitude(lat);
                  setLongitude(lng);
                }
              }}
              featureGroup={featureGroupRef.current}
              draw={{
                rectangle: false,
                circle: false,
                circlemarker: false,
                polyline: false,
                polygon: false,
              }}
            />
          </FeatureGroup>
        </MapContainer>
      </div>
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

export default UpdateLocation;

















