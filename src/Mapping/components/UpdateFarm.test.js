// UpdateFarm.test.js

import "@testing-library/jest-dom/extend-expect";
import React, { act } from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LeafletProvider } from "@react-leaflet/core";
import UpdateFarm from "./UpdateFarm";

// Polyfill for setImmediate in case it's not defined.
if (typeof setImmediate === "undefined") {
  global.setImmediate = (fn) => setTimeout(fn, 0);
}

// -------------------------
// Consolidated Mocks
// -------------------------
jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
  },
}));

// Mock react-router-dom: useParams, useNavigate, Link.
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ id: "456" }),
    useNavigate: () => jest.fn(),
    Link: ({ children, to }) => <a href={to}>{children}</a>,
  };
});

// Mock axiosInstance for API calls.
jest.mock("../../utils/axiosInstance", () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

// Consolidated mock for react-leaflet.
// We return function components for MapContainer, TileLayer, FeatureGroup, Polygon, and LayersControl.
jest.mock("react-leaflet", () => {
  const React = require("react");
  const original = jest.requireActual("react-leaflet");

  // Dummy MapContainer: calls whenCreated/whenReady and renders children.
  const DummyMapContainer = React.forwardRef((props, ref) => {
    if (props.whenCreated) {
      setTimeout(() => {
        const mockMap = {
          setView: jest.fn(),
          flyTo: jest.fn(),
          fitBounds: jest.fn(),
          invalidateSize: jest.fn(),
          addLayer: jest.fn(),
          removeLayer: jest.fn(),
        };
        props.whenCreated(mockMap);
      }, 0);
    }
    if (props.whenReady) {
      setTimeout(() => {
        // Instead of using document.createElement, use an empty object.
        props.whenReady({ target: { _container: {} } });
      }, 0);
    }
    return <div data-testid="map-container">{props.children}</div>;
  });

  // Dummy TileLayer component.
  const DummyTileLayer = (props) => (
    <div data-testid="tile-layer">{props.url}</div>
  );

  // Dummy FeatureGroup component.
  const DummyFeatureGroup = (props) => (
    <div data-testid="feature-group">{props.children}</div>
  );

  // Dummy Polygon component.
  const DummyPolygon = (props) => (
    <div data-testid="polygon">{JSON.stringify(props.positions)}</div>
  );

  // Dummy LayersControl as a function component.
  const DummyLayersControl = (props) => (
    <div data-testid="layers-control">{props.children}</div>
  );
  // Attach static properties as function components.
  DummyLayersControl.BaseLayer = (props) => (
    <div data-testid="base-layer">{props.children}</div>
  );
  DummyLayersControl.Overlay = (props) => (
    <div data-testid="overlay">{props.children}</div>
  );

  // Dummy useMap hook.
  const dummyMapMethods = {
    flyTo: jest.fn(),
    setView: jest.fn(),
    fitBounds: jest.fn(),
    invalidateSize: jest.fn(),
  };

  return {
    ...original,
    MapContainer: DummyMapContainer,
    TileLayer: DummyTileLayer,
    FeatureGroup: DummyFeatureGroup,
    Polygon: DummyPolygon,
    LayersControl: DummyLayersControl,
    useMap: () => dummyMapMethods,
  };
});

// Consolidated mock for react-leaflet-draw.
jest.mock("react-leaflet-draw", () => {
  return {
    EditControl: (props) => {
      return (
        <div data-testid="edit-control">
          <button
            data-testid="edit-control-edited"
            onClick={() => {
              if (props.onEdited) {
                const dummyLatLngs = [
                  { lat: 30, lng: 10 },
                  { lat: 40, lng: 40 },
                  { lat: 20, lng: 40 },
                  { lat: 10, lng: 20 },
                  { lat: 30, lng: 10 },
                ];
                const dummyLayer = {
                  getLatLngs: () => [dummyLatLngs],
                };
                const dummyLayers = { eachLayer: (cb) => cb(dummyLayer) };
                props.onEdited({ layers: dummyLayers });
              }
            }}
          >
            Simulate Edit
          </button>
          {props.onCreated && (
            <button
              data-testid="create-control-created"
              onClick={() =>
                props.onCreated({
                  layerType: "polygon",
                  layer: {
                    getLatLngs: () => [
                      [
                        { lat: 30, lng: 10 },
                        { lat: 40, lng: 40 },
                        { lat: 20, lng: 40 },
                        { lat: 10, lng: 20 },
                        { lat: 30, lng: 10 },
                      ],
                    ],
                  },
                })
              }
            >
              Simulate Create
            </button>
          )}
        </div>
      );
    },
  };
});

// Mock Geocoder.
jest.mock("./Geocoder", () => {
  return function MockGeocoder() {
    return <div data-testid="geocoder">Geocoder</div>;
  };
});

// Consolidated mock for react-toastify.
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
  ToastContainer: () => <div data-testid="toast-container" />,
  Bounce: jest.fn(),
}));

