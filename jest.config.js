// jest.config.js
module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
    "^.+\\.mjs$": "babel-jest",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(axios|@react-leaflet|react-leaflet|leaflet|react-leaflet-cluster|@babel).+\\.js$)",
  ],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(png|jpg|jpeg|gif|svg|json)$": "<rootDir>/__mocks__/fileMock.js",
    "^react-lottie$": "<rootDir>/__mocks__/react-lottie.js",
  },
};
