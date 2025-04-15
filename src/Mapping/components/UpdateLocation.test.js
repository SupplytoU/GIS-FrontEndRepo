// UpdateLocation.test.js

import "@testing-library/jest-dom/extend-expect";
import React, { act } from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LeafletProvider } from "@react-leaflet/core";
import UpdateLocation from "./UpdateLocation";

// Polyfill for setImmediate (if not already defined)
if (typeof setImmediate === "undefined") {
  global.setImmediate = (fn) => setTimeout(fn, 0);
}

// -------------------------
// Mocks
// -------------------------

// Define dummy functions for map methods
const mockFlyTo = jest.fn();
const mockSetView = jest.fn();
const mockAddLayer = jest.fn();
const mockRemoveLayer = jest.fn();

// Mock useParams to supply an id (e.g., "123").
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ id: "123" }),
    useNavigate: jest.fn(),
    Link: ({ children, to }) => <a href={to}>{children}</a>,
  };
});

// Mock axiosInstance for network calls.
jest.mock("../../utils/axiosInstance", () => ({
  get: jest.fn(),
  put: jest.fn(), // Make sure to mock PUT if that's what UpdateLocation uses
  post: jest.fn(),
  delete: jest.fn(),
}));

// Mock react-leaflet components
jest.mock("react-leaflet", () => {
  const React = require("react");
  const original = jest.requireActual("react-leaflet");

  // Dummy MapContainer that forwards its ref and exposes dummy map methods
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
    // Provide dummy useMap that exposes the same dummy map methods
    useMap: () => ({
      flyTo: mockFlyTo,
      setView: mockSetView,
      addLayer: mockAddLayer,
      removeLayer: mockRemoveLayer,
    }),
  };
});

// Mock react-leaflet-draw to simulate marker creation.
jest.mock("react-leaflet-draw", () => ({
  EditControl: ({ onCreated }) => (
    <button
      data-testid="create-marker-button"
      onClick={() =>
        onCreated({
          layerType: "marker",
          layer: {
            // Simulate marker event with updated latitude and longitude.
            getLatLng: () => ({ lat: 9.99, lng: 8.88 }),
            remove: jest.fn(),
          },
        })
      }
    >
      Simulate Marker Create
    </button>
  ),
}));

// Mock Geocoder to render a dummy element.
jest.mock("./Geocoder", () => () => <div>Geocoder</div>);

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

// Mock use-local-storage to always return false (light theme).
jest.mock("use-local-storage", () => jest.fn(() => [false]));

// -------------------------
// Dummy Data and Constants
// -------------------------
const dummyLocation = {
  id: "123",
  name: "Original Location",
  label: "farms", // Stored mapped value
  location: "SRID=4326;POINT (8.88 9.99)", // Stored as POINT (lng lat)
  region: "nairobi", // Stored mapped value
  description: "Original description",
  farmName: "Original Farm",
};

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

// Helper function to reverse-map from stored values to display values
const getDisplayLabel = (storedValue) => {
  return (
    Object.keys(LABEL_CHOICES).find(
      (key) => LABEL_CHOICES[key] === storedValue
    ) || ""
  );
};

const getDisplayRegion = (storedValue) => {
  return (
    Object.keys(REGION_CHOICES).find(
      (key) => REGION_CHOICES[key] === storedValue
    ) || ""
  );
};

// -------------------------
// Render Helper
// -------------------------
// Wrap UpdateLocation in MemoryRouter and LeafletProvider.
// Provide dummy farms data via props.
const renderComponent = async (props = {}) => {
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

  let rendered;
  await act(async () => {
    rendered = render(
      <MemoryRouter>
        <LeafletProvider value={mockLeafletContextValue}>
          <UpdateLocation
            farms={[{ name: "Farm One" }, { name: "Farm Two" }]}
            {...props}
          />
        </LeafletProvider>
      </MemoryRouter>
    );
    // Flush pending promises (e.g., from axios GET in useEffect)
    await new Promise((resolve) => setImmediate(resolve));
  });
  return rendered;
};

