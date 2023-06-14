require('dotenv').config();
const config = require('./config');
const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const mongoose = require('mongoose');
const passport = require('passport')
const LocalStrategy = require('passport-local')
const flash = require('connect-flash')
const User = require('./models/user')
const Conversation = require('./models/conversation')
const logger = require('./utils/logger')

const userRoutes = require('./routes/users');
const streamRoutes = require('./routes/streaming');
const chartsRoutes = require('./routes/charts')
const conversationRoutes = require('./routes/conversation')
const messageRoutes = require('./routes/message')
const templateRoutes = require('./routes/templates')


mongoose.connect(config.mongodbURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, 'connection error'));
db.once("open", () => {
  console.log("Database connected");
})


const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


if (!config.production) {
  console.log('cors')
  app.use(cors({
    origin: config.reactURL, // This should match the origin of your React app.
    credentials: true,
  }));
}

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  store: new MemoryStore({
    checkPeriod: 86400000 // 1 day
  })
}));

app.use(flash())

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error')
  next();
})

app.get('/api', async (req, res) => {
  logger.debug('---------------GET request /')
  //console.log(req.user)
  //console.log(req.session)
  let conversations;
  //req.session.tempConvs = req.session.tempConvs || [] //store conversations for non-login users
  // console.log('tempConvs')
  // console.log(req.session.tempConvs)
  if (req.isAuthenticated()) {
    console.log('authenticated')
    conversations = await Conversation.find({ user: req.user._id, deleted: false, archived: false }).sort({ add_time: -1 })
    res.json({ conversations, user: req.user })
  } else {
    console.log('no login')
    res.json({ conversations: [], user: { _id: '', username: '' } })
  }
});

app.use('/api', userRoutes)
app.use('/api/streaming', streamRoutes)
app.use('/api/charts', chartsRoutes)
app.use('/api/conversation', conversationRoutes)
app.use('/api/message', messageRoutes)
app.use('/api/templates', templateRoutes)



if (config.production) {
  console.log('serve static react files')
  app.use(express.static(path.join(__dirname, 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});
