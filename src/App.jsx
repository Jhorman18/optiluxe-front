import "./App.css";
import AppRouter from "./routes/AppRouter";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster position="top-centert" />
      <AppRouter />
    </>
  );
}

export default App;