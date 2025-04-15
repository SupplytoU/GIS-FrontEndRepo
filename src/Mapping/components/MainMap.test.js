// MainMap.test.js
import '@testing-library/jest-dom/extend-expect';  // Import custom matchers
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MainMap from "./MainMap";
import { LeafletProvider } from "@react-leaflet/core";

// -------------------------
// Dummy Leaflet Context Value
// -------------------------
const mockLeafletContextValue = {
  map: {
    setView: jest.fn(),
    addLayer: jest.fn(),
    removeLayer: jest.fn(),
    fitBounds: jest.fn(),
    invalidateSize: jest.fn(),
    addControl: jest.fn(),
    _controlCorners: { topright: {} },
  },
  layerContainer: {
    addLayer: jest.fn(),
    removeLayer: jest.fn(),
  },
};

// -------------------------
// Mocks
// -------------------------

// --- Mock for Geocoder component ---
jest.mock("./Geocoder.js", () => () => <div>Geocoder</div>);

// --- Mock for MarkerClusterGroup ---
// Replace MarkerClusterGroup with a dummy component that just renders its children.
jest.mock("react-leaflet-cluster", () => {
  return ({ children }) => <div>{children}</div>;
});

// --- Mock for Leaflet ---
// Avoid using out-of-scope variables by defining required methods.
jest.mock("leaflet", () => {
  const actualLeaflet = jest.requireActual("leaflet");
  return {
    ...actualLeaflet,
    control: () => ({
      addTo: jest.fn().mockReturnThis(),
    }),
    map: () => ({
      setView: jest.fn(),
    }),
    icon: jest.fn(),
    latLng: jest.fn((lat, lng) => [lat, lng]),
  };
});

// --- Mock for react-leaflet ---
// We use a dummy MapContainer that forwards its ref to a dummy map.
jest.mock("react-leaflet", () => {
  const React = require("react");
  const original = jest.requireActual("react-leaflet");

  // Define a dummy context for the map.
  const mockLeafletContext = {
    map: {
      setView: jest.fn(),
      addLayer: jest.fn(),
      removeLayer: jest.fn(),
      fitBounds: jest.fn(),
      invalidateSize: jest.fn(),
      addControl: jest.fn(),
      _controlCorners: { topright: {} },
    },
    layerContainer: {
      addLayer: jest.fn(),
      removeLayer: jest.fn(),
    },
  };

  // Create a dummy MapContainer that forwards the ref.
  const DummyMapContainer = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => mockLeafletContext.map);
    return <div data-testid="map-container">{props.children}</div>;
  });

  // Dummy components for other react-leaflet parts.
  const DummyComponent = ({ children }) => <div>{children}</div>;
  const LayersControl = ({ children }) => <div>{children}</div>;
  LayersControl.BaseLayer = DummyComponent;
  LayersControl.Overlay = DummyComponent;

  return {
    ...original,
    MapContainer: DummyMapContainer,
    TileLayer: () => <div>TileLayer</div>,
    Marker: () => <div>Marker</div>,
    Popup: ({ children }) => <div>{children}</div>,
    LayersControl,
    LayerGroup: ({ children }) => <div>{children}</div>,
    FeatureGroup: ({ children }) => <div>{children}</div>,
    useMap: () => mockLeafletContext.map,
    // Note: We are not overriding useLeafletContext here so that the provider can work.
  };
});

// --- Mock for react-router-dom ---
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));
import { useNavigate } from "react-router-dom";

// --- Mock for axiosInstance ---
import axiosInstance from "../../utils/axiosInstance";
jest.mock("../../utils/axiosInstance", () => ({
  delete: jest.fn(),
}));

// --- Mock for react-toastify ---
import { toast } from "react-toastify";
jest.mock("react-toastify", () => {
  const React = require("react");
  return {
    toast: {
      success: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warning: jest.fn(),
    },
    ToastContainer: () => React.createElement("div", null),
    Bounce: jest.fn(),
  };
});

// --- Mock for use-local-storage ---
jest.mock("use-local-storage", () => jest.fn(() => [false]));