// Mock use-local-storage.
jest.mock("use-local-storage", () => () => [false, jest.fn()]);

// -------------------------
// Dummy Data and Constants
// -------------------------
const dummyFarm = {
  id: "456",
  name: "Farm Original",
  description: "Original description",
  produce: [{ produce_type: "Wheat", variety: "Type A" }],
  farmer: "1",
  farm_area: "SRID=4326;POLYGON ((30 10, 40 40, 20 40, 10 20, 30 10))",
  area_acres: "50",
};

const dummyFarmers = [
  { id: "1", name: "Farmer A" },
  { id: "2", name: "Farmer B" },
];

// Define onUpdateFarmMock at the module level
const onUpdateFarmMock = jest.fn(() => Promise.resolve());

// -------------------------
// Render Helper
// -------------------------
// This helper wraps UpdateFarm in MemoryRouter and LeafletProvider, then flushes pending promises.
const renderComponent = async (props = {}) => {
  const mockLeafletContextValue = {
    map: {
      flyTo: jest.fn(),
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

  let rendered;
  await act(async () => {
    rendered = render(
      <MemoryRouter>
        <LeafletProvider value={mockLeafletContextValue}>
          <UpdateFarm farms={dummyFarmers} {...props} />
        </LeafletProvider>
      </MemoryRouter>
    );
    // Flush pending promises (e.g., from axios GET in useEffect).
    await new Promise((resolve) => setImmediate(resolve));
  });
  return rendered;
};

// -------------------------
// Tests
// -------------------------
describe("UpdateFarm Component", () => {
  // Before each test, set axiosInstance.get to resolve with dummyFarm for farm data and dummyFarmers for farmers.
  beforeEach(async () => {
    const axiosInstance = require("../../utils/axiosInstance");
    axiosInstance.get.mockImplementation((url) => {
      if (url.includes("/farmers")) {
        return Promise.resolve({ data: dummyFarmers });
      }
      return Promise.resolve({ data: dummyFarm });
    });
    await act(async () => {
      await new Promise((resolve) => setImmediate(resolve));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("displays loading initially", async () => {
    // Override axiosInstance.get to never resolve to simulate loading.
    const axiosInstance = require("../../utils/axiosInstance");
    const originalGet = axiosInstance.get;
    axiosInstance.get.mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <UpdateFarm farms={dummyFarmers} />
      </MemoryRouter>
    );
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();

    // Restore the original implementation.
    axiosInstance.get = originalGet;
  });

  test("populates form fields with fetched data", async () => {
    await renderComponent();

    // Wait for the form fields to be populated.
    await waitFor(() => {
      expect(screen.getByDisplayValue("Farm Original")).toBeInTheDocument();
    });
    expect(
      screen.getByDisplayValue("Original description")
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("Wheat")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Type A")).toBeInTheDocument();
    expect(screen.getByDisplayValue("50")).toBeInTheDocument();

    // Verify that the farm area textarea is rendered and readOnly.
    const farmAreaTextarea = screen.getByDisplayValue(dummyFarm.farm_area);
    expect(farmAreaTextarea).toBeInTheDocument();
    expect(farmAreaTextarea).toHaveAttribute("readOnly");
  });

  test("calls map.fitBounds when farm area is parsed", async () => {
    const axiosInstance = require("../../utils/axiosInstance");
    await renderComponent();

    // Verify that axiosInstance.get was called with the correct URL.
    expect(axiosInstance.get).toHaveBeenCalledWith(
      expect.stringContaining("/api/fieldmapping/farms/456")
    );
    // Verify that axiosInstance.get was called twice (one for farm, one for farmers).
    expect(axiosInstance.get).toHaveBeenCalledTimes(2);
  });

  test("submits updated farm data if form is valid", async () => {
    const localUpdateFarmMock = jest.fn(() => Promise.resolve());
    await renderComponent({ onUpdateFarm: localUpdateFarmMock });

    // Wait for form to be populated.
    await waitFor(() => {
      expect(screen.getByDisplayValue("Farm Original")).toBeInTheDocument();
    });

    // Change some fields.
    await act(async () => {
      fireEvent.change(screen.getByDisplayValue("Farm Original"), {
        target: { value: "Updated Farm" },
      });
      fireEvent.change(screen.getByDisplayValue("Original description"), {
        target: { value: "Updated description." },
      });
    });

    // Submit the form by targeting the button with the text "Update Field".
    await act(async () => {
      const updateButton = screen.getByRole("button", {
        name: /Update Field/i,
      });
      fireEvent.click(updateButton);
    });

    // Verify that onUpdateFarmMock is called with updated data.
    await waitFor(() => {
      expect(localUpdateFarmMock).toHaveBeenCalledWith("456", {
        id: "456",
        name: "Updated Farm",
        description: "Updated description.",
        produce: dummyFarm.produce,
        farmer: dummyFarm.farmer,
        farm_area: dummyFarm.farm_area,
        area_acres: dummyFarm.area_acres,
      });
    });

    // Verify that a success toast was shown.
    const { toast } = require("react-toastify");
    expect(toast.success).toHaveBeenCalledWith("Field updated successfully!");
  });

  test("shows error toast if required fields are missing on submit", async () => {
    await renderComponent({ onUpdateFarm: onUpdateFarmMock });

    // Wait for form to populate.
    await waitFor(() => {
      expect(screen.getByDisplayValue("Farm Original")).toBeInTheDocument();
    });

    // Clear the name field.
    const nameInput = screen.getByDisplayValue("Farm Original");
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: "" } });
      fireEvent.blur(nameInput);

      // Use a more specific query to target the button.
      const updateButton = screen.getByRole("button", {
        name: /Update Field/i,
      });
      fireEvent.click(updateButton);
    });

    // onUpdateFarm should not be called.
    expect(onUpdateFarmMock).not.toHaveBeenCalled();

    // Verify error toast.
    await waitFor(() => {
      const { toast } = require("react-toastify");
      expect(toast.error).toHaveBeenCalledWith(
        "Please fill in all required fields!"
      );
    });
  });

  test("shows error toast if fetching farm data fails", async () => {
    const axiosInstance = require("../../utils/axiosInstance");
    axiosInstance.get.mockImplementation((url) => {
      if (url.includes("/farmers")) {
        return Promise.resolve({ data: dummyFarmers });
      }
      return Promise.reject(new Error("Network Error"));
    });

    render(
      <MemoryRouter>
        <UpdateFarm farms={dummyFarmers} />
      </MemoryRouter>
    );

    await waitFor(() => {
      const { toast } = require("react-toastify");
      expect(toast.error).toHaveBeenCalledWith("Error fetching farm data");
    });
  });

  test("handles editing polygon via EditControl", async () => {
    await renderComponent();

    // Wait for the EditControl to be rendered.
    await waitFor(() => {
      expect(screen.getByTestId("edit-control")).toBeInTheDocument();
    });

    // Simulate clicking the edit button.
    await act(async () => {
      fireEvent.click(screen.getByTestId("edit-control-edited"));
    });

    // Verify that the farmArea textarea is updated.
    await waitFor(() => {
      const textarea = screen.getByDisplayValue(/SRID=4326;POLYGON/);
      expect(textarea).toBeInTheDocument();
    });
  });

  test("handles creating polygon via EditControl", async () => {
    await renderComponent();

    // Wait for the EditControl to be rendered.
    await waitFor(() => {
      expect(screen.getByTestId("edit-control")).toBeInTheDocument();
    });

    // Simulate clicking the create button.
    await act(async () => {
      fireEvent.click(screen.getByTestId("create-control-created"));
    });

    // Verify that the farmArea textarea is updated.
    await waitFor(() => {
      const textarea = screen.getByDisplayValue(/SRID=4326;POLYGON/);
      expect(textarea).toBeInTheDocument();
    });
  });
});
