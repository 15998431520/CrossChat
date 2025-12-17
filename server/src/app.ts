// server/src/app.ts
import express from 'express';
import cors from 'cors';
import parseRoute from './routes/parseRoute';
import executeRoute from './routes/executeRoute'; // ✅ 新增

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', parseRoute);
app.use('/api', executeRoute); // ✅ 挂载新路由

export default app;