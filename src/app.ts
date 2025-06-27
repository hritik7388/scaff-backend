import express from 'express';
import 'reflect-metadata';
import 'dotenv/config';
import cors from 'cors';
import morgan from 'morgan';
// import routes from './routes/routes';
import { errorMiddleware } from './middlewares/errorMiddleware';
import { Server } from 'socket.io';
import http from 'http';
const app = express();
const PORT = process.env.PORT ;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.set('io', io);
// app.use('/api', routes);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});








export default app;
