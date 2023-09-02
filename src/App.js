import {BrowserRouter, Route, Routes, useLocation} from "react-router-dom";
import Home from "./components/HomePages/Home/./Home";
import Practice from "./components/Practice/Practice/Practice";
import VocabularyTablePage from "./components/HomePages/VocabularyTable/VocabularyTablePage";
import Settings from "./components/HomePages/Settings/Settings";
import LandingPage from "./components/LandingPage";
import HomeRoute from "./components/HomePages/HomeRoute";
import {HomeRouteProvider} from "./contexts/HomeRouteContext";
import {useEffect} from "react";
import ScrollToTop from "./ScrollToTop";

function App() {
    return (
        <BrowserRouter>
            <ScrollToTop/>
            <Routes>
                <Route path="/" element={<LandingPage/>}/>
                <Route path="/home" element={<HomeRoute><Home/></HomeRoute>}/>
                <Route path="/vocabularytable" element={<HomeRoute><VocabularyTablePage/></HomeRoute>}/>
                <Route path="/settings" element={<HomeRoute><Settings/></HomeRoute>}/>
                <Route path="/practice" element={<HomeRouteProvider><Practice/></HomeRouteProvider>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
