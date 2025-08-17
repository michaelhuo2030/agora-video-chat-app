class RTMManager {
    constructor() {
        this.client = null;
        this.channel = null;
        this.isConnected = false;
        this.messageCount = 0;
    }

    async initialize() {
        try {
            // Check if RTM SDK is available
            if (typeof AgoraRTM === 'undefined') {
                console.error('AgoraRTM SDK is not loaded');
                return false;
            }

            // Create RTM client with proper configuration
            this.client = AgoraRTM.createInstance(CONFIG.appId, {
                enableLogUpload: CONFIG.rtm.enableLogUpload
            });
            
            // Login with proper parameters
            await this.client.login({ 
                uid: CONFIG.uid.toString() 
            });
            
            // Create and join channel
            this.channel = this.client.createChannel(CONFIG.channelName);
            await this.channel.join();
            
            // Get existing members in the channel
            const members = await this.channel.getMembers();
            console.log('Existing channel members:', members);
            
            this.setupEventHandlers();
            this.isConnected = true;
            
            // Send user joined message to notify existing members
            this.sendUserJoined(CONFIG.uid, CONFIG.userName);
            
            // If there are existing members, request their game state
            if (members.length > 1) {
                console.log('Existing members found, requesting game state...');
                setTimeout(() => {
                    this.requestGameState();
                }, 2000);
            }
            
            return true;
        } catch (error) {
            console.error('Failed to initialize RTM:', error);
            return false;
        }
    }

    setupEventHandlers() {
        // Handle channel messages
        this.channel.on('ChannelMessage', (message, memberId) => {
            console.log('RTM Message received:', message, 'from:', memberId);
            try {
                const data = JSON.parse(message.text);
                this.handleMessage(data, memberId);
            } catch (error) {
                console.error('Failed to parse message:', error);
            }
        });

        // Handle member joined
        this.channel.on('MemberJoined', (memberId) => {
            console.log('RTM Member joined:', memberId);
            
            // If this is a new member (not us), send our game state to them
            if (memberId !== CONFIG.uid.toString()) {
                setTimeout(() => {
                    this.sendGameState();
                }, 1000);
            }
        });

        // Handle member left
        this.channel.on('MemberLeft', (memberId) => {
            console.log('RTM Member left:', memberId);
            if (window.gameManager) {
                window.gameManager.removeUser(parseInt(memberId));
            }
        });

        // Handle connection state changes
        this.client.on('ConnectionStateChanged', (newState, reason) => {
            console.log('RTM Connection state changed:', newState, 'Reason:', reason);
        });
    }

    handleMessage(data, memberId) {
        console.log('Handling RTM message:', data.type, 'from:', memberId);
        switch (data.type) {
            case 'game_update':
                if (window.gameManager) {
                    window.gameManager.updateBlockPosition(data.uid, data.x, data.y);
                }
                break;
            case 'game_state':
                if (window.gameManager) {
                    data.blocks.forEach(block => {
                        window.gameManager.addUser(block.uid, block.userName);
                        window.gameManager.updateBlockPosition(block.uid, block.x, block.y);
                    });
                }
                break;
            case 'user_joined':
                // Store the user name for future reference
                if (window.videoManager) {
                    window.videoManager.setUserNameForUid(data.uid, data.userName);
                }
                if (window.gameManager) {
                    window.gameManager.addUser(data.uid, data.userName);
                }
                break;
            case 'request_game_state':
                // Someone is requesting our game state, send it to them
                console.log('Received game state request from:', memberId);
                this.sendGameState();
                break;
        }
    }

    sendGameUpdate(update) {
        if (!this.isConnected) {
            console.log('RTM not connected, cannot send game update');
            return;
        }

        const message = {
            type: 'game_update',
            ...update
        };

        console.log('Sending RTM game update:', message);
        this.channel.sendMessage({ text: JSON.stringify(message) }).then(() => {
            console.log('Game update sent successfully');
            this.messageCount++;
        }).catch((error) => {
            console.error('Failed to send game update:', error);
        });
    }

    sendGameState() {
        if (!this.isConnected || !window.gameManager) {
            console.log('Cannot send game state - RTM not connected or game manager not available');
            return;
        }

        const blocks = Array.from(window.gameManager.blocks.values());
        const message = {
            type: 'game_state',
            blocks: blocks
        };

        console.log('Sending RTM game state:', message);
        this.channel.sendMessage({ text: JSON.stringify(message) }).then(() => {
            console.log('Game state sent successfully');
            this.messageCount++;
        }).catch((error) => {
            console.error('Failed to send game state:', error);
        });
    }

    sendUserJoined(uid, userName) {
        if (!this.isConnected) {
            console.log('RTM not connected, cannot send user joined message');
            return;
        }

        const message = {
            type: 'user_joined',
            uid: uid,
            userName: userName
        };

        console.log('Sending user joined message:', message);
        this.channel.sendMessage({ text: JSON.stringify(message) }).then(() => {
            console.log('User joined message sent successfully');
        }).catch((error) => {
            console.error('Failed to send user joined message:', error);
        });
    }

    requestGameState() {
        if (!this.isConnected) {
            console.log('RTM not connected, cannot request game state');
            return;
        }

        const message = {
            type: 'request_game_state',
            uid: CONFIG.uid
        };

        console.log('Requesting game state from other users');
        this.channel.sendMessage({ text: JSON.stringify(message) }).then(() => {
            console.log('Game state request sent successfully');
        }).catch((error) => {
            console.error('Failed to send game state request:', error);
        });
    }

    async leave() {
        if (this.channel) {
            await this.channel.leave();
        }
        if (this.client) {
            await this.client.logout();
        }
        this.isConnected = false;
    }
}
