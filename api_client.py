from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin

import time
import threading
import json
import asyncio
from pprint import pprint
import sys
from uuid import uuid4
import signal


import paho.mqtt.client as mqtt
from store import Store

app = Flask(__name__)
cors = CORS(app)
app.config["CORS_HEADERS"] = "Content-Type"

def close_handler(signum, frame):
    for player in players:
        if player._userdata.connected:
            if player._userdata.in_room:
                room = player._userdata.room
                id = player._userdata.id
                player.publish(f"{room}/leaving/{id}", json.dumps([id, player._userdata.name]))
            player.disconnect()
    sys.exit(0)

signal.signal(signal.SIGHUP, close_handler)
signal.signal(signal.SIGINT, close_handler)


def on_connect(client, userdata, flags, rc):
    print("Connected")
    userdata.set_id(str(uuid4()))
    userdata.connect()
    client.subscribe([
        ("broadcast", 0),
        (f"{userdata.id}/#", 0),
    ])

def on_message(client, userdata, message):
    topic = message.topic.split("/")
    msg = message.payload

    if topic[0] == "broadcast":
        print("room state")
        pprint(json.loads(userdata.get_room_state()))
        return

    if topic[1] == "joining":
        new_player = json.loads(msg)
        userdata.add_spectator(new_player)
        client.publish(f"{topic[2]}/update", userdata.get_room_state())
    
    if topic[1] == "chat":
        chat_message = json.loads(msg)
        userdata.add_message(chat_message)
    
    if topic[1] == "update":
        room_state = json.loads(msg)
        userdata.set_room_state(room_state)
    
    if topic[1] == "game":
        if topic[2] == "play":
            new_player = json.loads(msg)
            userdata.add_player(new_player)

        if topic[2] == "move":
            move = json.loads(msg)
            userdata.make_move(move)

        if topic[2] == "ff":
            player = json.loads(msg)
            userdata.surrender(player)



    if topic[1] == "leaving":
        removed = json.loads(msg)
        userdata.remove_from_room(removed)
        userdata.print_room()



players = []

def find_player(id, inc=False):
    for player in players:
        if player._userdata.id == id:
            return player
    return None

# def check_activity():
#     while True:
#         for player in players:
#             if player[0]._userdata.in_room:
#                 player[2] += 1
#         time.sleep(2)
#         for player in players:
#             if player[1] + 1 < player[2]:
#                 room = player[0]._userdata.room
#                 id = player[0]._userdata.id
#                 name = player[0]._userdata.name
#                 player[0].publish(f"{room}/leaving/{id}", json.dumps([id, name]))
#                 player[0].disconnect()
#                 players.remove(player)
#         # print(players[0])


@app.route("/connect", methods=["POST"])
@cross_origin()
def connect():
    # print(players)
    # print("siemka")
    player = mqtt.Client(userdata=Store())
    player.on_connect = on_connect
    player.on_message = on_message
    player.connect("10.45.3.18", 1883, 60)
    players.append(player)
    threading.Thread(target=player.loop_forever).start()
    time.sleep(1)
    if player._userdata.connected:
        return {
            "success": player._userdata.connected,
            "id": player._userdata.id
        }
    else:
        return {
            "success": player._userdata.connected
        }

@app.route("/userdata", methods=["POST"])
@cross_origin()
def userdata():
    body = request.get_json()
    player = find_player(body["id"])
    player._userdata.set_name(body["name"])
    if player:
        return {
            "name": player._userdata.name,
            "deck": player._userdata.deck
        }
    else:
        return {
            "name": False
        }

@app.route("/join", methods=["POST"])
@cross_origin()
def join():
    body = request.get_json()
    room = body["room"]
    id = body["id"]
    player = find_player(id)
    player._userdata.join(room)
    player.publish(f"{room}/joining/{player._userdata.id}", json.dumps([player._userdata.id, player._userdata.name]))
    player.subscribe(f"{room}/#")

    time.sleep(2)
    return player._userdata.get_room_state()

@app.route("/room/<id>", methods=["GET"])
@cross_origin()
def get_room_state(id):
    # id = request.args.get("id")
    player = find_player(id)
    room = player._userdata.get_room_state()
    # player[1] += 1
    return json.loads(room)


@app.route("/disconnect/<id>", methods=["POST"])
@cross_origin()
def disconnect_player(id):
    player = find_player(id)
    if player:
        if player._userdata.in_room:
            player.publish(f"{player._userdata.room}/leaving/{player._userdata.id}", json.dumps([player._userdata.id, player._userdata.name]))
        player.disconnect()
        players.remove(player)
    return {
        "status": "OK"
    }

@app.route("/chat/<id>", methods=["POST"])
@cross_origin()
def send_message(id):
    body = request.get_json()
    name = body["name"]
    msg = body["message"]
    player = find_player(id)
    player.publish(f"{player._userdata.room}/chat", json.dumps([name, msg]))
    return {
        "name": name,
        "msg": msg
    }

if __name__ == "__main__":
    # threading.Thread(target=check_activity).start()
    app.run(debug=False)