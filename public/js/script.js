let socket = io();
let typingTimer;
let userNames;
let typingnameSet = new Set();
var typingName = "";
let roomName, roomPassword, roomPurpose;
var audio = new Audio('/..//music/ding.mp3');



// First we get the viewport height and we multiple it by 1% to get a value for a vh unit
let vh = window.innerHeight * 0.01;
// Then we set the value in the --vh custom property to the root of the document
document.documentElement.style.setProperty('--vh', `${vh}px`);


function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}


//room banabo, user table maintain
//room details logged
const roomCatcher = () => {
    $('#roomJoin').modal({ dismissible: false }).modal('open');
    document.getElementById('room_name').focus();
    $("#roomForm").submit((e) => {
        e.preventDefault();
        var roomPrompt = $('#room_name').val();
        var roomPass = $('#room_pass').val();
        var roomPur = $('#room_purpose').val();
        if (roomPrompt.trim() != "" && roomPass.trim() != "") {
            roomName = roomPrompt;
            roomPassword = roomPass;
            roomPurpose = roomPur;
            if (roomPurpose == 2) {
                socket.emit('roomjoin', { 'name': roomName, 'password': roomPassword, 'purpose': roomPurpose });
                socket.on('nameChecker', function(nameFlag) {
                    if (nameFlag == 1) {
                        alert('Room exists, enter another room name');
                        return false;
                    } else if (nameFlag == 2) {
                        $('#roomJoin').modal('close');
                        $('#nameAccept').modal({ dismissible: false }).modal('open');
                        usernameCatcher();
                    }
                })
            } else if (roomPurpose == 1) {
                socket.emit('roomjoin', { 'name': roomName, 'password': roomPassword, 'purpose': roomPurpose });
                socket.on('passcheck', function(passFlag) {
                    if (passFlag == 2) {
                        alert('Please correct password for the room');
                        return false;
                    } else if (passFlag == 1) {
                        $('#roomJoin').modal('close');
                        $('#nameAccept').modal({ dismissible: false }).modal('open');
                        usernameCatcher();
                    } else if (passFlag == 3) {
                        alert('Room doesn\'t exist');
                        return false;
                    }
                })
            }
        } else {
            alert('Please enter Room name and Password.');
            return false;
        }

    });
}

//username details logged
const usernameCatcher = () => {
    document.getElementById('full_name').focus();
    $("#nameForm").submit((e) => {
        e.preventDefault();
        var namePrompt = $('#full_name').val();
        if (namePrompt.trim() == "") {
            alert('Please enter Username');
            return false;
        } else {
            userNames = namePrompt;
            socket.emit('is_online', userNames);
        }
        if (!/Mobi|Android/i.test(navigator.userAgent)) {
            toggleFullScreen();
        }
        $('#nameAccept').modal('close');
        document.getElementById('userResponse').focus();
    });
};

//page loads
$(document).ready(function() {
    //initiators materialize
    $('.modal').modal();
    $('select').formSelect();

    //functioncall for modals
    roomCatcher();

    //online pop up modal
    $("#headerName").on("click", () => {
        $('#online').modal('open');
    });

    document.getElementById("formChat").focus();

    //user message logged
    $("#formChat").submit((e) => {
        e.preventDefault();
        let userResponse = $("#userResponse").val();
        socket.emit('message', {
            'usernames': userNames,
            'response': $('#userResponse').val()
        });
        $("#userResponse").val("");
        timeoutFunction();
        return false;
    });

    //typing prompt
    $("#userResponse").on('input', () => {
        socket.emit('typingFunction', {
            'usernames': userNames,
            'function': ' is typing...   '
        });
    });
    $("#userResponse").keyup(() => {
        clearTimeout(typingTimer);
        timeoutFunction();
    });
    const timeoutFunction = () => {
        typingTimer = setTimeout(() => {
            socket.emit('typingFunction', {
                'usernames': userNames,
                'function': "remove"
            });
        }, 1000);
    }
});

//from server online pop up
socket.on('is_online', (onlinePrompt) => {
    $('#is_online').text("");
    onlinePrompt.forEach(function(entry) {
        $('#is_online').append("<li>" + entry.name + "</li><br>");
    });
});

//from server typing pop up
socket.on('typingFunction', function(typing) {
    if (typing.length == 0) {
        $('#typingPrompt').text("");
    } else if (typing.length != 0) {
        typing.forEach(function(entry) {
            typingName = typingName.concat(entry + ", ");
        });
        $('#typingPrompt').text(typingName + " is typing .... ");
        typingName = "";
    }
});

//from server user message
socket.on('message', function(msg) {
    if (msg.response.trim() != "") {
        if (msg.usernames == userNames) {
            $('#displayChat').append("<li class='ownli'> <p style=' color:#" + msg.color + ";'>" + msg.usernames + ":</p>" + msg.response + "</li><br>");
        } else {
            audio.play();
            $('#displayChat').append("<li  class='displayli'> <p style='color:#" + msg.color + ";'>" + msg.usernames + ":</p>" + msg.response + "</li><br>");
        }
        $('#displayChat').scrollTop($('#displayChat')[0].scrollHeight);
    }
});




//powershell code .