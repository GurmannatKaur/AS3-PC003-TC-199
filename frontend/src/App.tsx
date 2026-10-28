
import { useState } from "react";
import Overview from "./pages/Overview";
import Clients from "./pages/clients";

function App() {
  const [currentPage, setCurrentPage] = useState("overview");

  return (
    <>
      {currentPage === "overview" && (
        <Overview onNavigate={setCurrentPage} />
      )}

      {currentPage === "clients" && (
        <Clients onNavigate={setCurrentPage} />
      )}
    </>
  );
}

export default App;

