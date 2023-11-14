import logo from './logo.svg';
import './App.css';
import Header from './components/Header';
import {NextUIProvider} from "@nextui-org/react";
import TableUsers from './components/TableUsers';

function App() {
  return (
<>
<NextUIProvider>
<Header/>
<TableUsers/>
</NextUIProvider>
</>
  );
}

export default App;
