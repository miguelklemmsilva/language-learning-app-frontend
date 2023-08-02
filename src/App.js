import {BrowserRouter, Route, Routes} from "react-router-dom";
import Home from "./components/HomePages/Home/./Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Practice from "./components/Practice/Practice/Practice";
import VocabularyTable from "./components/HomePages/VocabularyTable/VocabularyTable";
import Settings from "./components/HomePages/Settings/Settings";
import {AuthProvider} from "./contexts/AuthProvider";
import Sidebar from "./components/HomePages/Sidebar/Sidebar";
import LandingPage from "./components/LandingPage";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<LandingPage/>}/>
                    <Route
                        path="/home"
                        element={
                            <div className="page-container">
                                <Sidebar />
                                <Home />
                            </div>
                        }
                    />
                    <Route
                        path="/vocabularytable"
                        element={
                            <div className="page-container">
                                <Sidebar />
                                <VocabularyTable />
                            </div>
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <div className="page-container">
                                <Sidebar />
                                <Settings />
                            </div>
                        }
                    />
                    <Route path="/practice" element={<Practice/>}/>
                    <Route path="/register" element={<Register/>}/>
                    <Route path="/login" element={<Login/>}/>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
