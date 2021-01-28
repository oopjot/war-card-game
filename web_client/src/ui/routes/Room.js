import axios from "axios";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import "./Room.css"

const Room = ({ user, game, onUpdate }) => {

    const [trigger, setTrigger] = useState(false);
    const [roundWinner, setRoundWinner] = useState("");
    const [newMsg, setNewMsg] = useState("");
    
    const playersWithScore = game.players.map((p, index) => [p[1], game.scores[index][1]])

    const prettyMoves = game.players.length >= 2 ? game.moves.map((m, index) => {
        // deck.append([color, card, power])
        const player = game.players.find(p => m[0] === p[0]);
        const card = `cards/${m[1][1]}${m[1][0][0].toUpperCase()}.png`;
        return {
            name: player[1],
            card
        };
    }) : [];

    const handleChat = () => {
        axios.post(`http://localhost:5000/chat/${user.id}`, {name: user.name, message: newMsg})
            .then(({ data }) => onUpdate({
                ...game,
                messages: [...game.messages, [data.name, data.msg]]
            }))
            .catch(err => console.log(err));
    };

    const getRoundWinner = () => {
        if (game.players.length < 2) return
        if (game.moves.length == 2) {
            if (game.moves[0][1][2] > game.moves[1][1][2]) {
                const player = game.players.find(p => game.moves[0][0] === p[0]);
                return setRoundWinner(`${player[1]} wins this round`)
            } else if (game.moves[0][1][2] < game.moves[1][1][2]) {
                const player = game.players.find(p => game.moves[1][0] === p[0]);
                return setRoundWinner(`${player[1]} wins this round`)
            } else {
                return setRoundWinner("draw")
            }
        } else {
            return setRoundWinner("")
        }
    };

    window.addEventListener("beforeunload", ev => {
        return axios.post(`http://localhost:5000/disconnect/${user.id}`)
            .then(res => res)
            .catch(err => err);
    });

    useEffect(() => {
        axios.get(`http://localhost:5000/room/${user.id}`)
            .then(({ data }) => onUpdate(data))
            .catch(err => console.log(err));
        getRoundWinner();
        setTimeout(() => setTrigger(!trigger), 1000);
    }, [trigger, onUpdate])

    if (!user.in_room) return <><h1>Please refresh</h1></>
    return (
        <div>
            <h1>Room {game.room}</h1>
            <div className="room-container">
                <div className="status-container">
                    <div>
                        <h3>{game.status}</h3>
                    </div>
                </div>
                <div className="main-container">
                    <div className="players-container">
                        Players:
                        {playersWithScore.map((p, index) => <div key={index} className="player-container">{p[0]} &nbsp; {p[1]}</div>)}
                    </div>
                    <div className="moves-container">
                        Moves:
                        <div className="cards-container">
                            {prettyMoves.map(m => (
                                <div className="card-container">
                                    <p><b>{m.name} plays</b></p>
                                    <img src={m.card} alt={m.name} />
                                </div>
                            ))}                    
                        </div>
                        <div>
                            <p>{roundWinner}</p>
                        </div> 
                    </div>
                    <div className="chat-container">
                        Chat:
                        {game.messages.map((m, index) => <div key={index} className="message-container">{m[0]}:  {m[1]}</div>)}
                    </div>    
                    <div>
                        <input style={{width: "100px"}} type="text" value={newMsg} onChange={(e) => setNewMsg(e.target.value)} />
                        <button onClick={handleChat}>Send</button>
                    </div>          
                </div>
                <div className="spectators-container">
                    Spectators:
                    {game.spectators.map(s => <div key={s[0]} className="spectator container">{s[1]}</div>)}
                </div>

            </div>
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