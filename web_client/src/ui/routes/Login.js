import axios from "axios";
import { useEffect, useState } from "react"
import { connect } from "react-redux";

const Login = ({ user, onConnect, onLogin, onJoin }) => {

    const [name, setName] = useState("");
    const [room, setRoom] = useState("");
    const [err, setErr] = useState("");

    useEffect(() => {
        axios.post("http://localhost:5000/connect")
            .then(({ data }) => {
                console.log(data);
                return data.success ? onConnect({ id: data.id }) : data.success
            })
            .catch(err => console.log(err));
    }, [])

    const handleJoin = () => {
        axios.post("http://localhost:5000/join", {room: room, id: user.id})
            .then(({ data }) => {
                onJoin({ ...data })
                setErr("");
            })
            .catch(err => setErr("please reconnect"));
    };

    const handleLogin = () => {
        axios.post("http://localhost:5000/userdata", {id: user.id, name})
            .then(({ data }) => {
                if (data.name){
                    onLogin({ name: data.name, deck: data.deck });
                    setErr(""); 
                } else {
                    setErr("please refresh page");
                };
                
            })
            .catch(err => setErr("try again"));
    };


    if (!user.connected) return <><h1>Connecting to game server</h1></>
    if (!user.name) {
        return (
            <div>
                <input type="text" value={name} onChange={e => setName(e.target.value)} />
                <button onClick={handleLogin}>Login</button>
                {err}
            </div>
        )
    }
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
})

const mapDispatchToProps = dispatch => ({
    onConnect: payload => dispatch({ type: "CONNECT", payload }),
    onLogin: payload => dispatch({type: "SET_USERDATA", payload}),
    onJoin: payload => dispatch({type: "JOIN", payload})
})

export default connect(mapStateToProps, mapDispatchToProps)(Login);