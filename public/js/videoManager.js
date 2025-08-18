class VideoManager {
    constructor() {
        this.client = null;
        this.localAudioTrack = null;
        this.localVideoTrack = null;
        this.remoteUsers = new Map();
        this.userNames = new Map(); // uid -> userName mapping
        this.isJoined = false;
        this.videoCounter = 0; // To alternate between left and right panels
    }

    async initialize() {
        try {
            console.log('🎥 Initializing video manager...');
            console.log('📋 Config:', { 
                appId: CONFIG.appId, 
                channelName: CONFIG.channelName, 
                uid: CONFIG.uid,
                hasToken: !!CONFIG.token 
            });

            // Check browser compatibility first
            if (!AgoraRTC.checkSystemRequirements()) {
                throw new Error('Browser does not support Agora RTC');
            }

            // Create client with proper configuration
            this.client = AgoraRTC.createClient({ 
                mode: CONFIG.rtc.mode, 
                codec: CONFIG.rtc.codec 
            });
            
            console.log('✅ Agora client created successfully');
            
            // Set up event handlers BEFORE joining
            this.setupEventHandlers();
            
            console.log('🔗 Joining channel...');
            // Join channel with proper parameters
            await this.client.join(CONFIG.appId, CONFIG.channelName, CONFIG.token, CONFIG.uid);
            console.log('✅ Successfully joined channel');
            
            console.log('🎤 Creating audio track...');
            // Create local tracks with proper configuration
            this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
                encoderConfig: CONFIG.media.audio.encoderConfig,
                sampleRate: CONFIG.media.audio.sampleRate,
                bitrate: CONFIG.media.audio.bitrate
            });
            console.log('✅ Audio track created');
            
            console.log('📹 Creating video track...');
            this.localVideoTrack = await AgoraRTC.createCameraVideoTrack({
                encoderConfig: CONFIG.media.video.encoderConfig,
                bitrate: CONFIG.media.video.bitrate,
                frameRate: CONFIG.media.video.frameRate
            });
            console.log('✅ Video track created');
            
            console.log('📤 Publishing tracks...');
            // Publish tracks
            await this.client.publish([this.localAudioTrack, this.localVideoTrack]);
            console.log('✅ Tracks published successfully');
            
            // Add local video to grid
            this.addLocalVideo();
            
            this.isJoined = true;
            console.log('🎉 Video manager initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize video:', error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                code: error.code,
                stack: error.stack
            });
            return false;
        }
    }

    addLocalVideo() {
        // Add local video to the left panel
        const videoGrid = document.getElementById('leftVideoGrid');
        const videoItem = document.createElement('div');
        videoItem.className = 'video-item';
        videoItem.id = 'local-video';
        
        videoItem.innerHTML = `
            <video autoplay muted></video>
            <div class="user-info">${CONFIG.userName}</div>
        `;
        
        videoGrid.appendChild(videoItem);
        this.localVideoTrack.play(videoItem.querySelector('video'));
    }

    async leave() {
        if (this.localAudioTrack) {
            this.localAudioTrack.close();
        }
        if (this.localVideoTrack) {
            this.localVideoTrack.close();
        }
        
        await this.client.leave();
        this.isJoined = false;
        
        // Clear video grids
        document.getElementById('leftVideoGrid').innerHTML = '';
        document.getElementById('rightVideoGrid').innerHTML = '';
        this.remoteUsers.clear();
    }

    setupEventHandlers() {
        // Handle user publishing streams
        this.client.on('user-published', async (user, mediaType) => {
            console.log('User published:', user.uid, mediaType);
            try {
                await this.client.subscribe(user, mediaType);
                console.log('Successfully subscribed to:', user.uid, mediaType);
                
                if (mediaType === 'video') {
                    this.addRemoteVideo(user);
                }
                if (mediaType === 'audio') {
                    user.audioTrack.play();
                }
            } catch (error) {
                console.error('Failed to subscribe to user:', user.uid, mediaType, error);
            }
        });

        // Handle user unpublishing streams
        this.client.on('user-unpublished', (user, mediaType) => {
            console.log('User unpublished:', user.uid, mediaType);
            if (mediaType === 'video') {
                this.removeRemoteVideo(user);
            }
        });

        // Handle user joining
        this.client.on('user-joined', (user) => {
            console.log('User joined:', user.uid);
            this.updateUserCount();
            
            // Notify game manager about new user
            if (window.gameManager) {
                // Create a temporary block with "Detecting..." name
                // This will be updated when we get the real username
                window.gameManager.addUser(user.uid, 'Detecting...');
                
                // If RTM is disabled, try to get username from the video element
                if (!window.rtmManager || !window.rtmManager.isConnected) {
                    // Check for username updates periodically
                    setTimeout(() => {
                        this.updateUserNameFromVideo(user.uid);
                    }, 1000);
                    setTimeout(() => {
                        this.updateUserNameFromVideo(user.uid);
                    }, 3000);
                    setTimeout(() => {
                        this.updateUserNameFromVideo(user.uid);
                    }, 5000);
                    
                    // Also force a username check after video is added
                    setTimeout(() => {
                        this.monitorUsernameChanges();
                    }, 2000);
                }
            }
        });

        // Handle user leaving
        this.client.on('user-left', (user) => {
            console.log('User left:', user.uid);
            this.removeRemoteVideo(user);
            this.updateUserCount();
            
            // Notify game manager about user leaving
            if (window.gameManager) {
                window.gameManager.removeUser(user.uid);
            }
        });

        // Handle connection state changes
        this.client.on('connection-state-change', (curState, prevState, reason) => {
            console.log('Connection state changed:', prevState, '->', curState, 'Reason:', reason);
            document.getElementById('connectionStatus').textContent = curState;
        });

        // Handle network quality
        this.client.on('network-quality', (stats) => {
            console.log('Network quality:', stats);
            const quality = this.getNetworkQualityText(stats.downlinkNetworkQuality);
            document.getElementById('networkQuality').textContent = quality;
        });
    }

    addRemoteVideo(user) {
        // Alternate between left and right panels
        const isLeftPanel = this.videoCounter % 2 === 0;
        const videoGrid = document.getElementById(isLeftPanel ? 'leftVideoGrid' : 'rightVideoGrid');
        
        const videoItem = document.createElement('div');
        videoItem.className = 'video-item';
        videoItem.id = `remote-video-${user.uid}`;
        
        // Show a temporary name while we detect the real one
        videoItem.innerHTML = `
            <video autoplay></video>
            <div class="user-info">Detecting...</div>
        `;
        
        videoGrid.appendChild(videoItem);
        user.videoTrack.play(videoItem.querySelector('video'));
        this.remoteUsers.set(user.uid, videoItem);
        
        // Increment counter for next video
        this.videoCounter++;
        
        // Start aggressive username detection
        this.startAggressiveUsernameDetection(user.uid);
    }

    startAggressiveUsernameDetection(uid) {
        // Simple approach: Since we can't reliably detect usernames without RTM,
        // let's use a simple naming convention based on join order
        console.log(`Starting username detection for ${uid}`);
        
        // Get all connected users (including local user)
        const allUsers = Array.from(this.remoteUsers.keys()).concat([CONFIG.uid]);
        allUsers.sort((a, b) => a - b); // Sort by UID
        
        // Find the position of this user in the sorted list
        const userIndex = allUsers.indexOf(uid);
        const userName = `Player${userIndex + 1}`;
        
        console.log(`Assigned username for ${uid}: ${userName}`);
        
        // Update both video display and game block
        this.setUserNameForUid(uid, userName);
        this.updateVideoDisplay(uid, userName);
        this.updateGameBlock(uid, userName);
    }

    updateVideoDisplay(uid, userName) {
        const videoItem = document.getElementById(`remote-video-${uid}`);
        if (videoItem) {
            const userInfo = videoItem.querySelector('.user-info');
            if (userInfo) {
                userInfo.textContent = userName;
                console.log(`Updated video display for ${uid} to: ${userName}`);
            }
        }
    }

    updateGameBlock(uid, userName) {
        if (window.gameManager && window.gameManager.blocks.has(uid)) {
            const block = window.gameManager.blocks.get(uid);
            block.userName = userName;
            window.gameManager.render();
            console.log(`Updated game block for ${uid} to: ${userName}`);
        }
    }

    removeRemoteVideo(user) {
        const videoItem = document.getElementById(`remote-video-${user.uid}`);
        if (videoItem) {
            videoItem.remove();
            this.remoteUsers.delete(user.uid);
        }
    }

    updateUserCount() {
        const count = this.remoteUsers.size + 1; // +1 for local user
        document.getElementById('userCount').textContent = count;
    }

    getConnectedUsers() {
        return Array.from(this.remoteUsers.keys());
    }

    getNetworkQualityText(quality) {
        switch(quality) {
            case 1: return 'Excellent';
            case 2: return 'Good';
            case 3: return 'Poor';
            case 4: return 'Bad';
            case 5: return 'Very Bad';
            case 6: return 'Down';
            default: return 'Unknown';
        }
    }

    getUserNameForUid(uid) {
        return this.userNames.get(uid) || `User ${uid}`;
    }

    setUserNameForUid(uid, userName) {
        this.userNames.set(uid, userName);
    }

    updateUserNameFromVideo(uid) {
        const videoItem = document.getElementById(`remote-video-${uid}`);
        if (videoItem) {
            const userInfo = videoItem.querySelector('.user-info');
            if (userInfo) {
                const currentText = userInfo.textContent;
                
                // Skip if it's still detecting or a generic user name
                if (currentText === 'Loading...' || currentText === 'Detecting...' || currentText.startsWith('User ')) {
                    return;
                }
                
                // If we found a real username, update everything
                if (currentText && currentText.length > 0) {
                    console.log(`Found username for ${uid}: ${currentText}`);
                    this.setUserNameForUid(uid, currentText);
                    this.updateVideoDisplay(uid, currentText);
                    
                    // Update the game block name
                    if (window.gameManager && window.gameManager.blocks.has(uid)) {
                        const block = window.gameManager.blocks.get(uid);
                        block.userName = currentText;
                        window.gameManager.render();
                        console.log(`Updated game block for ${uid} to: ${currentText}`);
                    }
                }
            }
        }
    }

    // Method to set our own username in the video display for others to see
    setOwnUsernameInVideo() {
        const localVideo = document.getElementById('local-video');
        if (localVideo) {
            const userInfo = localVideo.querySelector('.user-info');
            if (userInfo) {
                userInfo.textContent = CONFIG.userName;
            }
        }
    }

    // Start monitoring for username changes in video elements
    startUsernameMonitoring() {
        setInterval(() => {
            this.monitorUsernameChanges();
        }, 500); // Check every 500ms for faster detection
    }

    // Monitor all video elements for username changes
    monitorUsernameChanges() {
        // Check all remote video elements
        this.remoteUsers.forEach((videoItem, uid) => {
            const userInfo = videoItem.querySelector('.user-info');
            if (userInfo) {
                const currentName = userInfo.textContent;
                const storedName = this.getUserNameForUid(uid);
                
                // Skip if it's still detecting or a generic user name
                if (currentName === 'Loading...' || currentName === 'Detecting...' || currentName.startsWith('User ')) {
                    return;
                }
                
                // If the name has changed and it's a real username
                if (currentName !== storedName && currentName.length > 0) {
                    console.log(`Username updated for ${uid}: ${currentName}`);
                    this.setUserNameForUid(uid, currentName);
                    
                    // Update the game block name
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
