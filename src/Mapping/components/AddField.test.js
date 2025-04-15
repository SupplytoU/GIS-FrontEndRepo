// AddField.test.js
import "@testing-library/jest-dom/extend-expect";
import React, { act } from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LeafletProvider } from "@react-leaflet/core";
import axiosInstance from "../../utils/axiosInstance";
import AddField from "./AddField";

// -------------------------
// Mocks
// -------------------------
jest.mock("./Geocoder", () => () => <div>Geocoder</div>);

jest.mock("react-leaflet-draw", () => ({
  EditControl: ({ onCreated }) => (
    <button
      onClick={() =>
        onCreated({
          layerType: "polygon",
          layer: {
            getLatLngs: () => [
              [
                { lat: 0, lng: 0 },
                { lat: 1, lng: 1 },
                { lat: 0, lng: 0 },
              ],
            ],
          },
        })
      }
    >
      Simulate Create
    </button>
  ),
}));

jest.mock("react-leaflet", () => {
  const React = require("react");
  const original = jest.requireActual("react-leaflet");

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

  const DummyMapContainer = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => mockLeafletContext.map);
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
  };
});

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

jest.mock("../../utils/axiosInstance", () => ({
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
}));

jest.mock("react-toastify", () => {
  const React = require("react");
  return {
    toast: {
      success: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warning: jest.fn(),
    },
    ToastContainer: () => <div />,
    Bounce: jest.fn(),
  };
});

jest.mock("use-local-storage", () => jest.fn(() => [false]));

jest.mock(
  "./Modal",
  () =>
    ({ isOpen }) =>
      isOpen ? <div data-testid="modal">Modal Open</div> : null
);

// -------------------------
// Dummy Data
// -------------------------
const dummyFarmers = [
  { id: 1, name: "Farmer A" },
  { id: 2, name: "Farmer B" },
];

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
// Render Helper
// -------------------------
const renderComponent = (props = {}) => {
  let rendered;
  act(() => {
    rendered = render(
      <MemoryRouter>
        <LeafletProvider value={mockLeafletContextValue}>
          <AddField {...props} />
        </LeafletProvider>
      </MemoryRouter>
    );
  });
  return rendered;
};

// -------------------------
// Tests
// -------------------------
describe("AddField Component", () => {
  beforeEach(() => {
    axiosInstance.get.mockResolvedValue({ data: dummyFarmers });
  });

  test("renders form with title", async () => {
    let getByText;
    await act(async () => {
      ({ getByText } = renderComponent());
    });
    expect(getByText(/Add Field Drawing/i)).toBeInTheDocument();
  });

  test("shows error if farm area or coordinates are missing", async () => {
    const { getByText } = renderComponent();
    await act(async () => {
      fireEvent.click(getByText(/Save Field/i));
    });
    await waitFor(() => {
      expect(
        getByText(
          /Please draw the farm area on the map and input the area in acres before saving./i
        )
      ).toBeInTheDocument();
    });
  });

  test("simulates polygon creation and sets drawnCoordinates", async () => {
    const { getByText, container } = renderComponent();
    await act(async () => {
      fireEvent.click(getByText(/Simulate Create/i));
    });
    await waitFor(() => {
      const textarea = container.querySelector("textarea[readonly]");
      expect(textarea.value).toContain("SRID=4326;POLYGON");
    });
  });

  test("adds additional produce inputs when 'Add Produce' is clicked", () => {
    const { getByText, getAllByPlaceholderText } = renderComponent();
    expect(getAllByPlaceholderText(/Produce Type/i).length).toBe(1);
    act(() => {
      fireEvent.click(getByText(/Add Produce/i));
    });
    expect(getAllByPlaceholderText(/Produce Type/i).length).toBe(2);
  });

  test("submits field data if form is valid", async () => {
    axiosInstance.post.mockResolvedValueOnce({ data: {} });
    const onAddFieldMock = jest.fn();
    const { getByText, getByPlaceholderText, container } = renderComponent({
      onAddField: onAddFieldMock,
    });

    // Wait for select options to be populated (farmers)
    await waitFor(() => {
      expect(container.querySelector("select").options.length).toBeGreaterThan(
        1
      );
    });

    // Fill out form fields.
    await act(async () => {
      fireEvent.change(getByPlaceholderText(/Enter Field Name/i), {
        target: { value: "Test Field" },
      });
      fireEvent.change(getByPlaceholderText(/Enter Identification Number/i), {
        target: { value: "12345" },
      });
      fireEvent.change(getByPlaceholderText(/Enter Description/i), {
        target: { value: "A test field." },
      });
      fireEvent.change(getByPlaceholderText(/Produce Type 1/i), {
        target: { value: "Wheat" },
      });
      fireEvent.change(getByPlaceholderText(/Variety 1/i), {
        target: { value: "Hybrid" },
      });
    });

    // Update farmer select value.
    const farmerSelect = container.querySelector("select");
    await act(async () => {
      fireEvent.change(farmerSelect, { target: { value: "1" } });
    });
    expect(farmerSelect.value).toBe("1");

    // Fill in Farm Area (in acres) input.
    await act(async () => {
      fireEvent.change(getByPlaceholderText(/Enter area in acres/i), {
        target: { value: "100" },
      });
    });

    // Simulate polygon creation to set drawnCoordinates.
    await act(async () => {
      fireEvent.click(getByText(/Simulate Create/i));
    });

    // Submit the form.
    await act(async () => {
      fireEvent.click(getByText(/Save Field/i));
    });

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/fieldmapping/farms/",
        expect.objectContaining({
          name: "Test Field",
          description: "A test field.",
          farm_area: expect.stringContaining("SRID=4326;POLYGON"),
          area_acres: "100",
          farmer: "1",
          produce: expect.arrayContaining([
            expect.objectContaining({
              produce_type: "Wheat",
              variety: "Hybrid",
            }),
          ]),
        })
      );
      expect(onAddFieldMock).toHaveBeenCalled();
      expect(getByText(/Modal Open/i)).toBeInTheDocument();
    });
  });
});
