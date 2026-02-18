import 'dotenv/config';
import { buildApp } from './app';

const app = buildApp();

app.listen(
  { port: parseInt(process.env.PORT ?? '3000'), host: '0.0.0.0' },
  (err, address) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
    app.log.info(`Servidor rodando em ${address}`);
  }
);
