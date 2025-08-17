# Agora Video Chat Game

A group video chat application with a simple multiplayer game built using Agora RTC and RTM.

## Features

- **Group Video Chat**: Real-time video conferencing using Agora RTC with high-quality audio/video
- **Multiplayer Game**: Simple block movement game where each user controls a colored block
- **User Identification**: Each user gets a unique colored block in the game with their name
- **Real-time Synchronization**: Game state is synchronized across all users using Agora RTM
- **Media Controls**: Mute/unmute audio and enable/disable video
- **Connection Monitoring**: Real-time connection status and network quality indicators
- **Responsive Design**: Works on desktop and mobile devices
- **Advanced Configuration**: Configurable audio/video quality settings

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Agora

1. Create an account at [Agora Console](https://console.agora.io)
2. Create a new project and get your App ID and App Certificate
3. Copy `env.example` to `.env` and fill in your credentials:

```bash
cp env.example .env
```

Edit `.env`:
```
AGORA_APP_ID=your_app_id_here
AGORA_APP_CERTIFICATE=your_app_certificate_here
PORT=3000
```

### 3. Run the Application

```bash
npm start
```

The application will be available at `http://localhost:3000`

## How to Use

1. **Join a Channel**: Enter a channel name and your username, then click "Join Channel"
2. **Video Chat**: Your camera and microphone will be enabled automatically
3. **Play the Game**: Use arrow keys to move your colored block around the canvas
4. **Multiplayer**: Other users in the same channel will see your block and you'll see theirs
5. **Leave**: Click "Leave Channel" to disconnect

## Game Controls

- **Arrow Up**: Move block up
- **Arrow Down**: Move block down
- **Arrow Left**: Move block left
- **Arrow Right**: Move block right

## Media Controls

- **Mute Button**: Toggle audio on/off
- **Video Button**: Toggle video on/off

## Technical Details

### Architecture

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js with Express
- **Video**: Agora RTC SDK for Web
- **Real-time Communication**: Agora RTM SDK for Web
- **Game Engine**: HTML5 Canvas with custom game loop

### Key Components

- `VideoManager`: Handles video/audio streams and user management
- `GameManager`: Manages the game state and rendering
- `RTMManager`: Handles real-time messaging for game synchronization
- `App`: Main application controller

### Security

- Token-based authentication for Agora services
- Server-side token generation to protect App Certificate
- HTTPS recommended for production deployment

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

MIT License
