import { Routes, Route } from 'react-router-dom';
import './App.css';
import LoginPage from './Login/LoginPage.jsx';
import AdminHome from './Admin/AdminHome.jsx';
import EvaluatorHome from './Evaluator/EvaluatorHome.jsx';
import CreateAccount from './Login/CreateAccount';
// import CreatePersonnel from './Admin/CreatePersonnel';
import ProtectedRoute from './components/ProtectedRoute';
import GenUser from './genUser/genUser.jsx';
import MPC from './planning/MPC';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="main">
      <Navbar />
      <div className="page-wrapper">
        <Routes>
          <Route path="/" element={<LoginPage />}></Route>

          {/* <Route path="/Admin" element={<AdminHome />}></Route> */}
          {/* Uncomment below to require a login to the page */}
          <Route element={<ProtectedRoute role="is_admin" />}>
            <Route path="/Admin" element={<AdminHome />}></Route>
          </Route>

          {/* <Route path="/Admin/CreateAccount" element={<CreateAccount />}></Route> */}
          {/* Uncomment below to require a login to the page */}
          <Route element={<ProtectedRoute role="is_admin" />}>
            <Route
              path="/Admin/CreateAccount"
              element={<CreateAccount />}
            ></Route>
          </Route>

          {/* <Route path="/Evaluator" element={<EvaluatorHome />}></Route> */}
          {/* Uncomment below to require a login to the page */}
          <Route element={<ProtectedRoute role="is_evaluator" />}>
            <Route path="/Evaluator" element={<EvaluatorHome />}></Route>
          </Route>

          {/* <Route
            path="/Evaluator/createpersonnel"
            element={<CreatePersonnel />}
          ></Route> */}
          {/* Uncomment below to require a login to the page */}
          {/* <Route element={<ProtectedRoute role="is_evaluator" />}>
            <Route path="//Evaluator/createpersonnel" element={<CreatePersonnel />}></Route>
          </Route> */}

          <Route path="/GeneralUser" element={<GenUser />}></Route>
          {/* <Route path="/MPC" element={<MPC />}></Route> */}
          <Route element={<ProtectedRoute role="is_planner" />}>
            <Route path="/MPC" element={<MPC />}></Route>
          </Route>
        </Routes>
      </div>

      <footer>
        <a
          target="_blank"
          rel="nofollow noreferrer noopener"
          className="support-footer"
          href="https://github.com/aries510/sdi-capstone-chesters-smile"
          alt="Github Link"
        >
          Learn more about the Project and the Team behind it
        </a>
      </footer>
    </div>
  );
}

export default App;
