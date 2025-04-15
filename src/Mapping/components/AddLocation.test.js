// AddLocation.test.js
import "@testing-library/jest-dom/extend-expect";
import React, { act } from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LeafletProvider } from "@react-leaflet/core";
import AddLocation from "./AddLocation";

// -------------------------
// Mocks
// -------------------------

// Mock Geocoder to render a dummy element.
jest.mock("./Geocoder", () => () => <div>Geocoder</div>);

// Mock react-leaflet-draw EditControl to simulate marker creation.
jest.mock("react-leaflet-draw", () => ({
  EditControl: ({ onCreated }) => (
    <button
      data-testid="create-marker-button"
      onClick={() =>
        onCreated({
          layerType: "marker",
          layer: {
            getLatLng: () => ({ lat: 1.23, lng: 4.56 }),
            remove: jest.fn(),
          },
        })
      }
    >
      Simulate Marker Create
    </button>
  ),
}));

// Define dummy functions for map methods.
const mockFlyTo = jest.fn();
const mockSetView = jest.fn();
const mockAddLayer = jest.fn();
const mockRemoveLayer = jest.fn();

// Mock react-leaflet components.
jest.mock("react-leaflet", () => {
  const React = require("react");
  const original = jest.requireActual("react-leaflet");

  // Dummy MapContainer that forwards its ref and exposes dummy map methods.
  const DummyMapContainer = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      flyTo: mockFlyTo,
      setView: mockSetView,
      addLayer: mockAddLayer,
      removeLayer: mockRemoveLayer,
    }));
    return <div data-testid="map-container">{props.children}</div>;
  });

  const DummyComponent = ({ children }) => <div>{children}</div>;
  const LayersControl = ({ children }) => <div>{children}</div>;
  LayersControl.BaseLayer = DummyComponent;
  LayersControl.Overlay = DummyComponent;

  return {
    ...original,
    MapContainer: DummyMapContainer,
    TileLayer: () => <div>TileLayer</div>,
    FeatureGroup: ({ children }) => <div>{children}</div>,
    LayersControl,
    // Provide dummy useMap that exposes the same dummy map methods.
    useMap: () => ({
      flyTo: mockFlyTo,
      setView: mockSetView,
      addLayer: mockAddLayer,
      removeLayer: mockRemoveLayer,
    }),
  };
});

// Mock react-router-dom for useNavigate and Link.
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

// Mock react-toastify.
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
  ToastContainer: () => <div />,
  Bounce: jest.fn(),
}));

// Mock use-local-storage.
jest.mock("use-local-storage", () => jest.fn(() => [false]));

// Mock Modal to render a dummy div when open.
jest.mock(
  "./Modal",
  () => (props) =>
    props.isOpen ? <div data-testid="modal">{props.children}</div> : null
);

// Mock axiosInstance for network calls.
jest.mock("../../utils/axiosInstance", () => ({
  get: jest.fn(() =>
    Promise.resolve({
      data: [{ name: "Farm One" }, { name: "Farm Two" }],
    })
  ),
  post: jest.fn(),
  delete: jest.fn(),
}));

// -------------------------
// Dummy Data and Constants
// -------------------------
const LABEL_CHOICES = {
  Farm: "farms",
  "Processing Facility": "processing-facilities",
  "Distribution Center": "distribution-centers",
  Warehouse: "warehouses",
  Restaurant: "restaurants",
  Supermarket: "supermarkets",
};

const REGION_CHOICES = {
  Central: "central",
  Coast: "coast",
  Eastern: "eastern",
  Nairobi: "nairobi",
  "North Eastern": "north-eastern",
  Nyanza: "nyanza",
  "Rift Valley": "rift-valley",
  Western: "western",
};

// -------------------------
// Render Helper
// -------------------------
// Wraps the component in MemoryRouter and LeafletProvider.
const renderComponent = (props = {}) => {
  // Provide a dummy Leaflet context value.
  const mockLeafletContextValue = {
    map: {
      flyTo: mockFlyTo,
      setView: mockSetView,
      addLayer: mockAddLayer,
      removeLayer: mockRemoveLayer,
    },
    layerContainer: {
      addLayer: mockAddLayer,
      removeLayer: mockRemoveLayer,
    },
  };

  return render(
    <MemoryRouter>
      <LeafletProvider value={mockLeafletContextValue}>
        <AddLocation
          farms={[{ name: "Farm One" }, { name: "Farm Two" }]}
          {...props}
        />
      </LeafletProvider>
    </MemoryRouter>
  );
};

