import path from 'path';
import express, { Express, Request, Response } from 'express';
import compression from 'compression';
import gatsbyExpress from 'gatsby-plugin-express';
import redirectWWW from 'express-naked-redirect';

export class Server {
  private app: Express;

  constructor(app: Express) {
    this.app = app;

    const publicPath = path.resolve('./') + '/client/public';

    this.app.use(compression());
    this.app.use(express.static(publicPath));

    if (process.env.NODE_ENV === 'production') {
      this.app.use(redirectWWW());
    }

    this.app.get('/api', (req: Request, res: Response): void => {
      res.send('You have reached the API!');
    });

    this.app.use(
      gatsbyExpress(path.resolve('./') + '/build/routes.json', {
        publicDir: publicPath,
        template: `${publicPath}/404/index.html`,
        redirectSlashes: true
      })
    );
  }

  public start(port: number): void {
    this.app.listen(port, () =>
      console.log(`Server listening on port ${port}!`)
    );
  }
}
