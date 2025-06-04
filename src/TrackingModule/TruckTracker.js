// src/components/TruckTracker.js
import React, { useEffect, useState, useRef, useCallback } from "react";
import { LoadScript } from "@react-google-maps/api";
import { v4 as uuidv4 } from "uuid";
import PubNub from "pubnub";
import { GOOGLE_MAPS_LIBRARIES } from "../config/googleMapsConfig"; // Adjust this path if needed

const PUBLISH_KEY = process.env.REACT_APP_PUBNUB_PUBLISH_KEY;
const SUBSCRIBE_KEY = process.env.REACT_APP_PUBNUB_SUBSCRIBE_KEY;
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const DEFAULT_LOCATION = { lat: 0.0236, lng: 37.9062 };
const DEFAULT_ZOOM = 7;
const DETAILED_ZOOM = 15;
const MAP_ID = "7e2d5affe92524d0";
const SMOOTHING_FACTOR = 0.1;

const pubnub = new PubNub({
  publishKey: PUBLISH_KEY,
  subscribeKey: SUBSCRIBE_KEY,
  userId: uuidv4(),
});

const TruckTracker = () => {
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [heading, setHeading] = useState(0);
  const [destination, setDestination] = useState("");
  const [isLocationAccessed, setIsLocationAccessed] = useState(false);

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const currentLocationRef = useRef(DEFAULT_LOCATION);
  const targetHeadingRef = useRef(0);
  const animationFrameRef = useRef(null);

  const getMarkerIcon = (heading) => ({
    path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
    scale: 6,
    fillColor: "#00FFFF",
    fillOpacity: 1,
    strokeColor: "#000000",
    strokeWeight: 2,
    rotation: heading,
    anchor: new window.google.maps.Point(0, 0),
  });

  const smoothRotateMarker = useCallback(() => {
    if (!markerRef.current) return;

    const currentHeading = markerRef.current.getIcon()?.rotation || 0;
    const targetHeading = targetHeadingRef.current;
    let diff = targetHeading - currentHeading;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    const newHeading = currentHeading + diff * SMOOTHING_FACTOR;
    markerRef.current.setIcon(getMarkerIcon(newHeading));

    if (Math.abs(diff) > 0.5) {
      animationFrameRef.current = requestAnimationFrame(smoothRotateMarker);
    }
  }, []);

  const updateMarker = useCallback((latitude, longitude, heading) => {
    if (markerRef.current) {
      const newPosition = { lat: latitude, lng: longitude };
      markerRef.current.setPosition(newPosition);
      currentLocationRef.current = newPosition;

      if (heading !== null) {
        targetHeadingRef.current = heading;
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = requestAnimationFrame(smoothRotateMarker);
      }
    }
  }, [smoothRotateMarker]);

  const handlePositionUpdate = useCallback((position) => {
    const { latitude, longitude, heading } = position.coords;
    const newLocation = { lat: latitude, lng: longitude };

    setLocation(newLocation);
    currentLocationRef.current = newLocation;

    if (heading !== null) {
      setHeading(heading);
      targetHeadingRef.current = heading;
    }

    pubnub.publish({
      channel: "tracking",
      message: newLocation,
    });

    updateMarker(latitude, longitude, heading);

    if (!isLocationAccessed) {
      setIsLocationAccessed(true);
      const map = directionsRendererRef.current?.getMap();
      if (map) {
        map.setCenter(new window.google.maps.LatLng(latitude, longitude));
        map.setZoom(DETAILED_ZOOM);
      }
    }
  }, [isLocationAccessed, updateMarker]);

  const handleDeviceOrientation = useCallback((event) => {
    if (event.alpha !== null) {
      targetHeadingRef.current = event.alpha;
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = requestAnimationFrame(smoothRotateMarker);
    }
  }, [smoothRotateMarker]);

  const handleGetRoute = useCallback((destinationLatLng) => {
    if (!destinationLatLng) {
      alert("Please select a destination");
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    const origin = new window.google.maps.LatLng(
      currentLocationRef.current.lat,
      currentLocationRef.current.lng
    );

    const request = {
      origin,
      destination: destinationLatLng,
      travelMode: window.google.maps.TravelMode.DRIVING,
    };

    directionsService.route(request, (result, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        directionsRendererRef.current.setDirections(result);

        if (destinationMarkerRef.current) {
          destinationMarkerRef.current.setMap(null);
        }

        destinationMarkerRef.current = new window.google.maps.Marker({
          position: destinationLatLng,
          map: directionsRendererRef.current.getMap(),
        });

        directionsRendererRef.current.getMap().fitBounds(result.routes[0].bounds);
      } else {
        console.error("Error fetching directions: ", status);
        alert("Could not find a route to the destination.");
      }
    });
  }, []);

  const initializeMap = useCallback(() => {
    if (!directionsRendererRef.current && mapRef.current) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: location,
        zoom: DEFAULT_ZOOM,
        mapId: MAP_ID,
      });

      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true,
      });

      markerRef.current = new window.google.maps.Marker({
        position: location,
        map,
        icon: getMarkerIcon(heading),
        title: "Your Location",
        optimized: false,
      });

      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current);
      autocomplete.setFields(["address_components", "geometry", "formatted_address"]);

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) return;

        const destLocation = place.geometry.location;
        map.setCenter({ lat: destLocation.lat(), lng: destLocation.lng() });
        map.setZoom(DETAILED_ZOOM);

        if (destinationMarkerRef.current) {
          destinationMarkerRef.current.setMap(null);
        }

        destinationMarkerRef.current = new window.google.maps.Marker({
          position: destLocation,
          map,
        });

        setDestination(place.formatted_address);
        handleGetRoute(destLocation);
      });

      autocompleteRef.current = autocomplete;
    }
  }, [location, heading, handleGetRoute]); // <-- FIXED: Added handleGetRoute

  const handleDestinationChange = (e) => setDestination(e.target.value);

  useEffect(() => {
    pubnub.subscribe({ channels: ["tracking"] });
    pubnub.addListener({
      message: (event) => {
        const { lat, lng } = event.message;
        const newLocation = { lat, lng };
        setLocation(newLocation);
        currentLocationRef.current = newLocation;
      },
    });

    const watchId = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      (error) => {
        console.error("Error getting location: ", error);
        alert("Unable to retrieve your location. Please allow location access.");
      },
      { enableHighAccuracy: true }
    );

    window.addEventListener("deviceorientation", handleDeviceOrientation);

    return () => {
      pubnub.unsubscribeAll();
      navigator.geolocation.clearWatch(watchId);
      window.removeEventListener("deviceorientation", handleDeviceOrientation);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [handlePositionUpdate, handleDeviceOrientation]);

  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  return (
    <LoadScript
      googleMapsApiKey={GOOGLE_MAPS_API_KEY}
      libraries={GOOGLE_MAPS_LIBRARIES}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "10px" }}>
          <label>Enter Destination Name or Address:</label>
          <input
            ref={inputRef}
            type="text"
            value={destination}
            onChange={handleDestinationChange}
            placeholder="E.g., Nairobi, Kenya"
            style={{ marginRight: "10px", width: "300px" }}
          />
        </div>
        <div ref={mapRef} style={{ width: "100%", height: "80vh" }} />
      </div>
    </LoadScript>
  );
};

export default TruckTracker;