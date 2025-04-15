import React, { useState, useRef, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MapContainer, TileLayer, Marker, Popup, LayersControl, Polygon, LayerGroup } from 'react-leaflet';
import { Icon } from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import Geocoder from './Geocoder';
import { useNavigate} from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import './MainMap.css'; // Import the CSS file for button styling
import { FaArrowLeft } from 'react-icons/fa'; // Import the arrow icon
import useLocalStorage from "use-local-storage";

const { BaseLayer, Overlay } = LayersControl;

delete Icon.Default.prototype._getIconUrl;

Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
});

function MainMap({ locations, farms, parseLocation, parsePolygon, customIcon, createCustomClusterIcon, farmers }) {
  const [activeLocation, setActiveLocation] = useState(null);
  const [activeFarm, setActiveFarm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState('');
  const [selectedProduce, setSelectedProduce] = useState('');
  const [filteredLocations, setFilteredLocations] = useState(locations);
  const [filteredFarms, setFilteredFarms] = useState(farms);
  const [, setIsLoading] = useState(true);


  const navigate = useNavigate();
  const mapRef = useRef();


  useEffect(() => {
    setFilteredLocations(locations);
    setFilteredFarms(farms);
  }, [locations, farms]);


  useEffect(() => {
    // Simulate a loading delay for demonstration purposes
    setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Adjust the timeout duration as needed
  }, []);
  const handleDelete = async (id, type) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this item?");
    if (confirmDelete) {
      try {
        await axiosInstance.delete(`http://localhost:8000/api/fieldmapping/${type}/${id}`);
        toast.success(`${type} deleted successfully!`);
        window.location.reload(); // Reload the page to reflect changes
      } catch (error) {
        console.error("There was an error deleting the item!", error);
        toast.error("Failed to delete the item. Please try again.");
      }
    }
  };

  const handleUpdate = (id, type) => {
    if (!id || !type) {
      toast.error("Invalid update request. Please select a valid item.");
      return;
    }
    navigate(`/update-${type}/${id}`);
  };

  const handleSearch = () => {
    const searchTermLower = searchTerm.toLowerCase();

    let foundLocation = locations.find(location => location.name.toLowerCase() === searchTermLower);
    let foundFarm = farms.find(farm => farm.name.toLowerCase() === searchTermLower);

    if (foundLocation) {
      toast.info(`Searching for: ${foundLocation.name}`);
      setFilteredLocations([foundLocation]);
      setFilteredFarms([]);
      zoomToLocation(foundLocation);
    } else if (foundFarm) {
      toast.info(`Searching for: ${foundFarm.name}`);
      setFilteredLocations([]);
      setFilteredFarms([foundFarm]);
      zoomToFarm(foundFarm);
    } else {
      toast.warning("No matching location or farm found. Try again.");
    }
  };

  const handleRegionChange = (event) => {
    setSelectedRegion(event.target.value);
    applyFilters(event.target.value, selectedLabel, selectedFarmer, selectedProduce);
  };

  const handleLabelChange = (event) => {
    setSelectedLabel(event.target.value);
    applyFilters(selectedRegion, event.target.value, selectedFarmer, selectedProduce);
  };

  const handleFarmerChange = (event) => {
    setSelectedFarmer(event.target.value);
    applyFilters(selectedRegion, selectedLabel, event.target.value, selectedProduce);
  };

  const handleProduceChange = (event) => {
    setSelectedProduce(event.target.value);
    applyFilters(selectedRegion, selectedLabel, selectedFarmer, event.target.value);
  };

  const applyFilters = (region, label, farmer, produce) => {
    const filteredLocs = locations.filter(location => {
      return (
        (!region || location.region === region) &&
        (!label || location.label === label)
      );
    });

    const filteredFarms = farms.filter(farm => {
      return (
        (!farmer || farm.farmer === farmer) &&
        (!produce || farm.produce.some(produceItem => produceItem.produce_type === produce))
      );
    });

    setFilteredLocations(filteredLocs);
    setFilteredFarms(filteredFarms);

    if (!filteredLocs.length || !filteredFarms.length) {
      toast.info("No matching locations or farms for the selected filters.");
    }

  };

const zoomToLocation = (location) => {
  if (!location) return;
  const [lat, lng] = parseLocation(location.location);
  if (mapRef.current) {
    mapRef.current.setView([lat, lng], 15, { duration: 1.5 });
  }
};




  const handleLocationSelectChange = (e) => {
    const selectedLocation = filteredLocations.find(
      (location) => String(location.id) === e.target.value // Ensure type match
    );
    if (selectedLocation) {
      zoomToLocation(selectedLocation);
      setActiveLocation(selectedLocation);
    }
  };

  const handleFarmSelectChange = (e) => {
    const selectedFarm = filteredFarms.find(
      (farm) => String(farm.id) === e.target.value // Ensure type match
    );
    if (selectedFarm) {
      zoomToFarm(selectedFarm);
      setActiveFarm(selectedFarm);
    }
  };

const zoomToFarm = (farm) => {
  if (!farm) return;
  const [lat, lng] = parsePolygon(farm.farm_area)[0];
  if (mapRef.current) {
    mapRef.current.setView([lat, lng], 15, { duration: 1.5 });
  }
};
  const [isDark] = useLocalStorage("isDark", false);

  const clearFilters = () => {
    toast.info("Filters cleared and map reset.", {
      autoClose: 1000,
    }
    );
    //window.location.reload(); // Reload the page to reflect change
    setSearchTerm('');
    setSelectedRegion('');
    setSelectedLabel('');
    setSelectedFarmer('');
    setSelectedProduce('');
    setFilteredLocations(locations);
    setFilteredFarms(farms);
    mapRef.current.setView([0, 38], 7);
    
  };

  // if (isLoading) {
  //   return <MapLoading onLoadComplete={() => setIsLoading(false)} />;
  // }

  return (
    <>
      <div className="MainMap">
        <div
          className="filter-container"
          data-theme={isDark ? "dark" : "mapping"}
        >
          <button className="back-button" onClick={() => navigate("/")}>
          <FaArrowLeft /> <span className="home-text">HOME</span>
            </button>

          <div className="search-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                className="SearchByName"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button onClick={handleSearch}>Search</button>
            </div>
            <div className="filters">
              <div className="filter-group">
                <h3>Location Filters</h3>
                <div className="select-group">
                  <select value={selectedRegion} onChange={handleRegionChange}>
                    <option value="">All Regions</option>
                    {Array.from(
                      new Set(locations.map((location) => location.region))
                    ).map((region) => (
                      <option key={region} value={region} className="options">
                        {region}
                      </option>
                    ))}
                  </select>
                  <select value={selectedLabel} onChange={handleLabelChange}>
                    <option value="">All Labels</option>
                    {Array.from(
                      new Set(locations.map((location) => location.label))
                    ).map((label) => (
                      <option key={label} value={label} className="options">
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="filtered-results">
                  <h4>Locations Found ({filteredLocations.length}):</h4>

                  <select onChange={handleLocationSelectChange}>
                    <option value="">Select Location</option>
                    {filteredLocations.map((location) => (
                      <option
                        key={location.id}
                        value={String(location.id)}
                        className="options"
                      >
                        {location.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="filter-group">
                <h3>Farm Filters</h3>
                <div className="select-group">
                  <select value={selectedFarmer} onChange={handleFarmerChange}>
                    <option value="">All Farmers</option>
                    {farmers.map((farmer) => (
                      <option
                        key={farmer.id}
                        value={farmer.id}
                        className="options"
                      >
                        {farmer.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedProduce}
                    onChange={handleProduceChange}
                  >
                    <option value="">All Produce</option>
                    {Array.from(
                      new Set(
                        farms.flatMap((farm) =>
                          farm.produce.map((produce) => produce.produce_type)
                        )
                      )
                    ).map((produce) => (
                      <option key={produce} value={produce} className="options">
                        {produce}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="filtered-results">
                  <h4>Farms Found ({filteredFarms.length}):</h4>
                  <select onChange={handleFarmSelectChange}>
                    <option value="">Select Farm</option>
                    {filteredFarms.map((farm) => (
                      <option
                        key={farm.id}
                        value={String(farm.id)}
                        className="options"
                      >
                        {farm.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="mainSideBar">
              <button
                className="mainSideBar-button"
                onClick={() => navigate("/add-location")}
              >
                Add Location
              </button>
              <button
                className="mainSideBar-button"
                onClick={() => navigate("/add-field")}
              >
                Add Field
              </button>
              <button className="mainSideBar-button" onClick={clearFilters}>
                Clear
              </button>
            </div>
          </div>
        </div>
        <MapContainer
          center={[0, 38]}
          zoom={7}
          ref={mapRef}
          style={{ height: "100vh" }}
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
                maxZoom={20}
              />
            </BaseLayer>
            <BaseLayer name="Topo Map">
              <TileLayer
                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
            </BaseLayer>
            <BaseLayer name="Open Street Map">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
              />
            </BaseLayer>
            <BaseLayer name="Esri World">
              <TileLayer
                url="http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                maxZoom={20}
              />
            </BaseLayer>
            <BaseLayer name="Traffic Map">
              <TileLayer
                url="https://{s}.google.com/vt/lyrs=m@221097413,traffic&x={x}&y={y}&z={z}"
                attribution="&copy; Google Maps"
                subdomains={["mt0", "mt1", "mt2", "mt3"]}
                maxZoom={20}
              />
            </BaseLayer>
            <Overlay checked name="Location Markers">
              <LayerGroup>
                <MarkerClusterGroup
                  iconCreateFunction={createCustomClusterIcon}
                >
                  {filteredLocations.map((location) => (
                    <Marker
                      key={location.id}
                      position={parseLocation(location.location)}
                      icon={customIcon}
                      eventHandlers={{
                        click: () => {
                          setActiveLocation(location);
                        },
                      }}
                    />
                  ))}
                </MarkerClusterGroup>
                {activeLocation && (
                  <Popup
                    position={parseLocation(activeLocation.location)}
                    onClose={() => {
                      setActiveLocation(null);
                    }}
                  >
                    <div>
                      <h2>{activeLocation.name}</h2>
                      <p>{activeLocation.label}</p>
                      <button
                        className="delete-button"
                        onClick={() =>
                          handleDelete(activeLocation.id, "locations")
                        }
                      >
                        Delete
                      </button>
                      <button
                        className="update-button"
                        onClick={() =>
                          navigate(`/update-location/${activeLocation.id}`)
                        }
                      >
                        Update
                      </button>
                    </div>
                  </Popup>
                )}
              </LayerGroup>
            </Overlay>
            <Overlay checked name="Farm Polygons">
              <LayerGroup>
                {filteredFarms.map((farm) => (
                  <Polygon
                    key={farm.id}
                    positions={parsePolygon(farm.farm_area)}
                    eventHandlers={{
                      click: () => {
                        setActiveFarm(farm);
                      },
                    }}
                  />
                ))}
                {activeFarm && (
                  <Popup
                    position={parsePolygon(activeFarm.farm_area)[0]}
                    onClose={() => {
                      setActiveFarm(null);
                    }}
                  >
                    <div>
                      <h2>{activeFarm.name}</h2>
                      <p>
                        <b>Acres: </b>
                        {activeFarm.area_acres}
                      </p>
                      <p>
                        <b>Owner: </b>
                        {activeFarm.farmer}
                      </p>
                      <p>
                        <b>Description: </b>
                        {activeFarm.description}
                      </p>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(activeFarm.id, "farms")}
                      >
                        Delete
                      </button>
                      <button
                        className="update-button"
                        onClick={() => handleUpdate(activeFarm.id, "farm")}
                      >
                        Update
                      </button>
                    </div>
                  </Popup>
                )}
              </LayerGroup>
            </Overlay>
          </LayersControl>
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
}

export default MainMap;
