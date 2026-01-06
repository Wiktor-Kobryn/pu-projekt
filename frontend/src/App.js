import logo from './logo.svg';
import './App.css';
import { AppList } from './AppList';
import { AppTitle } from './AppTitle';
import AppCalculator from './AppCalculator';
import AppHeader from './AppHeader';

function App() {
  return (
    <div>
      <AppTitle>
        <strong>Aplikacja PU LAB11</strong>
      </AppTitle>
      <AppHeader />
      <AppCalculator />
    </div>
  );
}

export default App;
