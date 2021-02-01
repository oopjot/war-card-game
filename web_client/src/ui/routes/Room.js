import axios from "axios";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import "./Room.css"

const Room = ({ user, game, onUpdate, onLeave, onPlay, onMove, onSurrender }) => {

    const [trigger, setTrigger] = useState(false);
    const [newMsg, setNewMsg] = useState("");
    
    const playersWithScore = game.players.map((p, index) => [p[1], game.scores[index][1]])

    const prettyMoves = game.players.length >= 2 ? game.moves.map((m, index) => {
        const player = game.players.find(p => m[0] === p[0]);
        const card = `cards/${m[1][1]}${m[1][0][0].toUpperCase()}.png`;
        return player
        ? {
            name: player[1],
            card
        }
        : {}
    }) : [];

    const getGameButtons = () => {
        return user.playing && game.players.length >=2
        ? (
            <>
                <button onClick={handleMove}>Move</button>
                <button onClick={handleShuffle}>Shuffle</button>
                <button onClick={handleSurrender}>Surrender</button>
            </>
        )
        : <></>
    }

    const handleChat = () => {
        axios.post(`http://localhost:5000/chat/${user.id}`, {name: user.name, message: newMsg})
            .then(({ data }) => onUpdate({
                ...game,
                messages: [...game.messages, [data.name, data.msg]]
            }))
            .catch(err => console.log(err));
        setNewMsg("");
    };

    const handlePlay = () => {
        axios.post(`http://localhost:5000/play/${user.id}`)
            .then(({ data }) => data.playing ? onPlay() : data)
            .catch(err => console.log(err));
    };
 
    const handleLeave = () => {
        axios.post(`http://localhost:5000/leave/${user.id}`)
            .then(({ data }) => data.inroom ? data : onLeave())
            .catch(err => console.log(err));
    };

    const handleMove = () => {
        axios.post(`http://localhost:5000/move/${user.id}`)
            .then(({ data }) => data.move ? onMove({move: data.move}) : data.move)
            .catch(err => console.log(err));
    };

    const handleSurrender = () => {
        axios.post(`http://localhost:5000/ff/${user.id}`)
            .then(({ data }) => data.playing ? data : onSurrender())
            .catch(err => console.log(err));
    };

    const handleShuffle = () => {
        axios.post(`http://localhost:5000/shuffle/${user.id}`)
            .then(({ data }) => console.log(data.deck))
            .catch(err => console.log(err));
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
        setTimeout(() => setTrigger(!trigger), 1000);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trigger, onUpdate, user.id])

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
                        <div className="cards-container">
                            {prettyMoves.map(m => (
                                <div className="card-container">
                                    <p><b>{m.name} plays</b></p>
                                    <img src={m.card} alt={m.name} />
                                </div>
                            ))}                    
                        </div>
                        <div className="roundwinner-container">
                        </div> 
                    </div>
                    <div className="chat-container">
                        {game.messages.map((m, index) => <div key={index} className="message-container"><b>{m[0]}:</b>  {m[1]}</div>)}
                    </div>       
                </div>
                <div className="bottom-section">
                    <div className="spectators-container">
                        Spectators:
                        {game.spectators.map(s => <div key={s[0]} className="spectator container">{s[1]}</div>)}
                    </div>
                    <div className="actions-container">
                        {user.playing ? <></> : <button onClick={handlePlay}>Play</button>}
                        <button onClick={handleLeave}>Leave</button>
                    </div>
                    <div className="actions-container">
                        {getGameButtons()}
                    </div>
                    <div className="space">

                    </div>
                    <div className="input-container">
                        <input style={{width: "200px"}} type="text" value={newMsg} onChange={(e) => setNewMsg(e.target.value)} />
                        <button type="submit" onClick={handleChat}>Send</button>
                    </div>                  
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
    onUpdate: payload => dispatch({type: "UPDATE", payload}),
    onLeave: () => dispatch({type: "LEAVE"}),
    onPlay: () => dispatch({type: "PLAY"}),
    onMove: payload => dispatch({type: "MOVE", payload}),
    onSurrender: () => dispatch({type: "SURRENDER"})
});

export default connect(mapStateToProps, mapDispatchToProps)(Room);