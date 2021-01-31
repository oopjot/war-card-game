import axios from "axios";
import { useEffect, useState } from "react"
import { connect } from "react-redux";

const Lobby = ({ user, onJoin }) => {

    const [room, setRoom] = useState("");
    const [err, setErr] = useState("");

    const handleJoin = () => {
        axios.post("http://localhost:5000/join", {room: room, id: user.id})
            .then(({ data }) => {
                onJoin({ ...data })
                setErr("");
            })
            .catch(err => setErr("please reconnect"));
    };


    return (
        <div>
            <h1>Welcome, {user.name}</h1>
            <input type="text" value={room} onChange={e => setRoom(e.target.value)} />
            <button onClick={handleJoin}>Join</button>
            {err}
        </div>
    )
}

const mapStateToProps = state => ({
    user: state.user
});

const mapDispatchToProps = dispatch => ({
    onJoin: payload => dispatch({type: "JOIN", payload})
});

export default connect(mapStateToProps, mapDispatchToProps)(Lobby);