# Court of Shadows

A real-time multiplayer social deduction game inspired by political intrigue and hidden roles. Players are divided between **Loyalists** trying to maintain order and **Conspirators** seeking to overthrow the kingdom.

![Court of Shadows](public/images/logo.png)

## Features

- **5-10 players** real-time multiplayer
- **WebSocket-based** for instant communication
- **Three distinct roles**: Loyalists, Conspirators, and the Usurper
- **Executive powers** that unlock as the game progresses
- **Veto system** in late game
- **Customizable game settings**
- **Responsive design** for desktop and mobile
- **Player authentication** with sessions
- **Kick/Ban system** for hosts
- **Reconnection support** if disconnected

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js, Express
- **WebSocket**: ws library
- **Database**: PostgreSQL
- **Authentication**: bcrypt for password hashing

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/Court-of-Shadows.git
cd Court-of-Shadows
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up PostgreSQL

Create a new database:

```sql
CREATE DATABASE courtdb;
CREATE USER appuser WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE courtdb TO appuser;
```

### 4. Configure environment variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=courtdb
DB_USER=appuser
DB_PASSWORD=your_password
```

### 5. Initialize the database

The database tables will be created automatically when you start the server for the first time.

### 6. Start the server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The game will be available at `http://localhost:3000`

## Project Structure

```
Court-of-Shadows/
├── public/                 # Frontend files
│   ├── css/
│   │   └── style.css      # Styles
│   ├── images/
│   │   └── logo.png       # Game logo
│   ├── js/
│   │   ├── client.js      # Main client logic
│   │   ├── boards.js      # Game boards configuration
│   │   └── constants.js   # Shared constants
│   ├── index.html         # Main HTML file
│   └── ads.txt            # Google AdSense verification
├── server/
│   ├── server.js          # Express + WebSocket server
│   ├── Game.js            # Game logic
│   ├── GameManager.js     # Game instances manager
│   ├── auth.js            # Authentication logic
│   └── db.js              # Database connection
├── shared/
│   └── constants.js       # Shared constants (client & server)
├── .env.example           # Environment variables template
├── package.json
└── README.md
```

## Game Rules

### Roles

| Players | Loyalists | Conspirators | Usurper |
|---------|-----------|--------------|---------|
| 5       | 3         | 1            | 1       |
| 6       | 4         | 1            | 1       |
| 7       | 4         | 2            | 1       |
| 8       | 5         | 2            | 1       |
| 9       | 5         | 3            | 1       |
| 10      | 6         | 3            | 1       |

### Victory Conditions

**Loyalists win if:**
- 5 Royal Edicts are enacted
- The Usurper is executed

**Conspirators win if:**
- 6 Plots are enacted
- The Usurper becomes Chancellor after 3 Plots

### Game Flow

1. **King nominates a Chancellor**
2. **All players vote** (Yes/No)
3. **If approved**: Legislative session begins
4. **King draws 3 cards**, discards 1, passes 2 to Chancellor
5. **Chancellor discards 1**, enacts the other
6. **Executive power** may activate (depending on board state)

### Executive Powers

| Plots | 5-6 Players | 7-8 Players | 9-10 Players |
|-------|-------------|-------------|--------------|
| 1     | -           | -           | Investigate  |
| 2     | -           | Investigate | Investigate  |
| 3     | Peek        | Special Election | Special Election |
| 4     | Execution   | Execution   | Execution    |
| 5     | Execution + Veto | Execution + Veto | Execution + Veto |

## Game Settings

- **Conspirators know Usurper**: Conspirators can see who the Usurper is
- **Usurper knows allies**: Usurper can see who the Conspirators are
- **Limited knowledge** (9-10 players): Each Conspirator only knows one ally
- **Previous King ineligible**: The previous King cannot be nominated as Chancellor

## API Routes

| Route | Description |
|-------|-------------|
| `/` or `/home` | Lobby |
| `/login` | Login page |
| `/register` | Registration page |
| `/rules` | Game rules |
| `/room/:code` | Waiting room |
| `/game/:code` | Active game |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Author

Created by **KiSsWave**

---

**Court of Shadows** - A game of intrigue and betrayal