// Reset mocks before each test.
beforeEach(() => {
  jest.clearAllMocks();
});

// -------------------------
// Tests
// -------------------------
describe("AddLocation Component", () => {
  test("renders form with title", () => {
    renderComponent();
    expect(screen.getByText(/Enter Location Details/i)).toBeInTheDocument();
  });

  test("simulates marker creation and updates latitude/longitude", async () => {
    renderComponent();
    // Simulate marker creation.
    await act(async () => {
      fireEvent.click(screen.getByTestId("create-marker-button"));
    });
    // Verify that the latitude and longitude inputs are updated.
    expect(screen.getByPlaceholderText(/Add Latitude/i).value).toBe("1.23");
    expect(screen.getByPlaceholderText(/Add Longitude/i).value).toBe("4.56");
    // Verify that flyTo was called with expected parameters.
    expect(mockFlyTo).toHaveBeenCalledWith([1.23, 4.56], 15);
  });

  test("submits location data if form is valid", async () => {
    const onAddMock = jest.fn();
    renderComponent({ onAdd: onAddMock });

    // Fill out "Location Name", Latitude, Longitude, and Description.
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Add Location Name/i), {
        target: { value: "Test Location" },
      });
      fireEvent.change(screen.getByPlaceholderText(/Add Latitude/i), {
        target: { value: "1.23" },
      });
      fireEvent.change(screen.getByPlaceholderText(/Add Longitude/i), {
        target: { value: "4.56" },
      });
      fireEvent.change(screen.getByPlaceholderText(/Add Description/i), {
        target: { value: "A test location." },
      });
    });

    // Change the Label select.
    const comboboxes = screen.getAllByRole("combobox");
    const labelSelect = comboboxes[0];
    await act(async () => {
      fireEvent.change(labelSelect, { target: { value: "Farm" } });
    });
    expect(labelSelect.value).toBe("Farm");

    // Wait for the Farm select to appear and then target it specifically by test ID
    await waitFor(() => {
      expect(screen.getByTestId("farm-select")).toBeInTheDocument();
    });

    // Use the test ID to find the farm select dropdown
    const farmSelect = screen.getByTestId("farm-select");
    await act(async () => {
      fireEvent.change(farmSelect, { target: { value: "Farm One" } });
    });
    expect(farmSelect.value).toBe("Farm One");

    // Change the Region select (assuming it's the last select element).
    const updatedComboboxes = screen.getAllByRole("combobox");
    const regionSelect = updatedComboboxes[updatedComboboxes.length - 1];
    await act(async () => {
      fireEvent.change(regionSelect, { target: { value: "Nairobi" } });
    });
    expect(regionSelect.value).toBe("Nairobi");

    // Simulate marker creation to update latitude/longitude if needed.
    await act(async () => {
      fireEvent.click(screen.getByTestId("create-marker-button"));
    });

    // Submit the form.
    await act(async () => {
      fireEvent.click(screen.getByDisplayValue(/Save Location/i));
    });

    // Verify that onAdd is called with the correctly mapped data.
    await waitFor(() => {
      expect(onAddMock).toHaveBeenCalledWith({
        name: "Test Location",
        label: LABEL_CHOICES["Farm"],
        location: "SRID=4326;POINT (4.56 1.23)",
        region: REGION_CHOICES["Nairobi"],
        description: "A test location.",
        farmName: "Farm One",
      });
    });
  });

  test("shows error toast if required fields are missing", async () => {
    renderComponent();
    await act(async () => {
      fireEvent.click(screen.getByDisplayValue(/Save Location/i));
    });
    await waitFor(() => {
      const { toast } = require("react-toastify");
      expect(toast.error).toHaveBeenCalledWith(
        "Please fill in all required fields!"
      );
    });
  });
});
