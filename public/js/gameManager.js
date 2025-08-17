class GameManager {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.blocks = new Map(); // uid -> block data
        this.currentUserId = null;
        this.colorIndex = 0;
        this.keys = {};
        
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // Keyboard event handlers
        document.addEventListener('keydown', (e) => {
            // Prevent default behavior for arrow keys to avoid page scrolling
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
            this.keys[e.key] = true;
            this.handleKeyPress(e.key);
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }

    handleKeyPress(key) {
        if (!this.currentUserId || !this.blocks.has(this.currentUserId)) return;

        const block = this.blocks.get(this.currentUserId);
        const speed = 5;

        switch(key) {
            case 'ArrowUp':
                block.y = Math.max(0, block.y - speed);
                break;
            case 'ArrowDown':
                block.y = Math.min(this.canvas.height - CONFIG.game.blockSize, block.y + speed);
                break;
            case 'ArrowLeft':
                block.x = Math.max(0, block.x - speed);
                break;
            case 'ArrowRight':
                block.x = Math.min(this.canvas.width - CONFIG.game.blockSize, block.x + speed);
                break;
        }

        // Send updated position to other users
        if (window.rtmManager && window.rtmManager.isConnected) {
            console.log('Sending game update:', { uid: this.currentUserId, x: block.x, y: block.y });
            window.rtmManager.sendGameUpdate({
                uid: this.currentUserId,
                x: block.x,
                y: block.y
            });
        } else {
            console.log('RTM not connected, cannot send game update');
        }
    }

    addUser(uid, userName) {
        if (this.blocks.has(uid)) return;

        const color = CONFIG.game.colors[this.colorIndex % CONFIG.game.colors.length];
        this.colorIndex++;

        const block = {
            uid: uid,
            userName: userName,
            x: Math.random() * (this.canvas.width - CONFIG.game.blockSize),
            y: Math.random() * (this.canvas.height - CONFIG.game.blockSize),
            color: color
        };

        this.blocks.set(uid, block);
        this.render();
    }

    removeUser(uid) {
        this.blocks.delete(uid);
        this.render();
    }

    updateBlockPosition(uid, x, y) {
        if (this.blocks.has(uid)) {
            const block = this.blocks.get(uid);
            block.x = x;
            block.y = y;
            this.render();
        }
    }

    setCurrentUser(uid) {
        this.currentUserId = uid;
        document.getElementById('currentUserId').textContent = uid;
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background grid
        this.drawGrid();

        // Draw all blocks
        this.blocks.forEach((block, uid) => {
            this.drawBlock(block, uid === this.currentUserId);
        });
    }

    drawGrid() {
        this.ctx.strokeStyle = '#e2e8f0';
        this.ctx.lineWidth = 1;

        // Vertical lines
        for (let x = 0; x <= this.canvas.width; x += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        // Horizontal lines
        for (let y = 0; y <= this.canvas.height; y += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawBlock(block, isCurrentUser) {
        // Draw block
        this.ctx.fillStyle = block.color;
        this.ctx.fillRect(block.x, block.y, CONFIG.game.blockSize, CONFIG.game.blockSize);

        // Draw border for current user
        if (isCurrentUser) {
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(block.x, block.y, CONFIG.game.blockSize, CONFIG.game.blockSize);
        }

        // Draw user name
        this.ctx.fillStyle = '#000';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            block.userName || `User ${block.uid}`,
            block.x + CONFIG.game.blockSize / 2,
            block.y - 5
        );
    }

    startGameLoop() {
        setInterval(() => {
            this.render();
        }, 16); // ~60 FPS
    }
}
