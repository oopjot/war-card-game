import axios from "axios";
import { useEffect, useState } from "react"
import { connect } from "react-redux";

const Login = ({ id, user, onConnect, onLogin, onJoin }) => {

    const [name, setName] = useState("");
    const [err, setErr] = useState("");
    const [trigger, setTrigger] = useState(false);

    useEffect(() => {
        axios.post("http://10.45.3.18/myapp/connect", {id})
            .then(({ data }) => {
                return data.success ? onConnect({ id: data.id }) : setTimeout(() => setTrigger(!trigger), 2000);
            })
            .catch(err => console.log(err));
            // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trigger]);

    const handleLogin = () => {
        axios.post("http://10.45.3.18/myapp/userdata", {id: user.id, name})
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
    return (
        <div>
            <input type="text" value={name} onChange={e => setName(e.target.value)} />
            <button onClick={handleLogin}>Login</button>
            {err}
        </div>
    );
};

const mapStateToProps = state => ({
    user: state.user
});

const mapDispatchToProps = dispatch => ({
    onConnect: payload => dispatch({ type: "CONNECT", payload }),
    onLogin: payload => dispatch({type: "SET_USERDATA", payload})
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
