class Chat {
    constructor() {
        this.wrapper = document.getElementById('mainWrapper');
        this.enterScreen = document.getElementById('enterScreen');
        this.pageLoader = document.getElementById('pageLoader');

        this.nameInput = document.getElementById('enterUserName');
        this.nicknameInput = document.getElementById('enterNickName');
        this.esButton = document.getElementById('enterScreenButton');

        this.userSide = document.getElementById('userSide');
        this.bodyChat = document.getElementById('messageWrapper');

        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendMessage');

        this.infoCrib = document.getElementById('infoCrib');
        this.infoCribText = document.getElementById('infoCribText');

        this.userObj = {
            name: null,
            nickname: null,
            enterChat: false,
            messages: [],
            users: []
        };
        this.canScroll = true;

        this.eventInit();
        this.onPageLoad();

        this.pretendSocket();

    }

    pretendSocket() {

        const interval = setInterval(async () => {
            if(!this.userObj.enterChat)
                return;
            
            const data = await this.apiSession();

            if(data.status == 200) {
                this.userObj.enterChat = true;
                this.enterChat();
                if(!data.data.msgs || data.data.msgs.length < 1) {
                    this.userObj.users = data.data.users;
                    this.insertUsers();
                    return;
                }
                // console.log(data.data.msgs[data.data.msgs.length - 1].time);
                // console.log(this.userObj.messages[this.userObj.messages.length - 1].time);
                if(data.data.msgs[data.data.msgs.length - 1].time == this.userObj.messages[this.userObj.messages.length - 1].time)
                {
                    this.userObj.users = data.data.users;
                    this.insertUsers();
                    return;
                }
                // this.getCookies();
                // 
                this.userObj.messages = data.data.msgs;
                this.userObj.users = data.data.users;
                this.insertMessages();
                // 
            }
            else if(data.status == 400) {
                this.userObj.enterChat = false;
                this.exitChat();
                clearInterval(interval);
            }
        }, 1000);

    }

    async onPageLoad() {
        this.pageLoader.className = 'page-loader shown';    // show loader

        const data = await this.apiSession();
        
        if(data.status == 200) {
            this.userObj.enterChat = true;
            this.enterChat();
            this.getCookies();
            // 
            this.userObj.messages = data.data.msgs;
            this.userObj.users = data.data.users;
            this.insertMessages();
            // 
        }
        else if(data.status == 400) {
            this.userObj.enterChat = false;
            this.exitChat();
        }

        this.pageLoader.className = 'page-loader';          // hide loader
    }

    eventInit() {
        this.esButton.addEventListener('click', () => this.handleEsButton());
        this.sendButton.addEventListener('click', () => this.handleMessageSend());

        this.bodyChat.addEventListener('scroll', function(e) {
            console.log(this.canScroll);
            this.canScroll = false;
        })
    }
    
    async handleEsButton() {
        if(!this.nameInput.value || !this.nicknameInput.value)
            return this.handleError('Please, fill your info to proceed.');

        if(this.nameInput.value.length > 12 || this.nicknameInput.value.length > 12)
            return this.handleError('Name and Nickname shouldn\'t be greated than 12 characters');

        else if(this.nameInput.value.length < 4 || this.nicknameInput.value.length < 4)
            return this.handleError('Name and Nickname must be at least 4 characters long.');

        const user = {
            name: this.nameInput.value,
            nickname: this.nicknameInput.value
        }

        let data = await this.apiSession({ user: user });
        if(data.status == 200) {
            this.userObj.name = this.nameInput.value;
            this.userObj.nickname = this.nicknameInput.value;
            this.userObj.enterChat = true;

            this.userObj.messages = data.data.msgs;
            this.userObj.users = data.data.users;

            this.enterChat();
            this.setCookies();
            this.insertMessages();
        }
        else if(data.status == 400) {
            this.userObj.enterChat = false;
            this.handleError('Incorrect user name or nickname.')
        }
    }

    async handleMessageSend() {
        if(!this.messageInput.value.length)
            return this.handleError('Your message is too short.');

        const message = {
            msg: this.messageInput.value
        }

        this.messageInput.value = null;

        let data = await this.apiSession(message, '/api/msg');
        
        this.userObj.messages = data.data.msgs;
        this.userObj.users = data.data.users;
        
        console.log(data);

        this.insertMessages();
    }

