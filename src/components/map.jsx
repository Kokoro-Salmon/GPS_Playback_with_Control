import React, { useState, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  Polyline,
  Marker,
} from "@react-google-maps/api";
import Papa from "papaparse";

export default function Map() {
  const containerStyle = {
    width: "65vw",
    height: "65vh",
  };

  const initialCenter = {
    lat: 12.9294916,
    lng: 74.9173533,
  };

  const [path, setPath] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTimestamp, setCurrentTimestamp] = useState(null);
  const [speed, setSpeed] = useState(1); // Playback speed state
  const [sliderValue, setSliderValue] = useState(0); // Slider value state
  const [mapCenter, setMapCenter] = useState(initialCenter);

  useEffect(() => {
    const parseCSV = () => {
      fetch("/Data.csv")
        .then((response) => response.text())
        .then((csvData) => {
          Papa.parse(csvData, {
            header: true,
            complete: (results) => {
              const coordinates = results.data.map((row, index) => ({
                lat: parseFloat(row.latitude),
                lng: parseFloat(row.longitude),
                timestamp: parseInt(row.eventGeneratedTime), // Use eventGeneratedTime as the timestamp
                index: index,
              }));
              setPath(coordinates);
              if (coordinates.length > 0) {
                setCurrentTimestamp(coordinates[0].timestamp); // Initialize with the first timestamp
                setSliderValue(0);
              }
            },
          });
        });
    };
    parseCSV();
  }, []);

  useEffect(() => {
    let interval;
    if (isPlaying && path.length > 0) {
      interval = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          if (prevIndex < path.length - 1) {
            const newIndex = prevIndex + 1;
            setCurrentTimestamp(path[newIndex].timestamp); // Update timestamp with the current index
            return newIndex;
          } else {
            setIsPlaying(false); // Stop playing when the end of the path is reached
            return prevIndex;
          }
        });
      }, 1000 / speed); // Adjust the playback speed as needed
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, path, speed]);

  const handlePlay = () => {
    console.log(`Played`);
    setIsPlaying(true);
  };

  const handlePause = () => {
    console.log(`Paused`);
    setIsPlaying(false);
  };

  const handleSpeedChange = (newSpeed) => {
    console.log(`Speed changed to ${newSpeed}x`);
    setSpeed(newSpeed);
  };

  const handleSliderChange = (event) => {
    const value = parseInt(event.target.value);
    setSliderValue(value);
    setCurrentIndex(value);
    setCurrentTimestamp(path[value].timestamp);
  };

  const handleMapDrag = () => {
    // Update map center only once after the first drag
    if (mapCenter === initialCenter) {
      setMapCenter(null);
    }
  };

  return (
    <div>
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={10}
          onDrag={handleMapDrag}
        >
          {path.length > 0 && (
            <>
              <Polyline
                path={path.slice(0, currentIndex + 1)}
                options={{ strokeColor: "#7C4Dff" }}
              />
              {currentTimestamp && (
                <Marker
                  position={{
                    lat: path[currentIndex].lat,
                    lng: path[currentIndex].lng,
                  }}
                  label={new Date(currentTimestamp).toLocaleString()}
                />
              )}
            </>
          )}
        </GoogleMap>
      </LoadScript>
      <div style={{ marginTop: 10 }}>
        <button className="fancybutton" onClick={handlePlay} disabled={isPlaying}>
          Play
        </button>
        <button className="fancybutton" onClick={handlePause} disabled={!isPlaying}>
          Pause
        </button>
        <div style={{ marginTop: 10 }}>
          <button className="fancybutton" onClick={() => handleSpeedChange(0.25)}>0.25x</button>
          <button className="fancybutton" onClick={() => handleSpeedChange(0.5)}>0.5x</button>
          <button className="fancybutton" onClick={() => handleSpeedChange(1)}>1x</button>
          <button className="fancybutton" onClick={() => handleSpeedChange(1.5)}>1.5x</button>
          <button className="fancybutton" onClick={() => handleSpeedChange(2)}>2x</button>
          <button className="fancybutton" onClick={() => handleSpeedChange(5)}>5x</button>
        </div>
      </div>
      <div>
        <input
          type="range"
          min={0}
          max={path.length - 1}
          value={sliderValue}
          onChange={handleSliderChange}
          style={{ width: "80%", marginTop: 10 }}
        />
      </div>
      <div
        style={{
          marginTop: 10,
          background: "white",
          padding: "5px",
          borderRadius: "5px",
          display: "inline-block",
        }}
      >
        {currentTimestamp
          ? new Date(currentTimestamp).toLocaleString()
          : "No timestamp"}
      </div>
    </div>
  );
}


