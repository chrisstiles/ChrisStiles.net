import path from 'path';
import express, { Express, Request, Response } from 'express';
import fs from 'fs';
import { execSync } from 'child_process';
import compression from 'compression';
import forceDomain from 'forcedomain';
import gatsbyExpress from 'gatsby-plugin-express';
import 'colors';

export class Server {
  private app: Express;

  constructor(app: Express) {
    this.app = app;

    this.app.use(
      forceDomain({
        hostname: 'www.chrisstiles.net',
        protocol: 'https'
      })
    );

    const clientPath = path.resolve('./', 'client');
    const publicPath = `${clientPath}/public`;
    const cachePath = `${clientPath}/.cache`;
    const pageRoutesPath = `${clientPath}/gatsby-routes.json`;

    // Build client app if routes file doesn't exist
    if (!fs.existsSync(pageRoutesPath)) {
      execSync(
        `rm -rf ${cachePath} ${publicPath} && npm run build --prefix client`,
        { stdio: 'inherit' }
      );
    }

    this.app.use(compression());
    this.app.use(express.static(publicPath));
    this.app.use(
      gatsbyExpress(pageRoutesPath, {
        publicDir: publicPath,
        template: `${publicPath}/404/index.html`,
        redirectSlashes: true
      })
    );

    this.app.get('/api/test', (req: Request, res: Response): void => {
      res.send('You have reached the API!!');
    });
  }

  public start(port: number): void {
    this.app.listen(port, () =>
      console.log(`\nServer listening on port ${port}!\n`.green)
    );
  }
}
