class App {
    constructor() {
        this.videoManager = new VideoManager();
        this.gameManager = new GameManager();
        this.rtmManager = new RTMManager();
        this.isConnected = false;
        
        this.setupEventHandlers();
        this.setupCanvasResize();
    }

    setupCanvasResize() {
        // Resize canvas to fit available space
        this.resizeCanvas();
        
        // Add window resize listener
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
    }

    resizeCanvas() {
        const canvas = document.getElementById('gameCanvas');
        const gameContainer = document.querySelector('.game-container');
        
        if (canvas && gameContainer) {
            const containerRect = gameContainer.getBoundingClientRect();
            const maxWidth = containerRect.width - 30; // Account for padding
            const maxHeight = containerRect.height - 100; // Account for game info
            
            // Calculate aspect ratio
            const aspectRatio = CONFIG.game.canvasWidth / CONFIG.game.canvasHeight;
            
            let newWidth = maxWidth;
            let newHeight = maxWidth / aspectRatio;
            
            // If height is too large, scale down
            if (newHeight > maxHeight) {
                newHeight = maxHeight;
                newWidth = maxHeight * aspectRatio;
            }
            
            // Set canvas size
            canvas.style.width = `${newWidth}px`;
            canvas.style.height = `${newHeight}px`;
            
            // Update config for game logic
            CONFIG.game.canvasWidth = newWidth;
            CONFIG.game.canvasHeight = newHeight;
        }
    }

