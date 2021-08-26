const gameRooms = {
    // [roomKey]: {
    //   roomKey: 'AAAAA'
    //   placedCats: { zone1: catObject, zone2: null, .... etc },
    //   users: [ ],
    //   players: { sockedId#: { playerId: socket.id }, {}, ....},
    //   numPlayers: 0
    // }
}

//IMPORT AND INITIALIZE FIREBASE
const firebase = require('firebase/app')
const firebaseConfig = require("../../client/firebase/firebaseConfig")
require('firebase/auth');
const firebaseApp = firebase.initializeApp(firebaseConfig);

module.exports = (io) => {
    //IO CREATES A SOCKET CONNECTION AS SOON AS A GAME WINDOW IS OPEN:
    io.on("connection", (socket) => {
        console.log(`A socket connection to the server has been made: ${socket.id}`);

        //WHEN CLIENT EMITS 'JOIN ROOM'
        socket.on("joinRoom", (roomKey) => {
            socket.join(roomKey);
            const roomInfo = gameRooms[roomKey];

            //here is where we are creating a player state with current player info
            roomInfo.players[socket.id] = { playerId: socket.id };

            // update number of players
            roomInfo.numPlayers = Object.keys(roomInfo.players).length;
            console.log("roomInfo", roomInfo);
            // set initial state on client side:
            socket.emit("setState", roomInfo);

            // Send the in-progress scene set-up (if applicable) to the new player
            socket.emit("currentPLayersAndCats", {
                players: roomInfo.players,
                numPlayers: roomInfo.numPlayers,
                placedCats: roomInfo.placedCats
            });

            // update all other players of the new player
            socket.to(roomKey).emit("newPlayer", {
                playerInfo: roomInfo.players[socket.id],
                numPlayers: roomInfo.numPlayers,
            });
        });

        // WHEN A PLAYER DISCONNECTS FROM SOCKET
        socket.on("disconnect", function () {
            //Find which room they belong to
            let roomKey = 0;
            for (let keys1 in gameRooms) {
                for (let keys2 in gameRooms[keys1]) {
                    Object.keys(gameRooms[keys1][keys2]).map((el) => {
                        if (el === socket.id) { roomKey = keys1 }
                    });
                }
            }

            const roomInfo = gameRooms[roomKey];
            if (roomInfo) {
                console.log("user disconnected: ", socket.id);
                // remove this player from our players object
                delete roomInfo.players[socket.id];
                // update numPlayers
                roomInfo.numPlayers = Object.keys(roomInfo.players).length;
                // emit a message to all players to remove this player
                io.to(roomKey).emit("disconnected", {
                    playerId: socket.id,
                    numPlayers: roomInfo.numPlayers,
                });
                //ADD some logic to delete rooms if there are no more players and it's not saved??
            }
        });


        //ROOM KEY CODE LOGIC:
        // get a random code for the waiting room
        socket.on("getRoomCode", async function () {
            let key = codeGenerator();
            while (Object.keys(gameRooms).includes(key)) {
                key = codeGenerator();
            }
            gameRooms[key] = {
                roomKey: key,
                players: {},
                numPlayers: 0,
                placedCats: []
            };
            console.log("KEY", key)
            socket.emit("roomCreated", key);
        });
        socket.on("isKeyValid", function (input) {
            Object.keys(gameRooms).includes(input)
                ? socket.emit("keyIsValid", input)
                : socket.emit("keyNotValid");
        });


        //FIREBASE verification
        socket.on("isUserValid", function (input) {
            // input username & password?
            firebase.auth().signInWithEmailAndPassword(
                input.username,
                input.password
            ).then(() => {
                const user = firebaseApp.auth().currentUser;
                if (user != null) {
                    var name = user.displayName;
                    var email = user.email;
                    var photoUrl = user.photoURL;
                } // send back user obj
                socket.emit("userLoginSuccess", { name, email, photoUrl })
            }
            ).catch(function (error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log(error)
            });
            // ).then(user => {
            //     console.log("THIS IS OUR USER", user)
            // }).catch(err => {
            //     console.log(err)
            // })
            // if (user !== undefined) {
            //
            // } else {
            // socket.emit("UserNotValid")
            // }
        })


        //PLAYING CATS/ UPDATING SOCKETS:
        socket.on('catPlayed', function (args) {
            const { x, y, selectedDropZone, socketId, roomKey } = args
            console.log(args)
            const cat = {
                dropZone: selectedDropZone,
                cat: 'cat'
            }
            // const currentCats = gameRooms[roomKey].placedCats
            // currentCats.push(cat)
            console.log('gameroom, args', gameRooms[roomKey])
            io.emit('catPlayedUpdate', args);
        });
    });
};

function codeGenerator() {
    let code = "";
    let chars = "ABCDEFGHJKLMNPQRSTUVWXYZ123456789";
    for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
