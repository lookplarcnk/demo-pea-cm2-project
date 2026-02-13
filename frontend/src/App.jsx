import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Header from "./components/Header";
import Docscategories from "./components/Docscategories";
import Mostdownloaddocs from "./components/Mostdownloaddocs";
import DocsLastedUpdate from "./components/DocsLastedUpdate";
import Footer from "./components/Footer";

function App() {
  return (
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Header />
              <Docscategories />
              <Mostdownloaddocs />
              <DocsLastedUpdate />
              <Footer />
            </>
          }
        />
      </Routes>
  );
}

export default App;