    setupEventHandlers() {
        const joinBtn = document.getElementById('joinBtn');
        const leaveBtn = document.getElementById('leaveBtn');
        const channelNameInput = document.getElementById('channelName');
        const userNameInput = document.getElementById('userName');
        const muteBtn = document.getElementById('muteBtn');
        const videoBtn = document.getElementById('videoBtn');

        joinBtn.addEventListener('click', () => this.joinChannel());
        leaveBtn.addEventListener('click', () => this.leaveChannel());
        muteBtn.addEventListener('click', () => this.toggleMute());
        videoBtn.addEventListener('click', () => this.toggleVideo());

        // Allow Enter key to join
        [channelNameInput, userNameInput].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.joinChannel();
                }
            });
        });
    }

    async joinChannel() {
        const channelName = document.getElementById('channelName').value.trim();
        const userName = document.getElementById('userName').value.trim();

        if (!channelName || !userName) {
            alert('Please enter both channel name and user name');
            return;
        }

        try {
            // Update UI
            document.getElementById('joinBtn').disabled = true;
            document.getElementById('joinBtn').textContent = 'Joining...';

            // Set configuration
            CONFIG.channelName = channelName;
            CONFIG.userName = userName;
            CONFIG.uid = Math.floor(Math.random() * 100000);

            // Get token from server
            const response = await fetch('/generate-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    channelName: channelName,
                    uid: CONFIG.uid
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get token');
            }

            const data = await response.json();
            CONFIG.appId = data.appId;
            CONFIG.token = data.token;

                        // Initialize managers
            const videoSuccess = await this.videoManager.initialize();
            const rtmSuccess = await this.rtmManager.initialize();

            if (videoSuccess) {
                // Add current user to game
                this.gameManager.setCurrentUser(CONFIG.uid);
                this.gameManager.addUser(CONFIG.uid, CONFIG.userName);
                this.gameManager.startGameLoop();

                // Start username monitoring
                this.videoManager.startUsernameMonitoring();

                // Send user joined message if RTM is available
                if (rtmSuccess) {
                    this.rtmManager.sendUserJoined(CONFIG.uid, CONFIG.userName);
                    // Also send current game state to all users
                    setTimeout(() => {
                        this.rtmManager.sendGameState();
                    }, 500);
                } else {
                    // If RTM is disabled, try to exchange usernames through a different mechanism
                    this.exchangeUsernameWithoutRTM();
                }

                // Update UI
                document.getElementById('joinBtn').disabled = true;
                document.getElementById('leaveBtn').disabled = false;
                document.getElementById('muteBtn').disabled = false;
                document.getElementById('videoBtn').disabled = false;
                document.getElementById('connectionStatus').textContent = rtmSuccess ? 'Connected' : 'Connected (RTM disabled)';
                if (document.getElementById('rtmStatus')) {
                    document.getElementById('rtmStatus').textContent = rtmSuccess ? 'Connected' : 'Disabled';
                }
                this.isConnected = true;

                console.log('Successfully joined channel' + (rtmSuccess ? '' : ' (RTM disabled)'));
            } else {
                throw new Error('Failed to initialize video');
            }

        } catch (error) {
            console.error('Failed to join channel:', error);
            alert('Failed to join channel: ' + error.message);
            
            // Reset UI
            document.getElementById('joinBtn').disabled = false;
            document.getElementById('joinBtn').textContent = 'Join Channel';
        }
    }

    async leaveChannel() {
        try {
            await this.videoManager.leave();
            await this.rtmManager.leave();

            // Reset game
            this.gameManager.blocks.clear();
            this.gameManager.render();

            // Update UI
            document.getElementById('joinBtn').disabled = false;
            document.getElementById('joinBtn').textContent = 'Join Channel';
            document.getElementById('leaveBtn').disabled = true;
            document.getElementById('muteBtn').disabled = true;
            document.getElementById('videoBtn').disabled = true;
            document.getElementById('userCount').textContent = '0';
            document.getElementById('currentUserId').textContent = '-';
            document.getElementById('connectionStatus').textContent = 'Disconnected';
            document.getElementById('networkQuality').textContent = '-';
            if (document.getElementById('rtmStatus')) {
                document.getElementById('rtmStatus').textContent = 'Disabled';
            }

            this.isConnected = false;
            console.log('Successfully left channel');

        } catch (error) {
            console.error('Failed to leave channel:', error);
        }
    }

    exchangeUsernameWithoutRTM() {
        // Since RTM is disabled, we'll use a simple approach
        // We'll update the local video display to show our username
        // and hope the other user can see it
        if (this.videoManager) {
            this.videoManager.setOwnUsernameInVideo();
        }
        
        // Also update our own block name
        if (window.gameManager && window.gameManager.blocks.has(CONFIG.uid)) {
            const block = window.gameManager.blocks.get(CONFIG.uid);
            block.userName = CONFIG.userName;
            window.gameManager.render();
        }
        
        // Start checking for other users' usernames
        this.startUsernameDiscovery();
    }

    startUsernameDiscovery() {
        // Check for usernames of other users every 500ms
        setInterval(() => {
            this.discoverUsernames();
        }, 500);
    }

    discoverUsernames() {
        // Check all connected users for their usernames
        if (this.videoManager && this.videoManager.remoteUsers) {
            this.videoManager.remoteUsers.forEach((videoItem, uid) => {
                // Try to get username from video element
                const userInfo = videoItem.querySelector('.user-info');
                if (userInfo) {
                    const currentName = userInfo.textContent;
                    const storedName = this.videoManager.getUserNameForUid(uid);
                    
                    // Skip if it's still detecting or a generic user name
                    if (currentName === 'Loading...' || currentName === 'Detecting...' || currentName.startsWith('User ')) {
                        return;
                    }
                    
                    // If the name has changed and it's a real username
                    if (currentName !== storedName && currentName.length > 0) {
                        console.log(`Username discovered for ${uid}: ${currentName}`);
                        this.videoManager.setUserNameForUid(uid, currentName);
                        
                        // Update the game block
                        if (window.gameManager && window.gameManager.blocks.has(uid)) {
                            const block = window.gameManager.blocks.get(uid);
                            block.userName = currentName;
                            window.gameManager.render();
                            console.log(`Updated game block for ${uid} to: ${currentName}`);
                        }
                    }
                }
            });
        }
    }

    toggleMute() {
        if (this.videoManager.localAudioTrack) {
            if (this.videoManager.localAudioTrack.muted) {
                this.videoManager.localAudioTrack.setMuted(false);
                document.getElementById('muteBtn').textContent = '🔇 Mute';
            } else {
                this.videoManager.localAudioTrack.setMuted(true);
                document.getElementById('muteBtn').textContent = '🔊 Unmute';
            }
        }
    }

    toggleVideo() {
        if (this.videoManager.localVideoTrack) {
            if (this.videoManager.localVideoTrack.enabled) {
                this.videoManager.localVideoTrack.setEnabled(false);
                document.getElementById('videoBtn').textContent = '📹 Enable Video';
            } else {
                this.videoManager.localVideoTrack.setEnabled(true);
                document.getElementById('videoBtn').textContent = '📹 Disable Video';
            }
        }
    }

}

// Global debug functions
function toggleDebug() {
    const debugPanel = document.getElementById('debugPanel');
    if (debugPanel) {
        debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
    }
}

function testRTM() {
    if (window.rtmManager && window.rtmManager.isConnected) {
        console.log('Testing RTM connection...');
        window.rtmManager.sendGameUpdate({
            uid: window.gameManager ? window.gameManager.currentUserId : 999,
            x: 100,
            y: 100
        });
        alert('RTM test message sent! Check console for details.');
    } else {
        alert('RTM not connected! Check the debug panel for status.');
    }
}

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    window.videoManager = window.app.videoManager;
    window.gameManager = window.app.gameManager;
    window.rtmManager = window.app.rtmManager;
});