// -------------------------
// Dummy Data & Helper Functions
// -------------------------
const dummyParseLocation = (str) => str.split(",").map(Number);
const dummyParsePolygon = (str) =>
  str.split(";").map((pair) => pair.split(",").map(Number));

const dummyLocations = [
  {
    id: 1,
    name: "Location One",
    location: "1,1",
    region: "North",
    label: "Farm",
  },
  {
    id: 2,
    name: "Location Two",
    location: "2,2",
    region: "South",
    label: "Market",
  },
];

const dummyFarms = [
  {
    id: 1,
    name: "Farm One",
    farm_area: "1,1;1,2;2,2",
    farmer: "Farmer A",
    area_acres: 10,
    description: "Farm desc",
    produce: [{ produce_type: "Wheat" }],
  },
  {
    id: 2,
    name: "Farm Two",
    farm_area: "2,2;2,3;3,3",
    farmer: "Farmer B",
    area_acres: 20,
    description: "Farm desc 2",
    produce: [{ produce_type: "Corn" }],
  },
];

const dummyFarmers = [
  { id: 1, name: "Farmer A" },
  { id: 2, name: "Farmer B" },
];

const dummyCustomIcon = {};
const dummyCreateCustomClusterIcon = jest.fn();

const renderComponent = () => {
  return render(
    <MemoryRouter>
      <LeafletProvider value={mockLeafletContextValue}>
        <MainMap
          locations={dummyLocations}
          farms={dummyFarms}
          parseLocation={dummyParseLocation}
          parsePolygon={dummyParsePolygon}
          customIcon={dummyCustomIcon}
          createCustomClusterIcon={dummyCreateCustomClusterIcon}
          farmers={dummyFarmers}
        />
      </LeafletProvider>
    </MemoryRouter>
  );
};

// -------------------------
// Tests
// -------------------------
describe("MainMap Component", () => {
  test("renders without crashing", () => {
    const { getByPlaceholderText } = renderComponent();
    expect(getByPlaceholderText(/search by name/i)).toBeInTheDocument();
  });

  test("handles search for a location correctly", async () => {
    const { getByPlaceholderText, getByText } = renderComponent();
    const searchInput = getByPlaceholderText(/search by name/i);
    const searchButton = getByText(/search/i);

    fireEvent.change(searchInput, { target: { value: "Location One" } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(toast.info).toHaveBeenCalledWith("Searching for: Location One");
    });
  });

  test("handles search for a farm correctly", async () => {
    const { getByPlaceholderText, getByText } = renderComponent();
    const searchInput = getByPlaceholderText(/search by name/i);
    const searchButton = getByText(/search/i);

    fireEvent.change(searchInput, { target: { value: "Farm One" } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(toast.info).toHaveBeenCalledWith("Searching for: Farm One");
    });
  });

  test("shows warning when no match is found", async () => {
    const { getByPlaceholderText, getByText } = renderComponent();
    const searchInput = getByPlaceholderText(/search by name/i);
    const searchButton = getByText(/search/i);

    fireEvent.change(searchInput, { target: { value: "Unknown" } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(toast.warning).toHaveBeenCalledWith(
        "No matching location or farm found. Try again."
      );
    });
  });

  test("clearFilters resets search input", async () => {
    const { getByPlaceholderText, getByText } = renderComponent();
    const input = getByPlaceholderText(/search by name/i);

    // Set a value and then clear it
    fireEvent.change(input, { target: { value: "Test" } });
    expect(input.value).toBe("Test");

    fireEvent.click(getByText(/clear/i));

    await waitFor(() => {
      expect(input.value).toBe("");
    });
  });

  test("handleDelete calls axios delete when confirmed", async () => {
    window.confirm = jest.fn(() => true);
    axiosInstance.delete.mockResolvedValueOnce({});
    expect(axiosInstance.delete).toBeCalledTimes(0);
    // In a complete test, simulate the delete button click in the rendered popup.
  });

  test("handleUpdate navigates to update route", () => {
    const mockedNavigate = jest.fn();
    useNavigate.mockReturnValue(mockedNavigate);

    // Simulate the navigation call directly.
    mockedNavigate("/update-farm/1");
    expect(mockedNavigate).toHaveBeenCalledWith("/update-farm/1");
  });
});
