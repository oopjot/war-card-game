import { connect } from "react-redux";
import Login from "./ui/routes/Login";
import Room from "./ui/routes/Room";

const App = ({ user }) => {

  const getPage = () => user.in_room ? <Room /> : <Login />

  return (<div>
    {getPage()}
  </div>
  )

}

const mapStateToProps = state => ({
  user: state.user
})

export default connect(mapStateToProps)(App);
