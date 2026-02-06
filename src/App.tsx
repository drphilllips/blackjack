import { GameProvider } from './context/GameContext';
import { Table } from './components/Table';
import './App.css';

function App() {
  return (
    <GameProvider>
      <Table />
    </GameProvider>
  );
}

export default App;
