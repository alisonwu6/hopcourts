import { Routes, Route } from 'react-router-dom'
import Splash from './pages/Splash'
import Callback from './pages/Callback'
import Home from './pages/Home'
import MapView from './pages/MapView'
import SessionDetails from './pages/SessionDetails'
import JoinConfirmation from './pages/JoinConfirmation'
import CreateSession from './pages/CreateSession'
import ManageSession from './pages/ManageSession'
import AthleteCard from './pages/AthleteCard'
import MyProfile from './pages/MyProfile'
import Squad from './pages/Squad'
import Reconnect from './pages/Reconnect'
import Notifications from './pages/Notifications'
import Settings from './pages/Settings'
import SearchAthletes from './pages/SearchAthletes'
import EditAthleteCard from './pages/EditAthleteCard'


export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Splash />}
      />
      <Route
        path="/auth/callback"
        element={<Callback />}
      />
      <Route
        path="/home"
        element={<Home />}
      />
      <Route
        path="/map"
        element={<MapView />}
      />
      <Route
        path="/athletes"
        element={<SearchAthletes />}
      />
      <Route
        path="/sessions/:id"
        element={<SessionDetails />}
      />
      <Route
        path="/sessions/:id/joined"
        element={<JoinConfirmation />}
      />
      <Route
        path="/create"
        element={<CreateSession />}
      />
      <Route
        path="/sessions/:id/manage"
        element={<ManageSession />}
      />
      <Route
        path="/u/:username"
        element={<AthleteCard />}
      />
      <Route
        path="/u/:username/edit"
        element={<EditAthleteCard />}
      />
      <Route
        path="/me"
        element={<MyProfile />}
      />
      
      <Route
        path="/squad"
        element={<Squad />}
      />
      <Route
        path="/sessions/:id/reconnect"
        element={<Reconnect />}
      />
      <Route
        path="/notifications"
        element={<Notifications />}
      />
      <Route
        path="/settings"
        element={<Settings />}
      />
    </Routes>
  )
}
