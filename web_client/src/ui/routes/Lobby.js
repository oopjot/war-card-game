import axios from "axios";
import { useState } from "react"
import { connect } from "react-redux";

const Lobby = ({ user, onJoin }) => {

    const [room, setRoom] = useState("");
    const [err, setErr] = useState("");

    const handleJoin = room => {
        axios.post("http://10.45.3.18/myapp/join", {room, id: user.id})
            .then(({ data }) => data.in_room ? onJoin({ ...data.room }) : setTimeout(() => handleJoin(), 2000))
            .catch(err => setErr("please reconnect"));
    };


    return (
        <div>
            <h1>Welcome, {user.name}</h1>
            <input type="text" value={room} onChange={e => setRoom(e.target.value)} />
            <button onClick={() => handleJoin(room)}>Join</button>
            {err}
        </div>
    );
};

const mapStateToProps = state => ({
    user: state.user
});

const mapDispatchToProps = dispatch => ({
    onJoin: payload => dispatch({type: "JOIN", payload})
});

export default connect(mapStateToProps, mapDispatchToProps)(Lobby);