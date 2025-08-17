// Configuration file for Agora settings
const CONFIG = {
    // These will be set by the server
    appId: null,
    token: null,
    
    // RTC settings
    rtc: {
        mode: 'rtc', // 'rtc' for communication, 'live' for live streaming
        codec: 'vp8' // 'vp8', 'h264', 'vp9'
    },
    
    // RTM settings
    rtm: {
        enableLogUpload: false,
        logLevel: 'ERROR' // 'ERROR', 'WARN', 'INFO', 'DEBUG'
    },
    
    // Audio/Video settings
    media: {
        audio: {
            encoderConfig: 'music_standard', // 'music_standard', 'speech_standard', 'music_standard_stereo'
            sampleRate: 48000,
            bitrate: 48
        },
        video: {
            encoderConfig: '1080p_1', // '120p_1', '240p_1', '360p_1', '480p_1', '720p_1', '1080p_1'
            bitrate: 1000,
            frameRate: 15
        }
    },
    
    // Game settings
    game: {
        canvasWidth: 500,
        canvasHeight: 350,
        blockSize: 20,
        colors: [
            '#FF6B6B', // Red
            '#4ECDC4', // Teal
            '#45B7D1', // Blue
            '#96CEB4', // Green
            '#FFEAA7', // Yellow
            '#DDA0DD', // Plum
            '#98D8C8', // Mint
            '#F7DC6F'  // Gold
        ]
    }
};
