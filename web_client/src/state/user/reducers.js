
const initialUser = {
    connected: false,
    name: "",
    id: "",
    in_room: false,
    playing: false,
    deck: []
}


const user = (state = initialUser, action) => {
    switch (action.type) {
        case "CONNECT":
            return {
                ...state,
                connected: true,
                id: action.payload.id,
            }
        case "SET_USERDATA":
            return {
                ...state,
                name: action.payload.name,
                deck: action.payload.deck
            }
        case "JOIN":
            return {
                ...state,
                in_room: true
            }
        case "PLAY":
            return {
                ...state,
                playing: true
            }
        case "LEAVE":
            return {
                ...state,
                in_room: false
            }
        case "SURRENDER":
            return {
                ...state,
                playing: false
            }
        default:
            return state
    }
}

export default user;