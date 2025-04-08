import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, FeatureGroup, LayersControl, Polygon } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import axiosInstance from '../../utils/axiosInstance';
import { useParams, useNavigate } from 'react-router-dom';
import Geocoder from './Geocoder';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import './crudForm.css';
import useLocalStorage from "use-local-storage";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { BaseLayer } = LayersControl;

const UpdateFarm = ({ farms, onUpdateFarm }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef();
  const polygonRef = useRef(); // Create a ref for the Polygon  
  const [farm, setFarm] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [produce, setProduce] = useState([{ produce_type: '', variety: '' }]);
  const [farmer, setFarmer] = useState('');
  const [farmArea, setFarmArea] = useState('');
  const [area, setArea] = useState('');
  const [farmers, setFarmers] = useState([]);
  const [notification, setNotification] = useState('');
  const [mapReady, setMapReady] = useState(false);


  useEffect(() => {
    axiosInstance.get('http://localhost:8000/api/fieldmapping/farms/' + id)
      .then(response => {
        setFarm(response.data);
      })
      .catch(error => {
        toast.error('Error fetching farm data');
        console.error("There was an error fetching the farm data!", error);
      });
  }, [id]);

  useEffect(() => {
    if (farm) {
      setName(farm.name);
      setDescription(farm.description);
      setProduce(farm.produce);
      setFarmer(farm.farmer);
      setFarmArea(farm.farm_area);
      setArea(farm.area_acres);

      const parsedArea = parseFarmArea(farm.farm_area);
      if (mapReady && mapRef.current) {
        mapRef.current.fitBounds(parsedArea);
      }
    }
  }, [id, farm, farms, mapReady]);

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const res = await axiosInstance.get('http://localhost:8000/api/fieldmapping/farmers');
        setFarmers(res.data);
      } catch (error) {
        toast.error('Error fetching farmers data');
        console.error('Error fetching farmers:', error);
      }
    };
    fetchFarmers();
  }, []);

  const handleProduceChange = (index, field, value) => {
    const newProduce = [...produce];
    newProduce[index][field] = value;
    setProduce(newProduce);
  };

  const handleFieldUpdate = async (e) => {
    e.preventDefault();

    const updatedFarm = {
      ...farm,
      name,
      description,
      produce,
      farmer,
      farm_area: farmArea,
      area_acres: area,
    };

    console.log(updatedFarm);

    onUpdateFarm(farm.id, updatedFarm);
    toast.success('Field updated successfully!');
    setNotification('Field updated successfully!');
      setTimeout(() => {
        setNotification('');
        navigate('/');
      }, 3000);

  };

  const handleEdited = (e) => {
    e.layers.eachLayer((layer) => {
      if (layer instanceof L.Polygon) {
        const latlngs = layer.getLatLngs()[0].map((latlng) => `${latlng.lng} ${latlng.lat}`);
latlngs.push(latlngs[0]); // Close the polygon
const polygonString = `SRID=4326;POLYGON ((${latlngs.join(', ')}))`;
console.log(polygonString);
        setFarmArea(polygonString);
      }
    });
  };

  const handleCreated = (e) => {
    const layer = e.layer;
    if (layer instanceof L.Polygon) {
      const latlngs = layer.getLatLngs()[0].map((latlng) => `${latlng.lng} ${latlng.lat}`);
      latlngs.push(latlngs[0]);
      const polygonString = `SRID=4326;POLYGON ((${latlngs.join(', ')}))`;
      setFarmArea(polygonString);
    }
  };

  const parseFarmArea = (farmArea) => {
    const coordinatesString = farmArea.replace('SRID=4326;POLYGON ((', '').replace('))', '');
    const coordinates = coordinatesString.split(', ').map((coord) => {
      const [lng, lat] = coord.split(' ').map(Number);
      return [lat, lng];
    });
    return coordinates;
  };
  const [isDark] = useLocalStorage("isDark", false);
  if (!farm || !farmers.length) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="add-location-container">
        <div className="form-sidebar-container" data-theme={isDark ? "dark" : "mapping"}>
          <form className="add-field-form" onSubmit={handleFieldUpdate}>
            <h2>Update Field Drawing</h2>
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
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter Description"
                rows="4"
              />
            </div>
            <div className="form-control">
              <label>Produce Farmed (at least one required)</label>
              {produce.map((prod, index) => (
                <div key={index} className="produce-inputs">
                  <input
                    type="text"
                    placeholder={`Produce Type ${index + 1}`}
                    value={prod.produce_type}
                    onChange={(e) =>
                      handleProduceChange(index, "produce_type", e.target.value)
                    }
                    required={index === 0}
                  />
                  <input
                    type="text"
                    placeholder={`Variety ${index + 1}`}
                    value={prod.variety}
                    onChange={(e) =>
                      handleProduceChange(index, "variety", e.target.value)
                    }
                    required={index === 0}
                  />
                </div>
              ))}
              <button
              className='btnlocation'
                type="button"
                onClick={() =>
                  setProduce([...produce, { produce_type: "", variety: "" }])
                }
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
            <div className="form-control">
              <label>Area</label>
              <input
                type="number"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Enter Area"
              />
            </div>
            <div className="form-control">
              <label>Farm Area Coordinates</label>
              <textarea
                value={farmArea}
                onChange={(e) => setFarmArea(e.target.value)}
                rows="5"
                readOnly
                required
              />
            </div>
            <button className="btnlocation" type="submit">Update Field</button>
          </form>
        </div>
        <MapContainer
          center={[0, 38]}
          zoom={8}
          className="leaflet-container"
          ref={mapRef}
          whenReady={() => setMapReady(true)}
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
              onEdited={handleEdited}
              onCreated={handleCreated}
              draw={{
                rectangle: false,
                polyline: false,
                circle: false,
                marker: false,
                circlemarker: false,
              }}
            />
            {farmArea && (
              <Polygon ref={polygonRef} positions={parseFarmArea(farmArea)} />
            )}
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

export default UpdateFarm;
