let socket = io();
let typingTimer;
let userNames;
let typingnameSet = new Set();
var typingName = "";



var siteWidth = 100;
var scale = screen.width / siteWidth;

document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=' + siteWidth + ', initial-scale=' + scale + '');


const usernameCatcher = () => {
    let loaderPrompt = prompt("Enter your name : ", "your name here");
    userNames = loaderPrompt;
    //console.log(userNames);
};

document.onload = usernameCatcher();


$(document).ready(function() {
    $("#formChat").submit((e) => {
        e.preventDefault();
        let userResponse = $("#userResponse").val();
        socket.emit('username', userNames);
        socket.emit('message', $('#userResponse').val());
        $('#displayChat').scrollTop($('#displayChat')[0].scrollHeight);
        $("#userResponse").val("");
        timeoutFunction();
        return false;
    });



    $("#userResponse").keypress(() => {
        socket.emit('typingUsername', {
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
            socket.emit('typingUsername', {
                'usernames': userNames,
                'function': "remove"
            });
        }, 1000);
    }
});


socket.on('typingUsername', function(typing) {
    if (typing.length == 0) {
        $('#typingPrompt').text("");
    } else if (typing.length != 0) {
        console.log(typing);
        typing.forEach(function(entry) {
            typingName = typingName.concat(" " + entry);
        });
        console.log("This is the one:  " + typingName);
        //console.log(typing.length);
        $('#typingPrompt').text(typingName + " is typing .... ");
        typingName = "";
    }
});

socket.on('username', function(username) {
    $('#displayChat').append(username);
});

socket.on('message', function(msg) {
    $('#displayChat').append(":    " + msg + "<br>");
});




//powershell code .