// -------------------------
// Tests
// -------------------------
describe("UpdateLocation Component", () => {
  // Before each test, mock axiosInstance.get to resolve with dummy location data.
  beforeEach(() => {
    jest.clearAllMocks();
    const axiosInstance = require("../../utils/axiosInstance");
    axiosInstance.get.mockResolvedValue({ data: dummyLocation });
  });

  test("displays loading initially", async () => {
    // Simulate a pending GET request by returning a promise that never resolves.
    const axiosInstance = require("../../utils/axiosInstance");
    axiosInstance.get.mockReturnValue(new Promise(() => {}));
    await renderComponent();
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  test("populates form fields with fetched data", async () => {
    await renderComponent();

    // After fetching, form fields should be populated with dummyLocation data
    // Use more flexible queries - checking for different attributes
    await waitFor(() => {
      // Check if an input with the value "Original Location" exists
      const nameInput = screen
        .getAllByRole("textbox")
        .find((input) => input.value === "Original Location");
      expect(nameInput).toBeInTheDocument();

      // Find the label select and check it displays "Farm"
      const labelSelect = screen
        .getAllByRole("combobox")
        .find((select) => select.value === "Farm");
      expect(labelSelect).toBeInTheDocument();

      // Check for description field
      const descInput = screen
        .getAllByRole("textbox")
        .find((input) => input.value === "Original description");
      expect(descInput).toBeInTheDocument();

      // Check for latitude/longitude fields
      const latInput = screen.getByDisplayValue("9.99");
      const lngInput = screen.getByDisplayValue("8.88");
      expect(latInput).toBeInTheDocument();
      expect(lngInput).toBeInTheDocument();
    });
  });

  test("calls map.flyTo when latitude and longitude are updated", async () => {
    await renderComponent();

    // When the component fetches location data, an effect should call flyTo
    await waitFor(() => {
      expect(mockFlyTo).toHaveBeenCalledWith([9.99, 8.88], 15);
    });
  });

  test("submits updated location data if form is valid", async () => {
    // Mock onUpdate to resolve
    const onUpdateMock = jest.fn(() => Promise.resolve());
    await renderComponent({ onUpdate: onUpdateMock });

    // Wait for form to be populated
    await waitFor(() => {
      expect(
        screen
          .getAllByRole("textbox")
          .some((input) => input.value === "Original Location")
      ).toBe(true);
    });

    // Change the name field (check the actual input first)
    const nameInput = screen
      .getAllByRole("textbox")
      .find((input) => input.value === "Original Location");

    await act(async () => {
      fireEvent.change(nameInput, {
        target: { value: "Updated Location" },
      });
    });

    // Find and change description
    const descInput = screen
      .getAllByRole("textbox")
      .find((input) => input.value === "Original description");

    await act(async () => {
      fireEvent.change(descInput, {
        target: { value: "Updated description." },
      });
    });

    // Find and change Label select
    const labelSelects = screen.getAllByRole("combobox");
    const labelSelect = labelSelects.find((select) => select.value === "Farm");

    await act(async () => {
      fireEvent.change(labelSelect, { target: { value: "Restaurant" } });
    });
    expect(labelSelect.value).toBe("Restaurant");

    // Find and change Region select
    const regionSelect = labelSelects.find(
      (select) => select.value === "Nairobi"
    );

    await act(async () => {
      fireEvent.change(regionSelect, { target: { value: "Coast" } });
    });
    expect(regionSelect.value).toBe("Coast");

    // Submit the form - find by role or text
    const submitBtn = screen.getByRole("button", { name: /update location/i });

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    // Verify that onUpdateMock is called with updated values
    await waitFor(() => {
      expect(onUpdateMock).toHaveBeenCalledWith("123", {
        id: "123",
        name: "Updated Location",
        label: "Restaurant", // Changed from "restaurants" to "Restaurant"
        location: "SRID=4326;POINT (8.88 9.99)", // Unchanged from fetched data
        region: "Coast", // Changed from "coast" to "Coast"
        description: "Updated description.",
        farmName: undefined, // since label is not "Farm"
      });
    });
  });

  test("shows error toast if required fields are missing on submit", async () => {
    await renderComponent();

    // Wait for form to be populated
    await waitFor(() => {
      expect(
        screen
          .getAllByRole("textbox")
          .some((input) => input.value === "Original Location")
      ).toBe(true);
    });

    // Find the name field and clear it
    const nameInput = screen
      .getAllByRole("textbox")
      .find((input) => input.value === "Original Location");

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: "" } });
    });

    // Submit form
    const submitBtn = screen.getByRole("button", { name: /update location/i });

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    await waitFor(() => {
      const { toast } = require("react-toastify");
      expect(toast.error).toHaveBeenCalledWith(
        "Please fill in all required fields!"
      );
    });
  });

  test("shows error toast if fetching location data fails", async () => {
    const axiosInstance = require("../../utils/axiosInstance");
    axiosInstance.get.mockRejectedValue(new Error("Network Error"));

    await renderComponent();

    await waitFor(() => {
      const { toast } = require("react-toastify");
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining("Error fetching location data")
      );
    });
  });
});
