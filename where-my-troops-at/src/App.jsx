import { Routes, Route } from 'react-router-dom';
import './styles/App.css';
import LoginPage from './components/LoginPage.jsx';
import AdminHome from './components/AdminHome.jsx';
import EvaluatorsPanel from './components/EvaluatorsPanel';
import CreateAccount from './components/CreateAccount';
import CreatePersonnel from './components/CreatePersonnel';
// import ProtectedRoute from './components/ProtectedRoute';
import GenUser from './components/genUser.jsx';
import MPC from './components/MPC';

function App() {
  return (
    <div className="main">
      <Routes>
        <Route path="/" element={<LoginPage />}></Route>

        <Route path="/Admin" element={<AdminHome />}></Route>
        {/* Uncomment below to require a login to the page */}
        {/* <Route element={<ProtectedRoute role="is_admin" />}>
          <Route path="/Admin" element={<AdminHome />}></Route>
        </Route> */}

        <Route path="/Admin/CreateAccount" element={<CreateAccount />}></Route>
        {/* Uncomment below to require a login to the page */}
        {/* <Route element={<ProtectedRoute role="is_admin" />}>
          <Route path="/Admin/CreateAccount" element={<CreateAccount />}></Route>
        </Route> */}

        <Route path="/Evaluator" element={<EvaluatorsPanel />}></Route>
        {/* Uncomment below to require a login to the page */}
        {/* <Route element={<ProtectedRoute role="is_evaluator" />}>
          <Route path="/Evaluator" element={<EvaluatorsPanel />}></Route>
        </Route> */}

        <Route
          path="/Evaluator/createpersonnel"
          element={<CreatePersonnel />}
        ></Route>
        {/* Uncomment below to require a login to the page */}
        {/* <Route element={<ProtectedRoute role="is_evaluator" />}>
          <Route path="//Evaluator/createpersonnel" element={<CreatePersonnel />}></Route>
        </Route> */}

        <Route path="/GeneralUser" element={<GenUser />}></Route>
        <Route path="/Admin" element={<AdminHome />}></Route>
        <Route path="/MPC" element={<MPC />}></Route>
      </Routes>
    </div>
  );
}

export default App;
