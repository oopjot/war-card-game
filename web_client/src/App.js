import { useEffect, useState } from "react";
import { connect } from "react-redux";
import Lobby from "./ui/routes/Lobby";
import Login from "./ui/routes/Login";
import Room from "./ui/routes/Room";
import { v4 as uuidv4 } from "uuid";

const App = ({ user }) => {
  const id = uuidv4();

  const [page, setPage] = useState(<Login id={id} />);

  useEffect(() => {
    setPage(getPage()) 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.connected, user.in_room, user.name]);

  const getPage = () => user.in_room 
  ? <Room /> 
  : user.name
  ? <Lobby />
  : <Login id={id} />

  return (<div>
    {page}
  </div>
  )

}

const mapStateToProps = state => ({
  user: state.user
})

export default connect(mapStateToProps)(App);
