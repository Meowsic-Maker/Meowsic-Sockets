const gameRooms = {
    // [roomKey]: {
    // placedCats: [],
    // users: [],
    // randomTasks: [],
    // scores: [],
    // gameScore: 0,
    // players: {},
    // numPlayers: 0
    // }
}

const firebase = require('firebase/app')
const firebaseConfig = require("../../src/firebase/firebaseConfig")
require('firebase/auth');
// import firebase from "firebase/app";
// import { auth } from 'firebase/app';
// import 'firebase/auth';        // for authentication
// import 'firebase/database';    // database
// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);

module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log(
            `A socket connection to the server has been made: ${socket.id}`
        );
        socket.on("joinRoom", (roomKey) => {
            socket.join(roomKey);

            const roomInfo = gameRooms[roomKey];

            roomInfo.players[socket.id] = {
                //here is where we are creating a player state with current player info
                playerId: socket.id,
            };

            // update number of players
            roomInfo.numPlayers = Object.keys(roomInfo.players).length;
            console.log("roomInfo", roomInfo);
            // set initial state
            socket.emit("setState", roomInfo);

        });

        socket.on('catPlayed', function (gameObject) {
            io.emit('catPlayed', gameObject);
        });


        // when a player disconnects, remove them from our players object
        socket.on("disconnect", function () {
            //find which room they belong to
            let roomKey = 0;
            for (let keys1 in gameRooms) {
                for (let keys2 in gameRooms[keys1]) {
                    Object.keys(gameRooms[keys1][keys2]).map((el) => {
                        if (el === socket.id) {
                            roomKey = keys1;
                        }
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
            }
        });

        socket.on("isKeyValid", function (input) {
            Object.keys(gameRooms).includes(input)
                ? socket.emit("keyIsValid", input)
                : socket.emit("keyNotValid");
        });
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
            };
            console.log("KEY", key)
            socket.emit("roomCreated", key);
        });

        //FIREBASE verification
        socket.on("isUserValid", function (input) {
            // input username & password?
            console.log(input)
            firebase.auth().signInWithEmailAndPassword(
                input.username,
                input.password
                ).then( () => {
                   const user = firebaseApp.auth().currentUser;
                if (user != null) {
                    var name = user.displayName;
                    var email = user.email;
                    var photoUrl = user.photoURL;
                    // var emailVerified = user.emailVerified;
                    // var uid = user.uid;
                } // send back user obj
                socket.emit("userLoginSuccess", { name, email, photoUrl})
                console.log("HERE IS OUR USER!", user.email)
                }
                )
                .catch(function(error) {
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
    });
};

function codeGenerator() {
    let code = "";
    let chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
    for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
