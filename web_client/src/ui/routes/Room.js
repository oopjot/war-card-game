import axios from "axios";
import { useEffect, useState } from "react";
import { connect } from "react-redux";

const Room = ({ user, game, onUpdate }) => {

    const [trigger, setTrigger] = useState(false);

    useEffect(() => {
        axios.get(`http://localhost:5000/room/${user.id}`)
            .then(({ data }) => onUpdate(data))
            .catch(err => console.log(err));
        setTimeout(() => setTrigger(!trigger), 2000);
    }, [trigger, onUpdate])

    if (!user.in_room) return <><h1>Please refresh</h1></>
    return (
        <div>
            <h1>Room {game.room}</h1>
            <h3>Players</h3><br />
                {game.players.map(p => <li key={p[0]}>{p[1]}</li>)}
            <h3>Spectators:</h3><br />
            <ul>
                {game.spectators.map(s => <li key={s[0]}>{s[1]}</li>)}
            </ul>
            <h2>{game.status}</h2>
        </div>
    )
}

const mapStateToProps = state => ({
    user: state.user,
    game: state.game
})

const mapDispatchToProps = dispatch => ({
    onUpdate: payload => dispatch({type: "UPDATE", payload})
});

export default connect(mapStateToProps, mapDispatchToProps)(Room);