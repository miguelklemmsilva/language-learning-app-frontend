import {BrowserRouter, Route, Routes} from "react-router-dom";
import Home from "./components/HomePages/Home/./Home";
import Practice from "./components/Practice/Practice/Practice";
import VocabularyTable from "./components/HomePages/VocabularyTable/VocabularyTable";
import Settings from "./components/HomePages/Settings/Settings";
import Sidebar from "./components/HomePages/Sidebar/Sidebar";
import LandingPage from "./components/LandingPage";
import HomeRoute from "./components/HomePages/HomeRoute";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage/>}/>
                <Route path="/home" element={<HomeRoute><Home/></HomeRoute>}/>
                <Route path="/vocabularytable" element={<HomeRoute><VocabularyTable/></HomeRoute>}/>
                <Route path="/settings" element={<HomeRoute><Settings/></HomeRoute>}/>
                <Route path="/practice" element={<Practice/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
