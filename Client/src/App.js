import {Route, Routes} from 'react-router-dom';
import './App.css';
import Lobby from './Screens/Lobby';
import Navbar from './Screens/Navbar';
import Room from './Screens/Room';

function App() {
  return (
    <div className="App">
      <Navbar/>
      <Routes>
        <Route path='/' element={<Lobby/>} />
        <Route path='/room/:roomId' element={<Room/>} />
      {/* this is basicically a dynamic path */}
      </Routes>
      
    </div>
  );
}

export default App;
