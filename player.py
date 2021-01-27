import paho.mqtt.client as mqtt
from uuid import uuid4
import json
import os
from store import Store

clean_deck = {
    "clubs": ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"],
    "diamonds": ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"],
    "hearts": ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"],
    "spades": ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"],
}



def on_connect(client, userdata, flags, rc):
    print("Welcome")
    name = input("Name: ")
    id = str(uuid4())
    userdata.set_name(name)
    userdata.set_id(id)
    userdata.connect()
    client.subscribe([
        ("broadcast", 0),
        (f"{id}/#", 0),
    ])
    player._userdata.print_room()

def on_message(client, userdata, message):
    topic = message.topic.split("/")
    msg = message.payload

    if topic[0] == "broadcast":
        print("jeden dwa trzy", str(msg))
        return

    if topic[1] == "joining":
        new_player = json.loads(msg)
        userdata.add_spectator(new_player)
        userdata.print_room()
        client.publish(f"{topic[2]}/update", userdata.get_room_state())
    
    if topic[1] == "chat":
        chat_message = json.loads(msg)
        userdata.add_message(chat_message)
        userdata.print_room()
    
    if topic[1] == "update":
        room_state = json.loads(msg)
        userdata.set_room_state(room_state)
        userdata.print_room()
    
    if topic[1] == "game":
        if topic[2] == "play":
            new_player = json.loads(msg)
            userdata.add_player(new_player)
            userdata.print_room()
        if topic[2] == "move":
            move = json.loads(msg)
            userdata.make_move(move)
            userdata.print_room()


    if topic[1] == "leaving":
        removed = json.loads(msg)
        userdata.remove_from_room(removed)
        userdata.print_room()


def on_disconnect(client, userdata, rc):
    print("Disconnecting")

store = Store()

player = mqtt.Client(userdata=store)

player.on_connect = on_connect
player.on_message = on_message
player.on_disconnect = on_disconnect


player.connect("10.45.3.18", 1883, 10)

running = True

counter = 0

player.loop_start()
while running:
    userdata = player._userdata
    if not userdata.connected:
        continue
    
    if userdata.in_room:
        room = userdata.room
        spectators = userdata.spectators
        players = userdata.playing

        userdata.print_room()

        message = input()
        if len(message) == 0:
            continue
        if message[0] == "!":
            if message == "!play":
                player.publish(f"{room}/game/play", json.dumps([userdata.id, userdata.name]))
                player._userdata.start_playing()
            
            if message == "!leave":
                player.publish(f"{room}/leaving/{userdata.id}", json.dumps([userdata.id, userdata.name]))
                player._userdata.leave()
                player.unsubscribe(f"{room}/#")
            
            if userdata.playing:
                if userdata.gaming:
                    if message == "!move":
                        player.publish(f"{room}/game/move", json.dumps([userdata.id, userdata.deck[0]]))

        else:
            player.publish(f"{room}/chat", json.dumps([userdata.name, message]))
        continue

    cmd = input()
    if cmd == "!exit":
        player.disconnect()
        running = False

    if cmd == "!join":
        room_name = input("room name: ")
        if len(room_name) < 2:
            print("invalid room")
        elif "/" in room_name:
            print("invalid room")
        else:
            userdata.join(room_name)
            player.publish(f"{room_name}/joining/{userdata.id}", json.dumps([userdata.id, userdata.name]))
            player.subscribe(f"{room_name}/#")



    
player.loop_stop()




