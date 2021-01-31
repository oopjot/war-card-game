import { useEffect, useState } from "react";
import { connect } from "react-redux";
import Lobby from "./ui/routes/Lobby";
import Login from "./ui/routes/Login";
import Room from "./ui/routes/Room";

const App = ({ user }) => {

  const [page, setPage] = useState(<Login />);

  useEffect(() => setPage(getPage()), [user.connected, user.in_room, user.name]);

  const getPage = () => user.in_room 
  ? <Room /> 
  : user.name
  ? <Lobby />
  : <Login />

  return (<div>
    {getPage()}
  </div>
  )

}

const mapStateToProps = state => ({
  user: state.user
})

export default connect(mapStateToProps)(App);