    enterChat() {
        if(this.userObj.enterChat === false)
            return console.log('error: { oserObj.enterChat: false }');
        
        this.wrapper.className = 'wrapper';
        this.enterScreen.className = 'user-enterscreen-wrapper non-displayed';
    }

    exitChat() {
        if(this.userObj.enterChat === true)
            return console.log('error: { oserObj.enterChat: true }');
        
        this.wrapper.className = 'wrapper blured';
        this.enterScreen.className = 'user-enterscreen-wrapper';
    }

    async apiSession(myData, url) {
        var myInit = {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        }

        let url_ = url || '/api/session'

        if(myData)
            myInit.body = JSON.stringify(myData);

        var dataObj = {};

        await fetch(url_, myInit)
            .then((response) => {
                console.log(response);
                
                dataObj.status = response.status;
                return response.json();
            })
            .then((data) => {
                dataObj.data = data;
            });

        return dataObj;
    }

    insertMessages() {
        if(!this.userObj.messages || this.userObj.messages.length < 1)
            return console.log('No messages to return!');

        this.bodyChat.innerHTML = '';
        const len = this.userObj.messages.length;
        
        for(let i = len - 1; i >= 0; i--) {

            const msgTime = this.userObj.messages[i].time;
            // const parsedTime = new Date(msgTime).getHours() + ':' + new Date(msgTime).getMinutes();
            const parsedTime = new Date(msgTime).toLocaleTimeString();

            let el = document.createElement('li');
            el.className = 'message';
            el.innerHTML = 
                `
                <strong><h2>${this.userObj.messages[i].name}</h2><h3>@${this.userObj.messages[i].senderNickname}</h3></strong>
                <span>${parsedTime}</span>
                <p>${this.userObj.messages[i].body}</p>
            `;

            if(this.userObj.messages[i].senderNickname == this.userObj.nickname)
                el.className = 'message mine-msg';

            if(this.userObj.messages[i].body.includes(this.userObj.nickname))
                el.lastElementChild.innerHTML = this.userObj.messages[i].body.replace('@' + this.userObj.nickname, '<span class="highlight-adver">@'+ this.userObj.nickname +'</span>');
            
            this.bodyChat.insertBefore(el, this.bodyChat.children[0]);

            if(i == 0) {
                el.style.marginTop = (this.bodyChat.scrollHeight - (this.bodyChat.children[len - 1].offsetTop) + 24) + 'px';
                console.log(this.bodyChat.scrollHeight - (this.bodyChat.children[len - 1].offsetTop) + 24);
                el.style.border = 'none';
            } else {
                continue;
            }
        
            if(this.canScroll) {
                this.bodyChat.scrollTop = this.bodyChat.scrollHeight;
            }
            this.insertUsers();
        }
    }

    insertUsers() {
        if(!this.userObj.users || this.userObj.users.length < 1)
            return console.log('no users in userObj');

        this.userSide.innerHTML = '';

        for(let user of this.userObj.users) {
            let el = document.createElement('li');
            el.className = 'user-aside';

            el.innerHTML = `
                <strong>${user.name}</strong>
                <span>${user.nickname}</span>
            `;
            this.userSide.insertBefore(el, null);
        }
        return
    }

    setCookies() {
        this.deleteAllCookies();
        document.cookie = `nickname=${this.userObj.nickname}`;
    }
    
    getCookies() {
        var cookies = document.cookie.split(";");
        var nicknamespace = [];
        for(let cook of cookies) {
            if(cook.includes('nickname')) {
                nicknamespace.push(cook);
            }
        }
        nicknamespace = nicknamespace.join("").split("=");
        let nickname = nicknamespace[1];
        this.userObj.nickname = nickname;
    }

    deleteAllCookies() {
        var cookies = document.cookie.split(";");
    
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i];
            var eqPos = cookie.indexOf("=");
            var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
    }
    
    handleError(error) {
        this.infoCrib.style.top = '50px';
        this.infoCribText.innerText = error;
        setTimeout(() => {
            this.infoCrib.style.top = '-200px';
            this.infoCribText.innerText = '';
        }, 3000);
    }
}

var chat = new Chat();