import './App.css';
import Map from './components/map';
function App() {
  return (
    <div className="App">
      <div className="second">
        <div className="header">
          <div class="four">
            <h1>
              <span> Interactive GPS Playback
                with Controls </span>
            </h1>
          </div>
        </div>
        <Map />
      </div>
    </div>
  );
}

export default App;
